import type { SVGProps } from 'react';
import { useId } from 'react';

interface IconSvgProps extends SVGProps<SVGSVGElement> {
  height?: number;
  size?: number;
  width?: number;
}

export function CourseroadIcon({ height, size = 20, width, ...props }: IconSvgProps) {
  const gradientId = useId();

  return (
    <svg
      height={size || height}
      viewBox='0 0 20 20'
      width={size || width}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g fill='none'>
        <path
          d='M12.859 2.567a1 1 0 0 1 .574 1.292l-5 13a1 1 0 1 1-1.866-.718l5-13a1 1 0 0 1 1.292-.574'
          fill={`url(#${gradientId})`}
        />
        <path
          d='M6.15 5.74a1 1 0 0 1 .11 1.41L3.816 10l2.442 2.85a1 1 0 0 1-1.518 1.3l-3-3.5a1 1 0 0 1 0-1.3l3-3.5a1 1 0 0 1 1.41-.11'
          fill={`url(#${gradientId})`}
        />
        <path
          d='M13.74 7.15a1 1 0 0 1 1.52-1.3l3 3.5a1 1 0 0 1 0 1.3l-3 3.5a1 1 0 0 1-1.52-1.3L16.184 10z'
          fill={`url(#${gradientId})`}
        />
        <defs>
          <linearGradient id={gradientId} gradientUnits='userSpaceOnUse' x1={2} x2={19} y1={1.5} y2={18}>
            <stop stopColor='#006fee' />
            <stop offset={1} stopColor='#029fd5' />
          </linearGradient>
        </defs>
      </g>
    </svg>
  );
}
