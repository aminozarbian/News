import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  let userRole = 'user';
  
  if (token) {
    try {
      const decoded = jwt.decode(token);
      userRole = decoded?.role || 'user';
    } catch (e) {
      // invalid token, default to user
    }
  }

  return (
    <DashboardLayoutClient userRole={userRole}>
      {children}
    </DashboardLayoutClient>
  );
}
