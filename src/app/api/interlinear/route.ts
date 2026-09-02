import { NextResponse } from 'next/server';
import { callBibleMcpTool } from '@/lib/bibleMcp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { error: 'reference query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const text = await callBibleMcpTool('get_interlinear', { reference });
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Interlinear error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interlinear data' },
      { status: 500 },
    );
  }
}
