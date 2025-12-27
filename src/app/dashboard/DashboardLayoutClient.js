'use client';

import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ThemeToggleIconButton from '@/components/ThemeToggleIconButton';
import { appTheme } from '@/theme';

function DashboardToolbarActions() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'isLoggedIn=; Max-Age=0; path=/;';
    router.refresh();
    router.push('/login');
  };

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <ThemeToggleIconButton />
      <Button color="inherit" onClick={handleLogout} size="small">
        خروج
      </Button>
    </Stack>
  );
}

export default function DashboardLayoutClient({ children, userRole }) {
  const isAdmin = userRole === 'admin';

  const navigation = React.useMemo(() => {
    const nav = [
      { segment: 'dashboard/news', title: 'مدیریت خبرها', icon: <NewspaperOutlinedIcon /> },
    ];
    
    if (isAdmin) {
      nav.push({ segment: 'dashboard/users', title: 'مدیریت کاربران', icon: <PeopleAltOutlinedIcon /> });
    }
    return nav;
  }, [isAdmin]);

  return (
    <NextAppProvider navigation={navigation} branding={{ title: 'سامانه خبری', homeUrl: '/dashboard/news' }} theme={appTheme} modeStorageKey="mui-mode">
      <DashboardLayout slots={{ toolbarActions: DashboardToolbarActions }}>
        {children}
      </DashboardLayout>
    </NextAppProvider>
  );
}

