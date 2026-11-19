import { ImageResponse } from 'next/og';

import { globalData } from '@/lib/config/data';
import { COLORS } from '@/lib/constants/colors';

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
        background: `linear-gradient(135deg, ${COLORS.hex['zinc-950']} 0%, ${COLORS.hex['zinc-900']} 50%, ${COLORS.hex['zinc-950']} 100%)`,
        color: COLORS.white,
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
