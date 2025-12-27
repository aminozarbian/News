'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggleIconButton from '@/components/ThemeToggleIconButton';
import Logo from '@/components/Logo';
import jwt from 'jsonwebtoken';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);

  // Function to check login status
  const checkLoginStatus = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      try {
        const decoded = jwt.decode(token.split('=')[1]);
        setIsLoggedIn(true);
        setUserRole(decoded?.role);
      } catch (e) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  React.useEffect(() => {
    // Check initially
    checkLoginStatus();

    // Check periodically to catch cookie changes
    const interval = setInterval(checkLoginStatus, 1000);
    
    // Add event listener for custom event
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, [pathname]); // Re-check on route change

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'isLoggedIn=; Max-Age=0; path=/;';
    setIsLoggedIn(false);
    router.refresh();
    router.push('/login');
  };

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1200, bgcolor: '#0f172a' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Logo sx={{ width: 160, height: 50 }} />
          </Link>
        </Box>

        {isLoggedIn ? (
          <>
            {(userRole === 'admin' || userRole === 'author') && (
              <Button color="inherit" component={Link} href="/dashboard">
                داشبورد
              </Button>
            )}
            <ThemeToggleIconButton color="inherit" sx={{ ml: 0.5 }} />
            <Button color="inherit" onClick={handleLogout}>
              خروج
            </Button>
          </>
        ) : (
          <>
            <ThemeToggleIconButton color="inherit" sx={{ ml: 0.5 }} />
            <Button color="inherit" component={Link} href="/login">
              ورود
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

