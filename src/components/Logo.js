import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export default function Logo(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 300 100" sx={{ width: 150, height: 50, ...props.sx }}>
      {/* Circuit lines top */}
      <path
        d="M20 40 H100 V20 H120 V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="20" cy="40" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="120" cy="10" r="3" fill="currentColor" opacity="0.7" />

      <path
        d="M180 10 V30 H220 V40 H280"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="180" cy="10" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="280" cy="40" r="3" fill="currentColor" opacity="0.7" />
      
      <path
        d="M140 15 V35"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="140" cy="15" r="3" fill="currentColor" opacity="0.7" />

      {/* Text */}
      <text
        x="150"
        y="65"
        textAnchor="middle"
        fill="currentColor"
        fontSize="38"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        TECHPULSE
      </text>

      {/* Circuit lines bottom */}
      <path
        d="M50 75 V85 H120"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="50" cy="75" r="3" fill="currentColor" opacity="0.7" />
      
      <path
        d="M180 85 H250 V75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="250" cy="75" r="3" fill="currentColor" opacity="0.7" />

      <path
        d="M150 75 V90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
       <circle cx="150" cy="90" r="3" fill="currentColor" opacity="0.7" />

    </SvgIcon>
  );
}

