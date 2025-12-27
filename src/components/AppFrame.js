'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AppFrame({ children }) {
  const pathname = usePathname();
  
  // Dashboard uses Toolpad's own shell, so we avoid rendering the global Navbar there.
  const hideNavbar = pathname?.startsWith('/dashboard');
  const isHomePage = pathname === '/';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main style={{ padding: (hideNavbar || isHomePage) ? 0 : 20 }}>{children}</main>
    </>
  );
}


