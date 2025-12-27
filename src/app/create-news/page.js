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
import Editor from '@/components/Editor';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function CreateNews() {
  const router = useRouter();
    const [formData, setFormData] = useState({ title: '', content: '', image: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
  
      if (!formData.title || !formData.content) {
        setError('عنوان و متن خبر الزامی است');
        return;
      }
      if (!formData.image) {
        setError('تصویر خبر الزامی است');
        return;
      }

    try {
      const payload = encryptData(formData);

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create news');
      }

      setSuccess('News created successfully!');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          ثبت خبر جدید
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="عنوان خبر"
            name="title"
            autoFocus
            onChange={handleChange}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body1" component="label" sx={{ mb: 1, display: 'block' }}>
              متن خبر
            </Typography>
            <Editor 
              value={formData.content} 
              onChange={(value) => setFormData({ ...formData, content: value })} 
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              آپلود تصویر (PNG, JPG) - الزامی
              <VisuallyHiddenInput
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </Button>
            {formData.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  sx={{ display: 'block', mx: 'auto', mt: 1 }}
                >
                  حذف تصویر
                </Button>
              </Box>
            )}
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ثبت
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

