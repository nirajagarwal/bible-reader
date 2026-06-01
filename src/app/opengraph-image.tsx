import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Berean Bible — Read with AI commentary and semantic search';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          backgroundColor: '#FBF6EC',
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(184,146,74,0.18) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(122,46,41,0.12) 0%, transparent 50%)',
          fontFamily: 'Georgia, serif',
          color: '#1F1A14',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: '#7A2E29',
              color: '#B8924A',
              fontSize: 46,
              fontWeight: 700,
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            B
          </div>
          <div
            style={{
              color: '#7A2E29',
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            Berean Bible
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.05,
              color: '#1F1A14',
              letterSpacing: '-0.01em',
            }}
          >
            Read Scripture with
            <br />
            <span style={{ color: '#7A2E29', fontStyle: 'italic' }}>insight</span>
            <span style={{ color: '#1F1A14' }}>.</span>
          </div>
          <div
            style={{
              width: 120,
              height: 4,
              backgroundColor: '#B8924A',
            }}
          />
          <div
            style={{
              fontSize: 30,
              color: '#5C5043',
              fontFamily: 'sans-serif',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            In-depth AI commentary on every verse, with semantic search to surface related passages across the canon.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            fontSize: 22,
            color: '#5C5043',
            borderTop: '1px solid #E7DCC4',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#B8924A', fontWeight: 700, letterSpacing: '0.05em' }}>bereanbible.online</span>
          </div>
          <div style={{ color: '#5C5043', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            All 66 books · Old & New Testament
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
