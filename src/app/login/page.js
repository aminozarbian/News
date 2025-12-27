'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { encryptData } from '@/utils/security';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import Link from '@mui/material/Link';
import RegisterModal from '@/components/RegisterModal';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Encrypt sensitive data
      const payload = encryptData(formData);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ورود با خطا مواجه شد');
      }
      
      // Dispatch custom event to update Navbar immediately
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      // Refresh router to update Navbar state
      router.refresh();
      router.push('/');
    } catch (err) { 
      if (err.message.includes('Invalid credentials')) {
        setError('نام کاربری یا رمز عبور اشتباه است');
      } else if (err.message.includes('User not found')) {
        setError('کاربری با این نام کاربری یافت نشد');
      } else if (err.message.includes('Invalid password')) {
        setError('رمز عبور اشتباه است');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          ورود به سیستم
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="نام کاربری"
            name="username"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="رمز عبور"
            type="password"
            id="password"
            onChange={handleChange}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ورود
          </Button>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={(e) => {
                e.preventDefault();
                setRegisterOpen(true);
              }}
            >
              برای ثبت نام اینجا کلیک کنید
            </Link>
          </Box>
        </Box>
      </Box>
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </Container>
  );
}

