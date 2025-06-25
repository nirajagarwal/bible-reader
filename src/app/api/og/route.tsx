import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'Berean Bible Reader';

    const hasDescription = searchParams.has('description');
    const description = hasDescription
      ? searchParams.get('description')?.slice(0, 280)
      : 'Read with in-depth AI commentary and semantic search.';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            fontFamily: '"Typewriter"',
            padding: '40px',
            border: '20px solid #cbd5e0', 
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#1a202c', 
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.6,
              color: '#4a5568',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
} 