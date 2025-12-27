'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { encryptData } from '@/utils/security';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function RegisterModal({ open, onClose }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordIsValid = (pwd) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!passwordIsValid(formData.password)) {
        setError('رمز عبور باید حداقل ۸ کاراکتر، یک حرف بزرگ، یک عدد و یک علامت داشته باشد');
        return;
      }

      const payload = encryptData(formData);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.');
      setTimeout(() => {
        onClose();
        // Optionally redirect or reset
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        ثبت نام
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="نام"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            onChange={handleChange}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="نام خانوادگی"
            name="lastName"
            autoComplete="family-name"
            onChange={handleChange}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="نام کاربری"
            name="username"
            onChange={handleChange}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="رمز عبور"
            type="password"
            id="password"
            helperText="حداقل ۸ کاراکتر، یک حرف بزرگ، یک عدد و یک علامت"
            onChange={handleChange}
            size="small"
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ثبت نام
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

