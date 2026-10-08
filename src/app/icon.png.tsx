import { ImageResponse } from 'next/og';

export const size = {
  height: 32,
  width: 32
};

export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: '#111827',
        color: 'white',
        display: 'flex',
        fontSize: 20,
        fontWeight: 800,
        height: '100%',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      L
    </div>,
    size
  );
}
