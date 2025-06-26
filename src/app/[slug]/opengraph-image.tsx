import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Berean Bible Reader';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const title = 'Berean Bible Reader';
  const description = 'A test image to debug font and rendering issues.';

  const fontData = await fetch(
    'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Regular.ttf'
  ).then((res) => res.arrayBuffer());

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
          padding: '40px',
          border: '20px solid #10b981', // Green border for easy identification
          fontFamily: '"Inter"',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#4b5563',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {description}
        </div>
        <div style={{marginTop: '40px', fontSize: 24, color: '#9ca3af'}}>
            Slug: {params.slug}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
} 