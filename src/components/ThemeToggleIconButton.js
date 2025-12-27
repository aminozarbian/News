'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useColorScheme } from '@mui/material/styles';

export default function ThemeToggleIconButton(props) {
  const { mode, setMode } = useColorScheme();

  const effectiveMode = mode === 'system' ? 'light' : mode;
  const nextMode = effectiveMode === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip title={effectiveMode === 'dark' ? 'حالت روشن' : 'حالت تاریک'} arrow>
      <IconButton
        aria-label="toggle theme"
        onClick={() => setMode(nextMode)}
        size="small"
        sx={{
          verticalAlign: 'middle',
          ...props.sx 
        }}
        {...props}
      >
        {effectiveMode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
