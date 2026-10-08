import type { SVGProps } from 'react';

interface IconSvgProps extends SVGProps<SVGSVGElement> {
  height?: number;
  size?: number;
  width?: number;
}

export function SwissFlagIcon({ height, size = 20, width, ...props }: IconSvgProps) {
  return (
    <svg
      className='shrink-0 overflow-hidden rounded-lg'
      height={size || height}
      viewBox='0 0 32 32'
      width={size || width}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect fill='#D52B1E' height='32' width='32' />
      <rect fill='#FFFFFF' height='6' width='20' x='6' y='13' />
      <rect fill='#FFFFFF' height='20' width='6' x='13' y='6' />
    </svg>
  );
}
