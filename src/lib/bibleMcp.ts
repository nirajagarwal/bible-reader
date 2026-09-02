const BIBLE_MCP_URL =
  process.env.BIBLE_MCP_URL || 'https://bible-mcp-server.fly.dev/mcp';

async function mcpPost(
  body: object,
  sessionId?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  return fetch(BIBLE_MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function parseJsonRpc(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('text/event-stream')) {
    const raw = await res.text();
    let payload = '';
    for (const line of raw.split('\n')) {
      if (line.startsWith('data: ')) payload = line.slice(6).trim();
    }
    if (!payload) throw new Error('Empty SSE response from bible-mcp');
    return JSON.parse(payload);
  }
  return res.json();
}

/**
 * Call any tool on the bible-mcp Streamable HTTP server.
 * Returns the concatenated text content from the tool result.
 */
export async function callBibleMcpTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
): Promise<string> {
  // Initialize session
  const initRes = await mcpPost({
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'bereanbible', version: '1.0.0' },
    },
  });

  let sessionId: string | undefined;
  if (initRes.ok) {
    sessionId = initRes.headers.get('Mcp-Session-Id') ?? undefined;
    await initRes.text(); // drain
  }

  // Send initialized notification (fire-and-forget)
  mcpPost(
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    sessionId,
  ).catch(() => {});

  // Call the tool
  const toolRes = await mcpPost(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: toolArgs },
    },
    sessionId,
  );

  if (!toolRes.ok) {
    const errText = await toolRes.text();
    throw new Error(
      `bible-mcp ${toolName} returned ${toolRes.status}: ${errText}`,
    );
  }

  const rpc = await parseJsonRpc(toolRes);

  if (rpc.error) {
    throw new Error(rpc.error.message ?? 'Unknown MCP error');
  }

  const content: Array<{ type: string; text?: string }> =
    rpc.result?.content ?? [];

  return content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('\n');
}
