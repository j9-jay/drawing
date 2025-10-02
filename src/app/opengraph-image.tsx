import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'My Blog - 개발 블로그';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
          My Blog
        </div>
        <div style={{ fontSize: 40, color: '#a0a0a0' }}>
          웹 개발, 프로그래밍, 게임 개발
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
