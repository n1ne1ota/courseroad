import { ImageResponse } from 'next/og';

import { globalData } from '@/lib/config/data';

export const size = {
  height: 630,
  width: 1200
};

export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        color: 'white',
        display: 'flex',
        fontSize: 96,
        fontWeight: 800,
        height: '100%',
        justifyContent: 'center',
        letterSpacing: -2,
        width: '100%'
      }}
    >
      {globalData.name}
    </div>,
    size
  );
}
