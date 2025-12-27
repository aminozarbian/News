'use client';

import * as React from 'react';
import { encryptData } from '@/utils/security';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, Toolbar, GridToolbarQuickFilter } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Chip from '@mui/material/Chip';
import jwt from 'jsonwebtoken';
import Editor from '@/components/Editor';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
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

function getUserIdFromToken() {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  if (match) {
    try {
      const decoded = jwt.decode(match[2]);
      return decoded?.id;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getUserRoleFromToken() {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  if (match) {
    try {
      const decoded = jwt.decode(match[2]);
      return decoded?.role || 'user';
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default function NewsPage() {
  const [news, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const [currentUserRole, setCurrentUserRole] = React.useState(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [currentId, setCurrentId] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  const [form, setForm] = React.useState({ title: '', content: '', isMain: false, isHeader: false, editorSelection: false, image: '' });

  // Use a ref to track mounted status to prevent state updates on unmount
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    setCurrentUserId(getUserIdFromToken());
    setCurrentUserRole(getUserRoleFromToken());
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error fetching news');
        setNews(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleOpenModal = (item = null) => {
    setError('');
    setSuccess('');
    if (item) {
      setCurrentId(item._id);
      setForm({ 
        title: item.title, 
        content: item.content, 
        isMain: item.isMain || false, 
        isHeader: item.isHeader || false, 
        editorSelection: item.editorSelection || false,
        image: item.image || '' 
      });
    } else {
      setCurrentId(null);
      setForm({ title: '', content: '', isMain: false, isHeader: false, editorSelection: false, image: '' });
    }
    setModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!form.title || !form.content) {
      setError('عنوان و متن خبر الزامی است');
      return;
    }
    if (!form.image) {
      setError('تصویر خبر الزامی است');
      return;
    }

    setLoading(true);
    try {
      const payload = currentId ? encryptData({ id: currentId, ...form }) : encryptData(form);
      const res = await fetch('/api/news', {
        method: currentId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();

      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error saving news');
        setSuccess('عملیات با موفقیت انجام شد');
        setModalOpen(false);
        fetchNews();
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const payload = encryptData({ id: deleteId });
      const res = await fetch('/api/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();

      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error deleting news');
        setSuccess('خبر حذف شد');
        setDeleteDialogOpen(false);
        setDeleteId(null);
        fetchNews();
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const canEdit = (row) => {
    if (currentUserRole === 'admin') return true;
    return row.author && row.author._id === currentUserId;
  };

  const columns = React.useMemo(() => [
    { field: 'title', headerName: 'عنوان', flex: 1, minWidth: 200 },
    {
      field: 'author',
      headerName: 'نویسنده',
      minWidth: 150,
      valueGetter: (value, row) => row.author ? `${row.author.firstName || ''} ${row.author.lastName || ''}` : 'نامشخص'
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ',
      minWidth: 170,
      valueFormatter: (value) => (value ? new Date(value).toLocaleString('fa-IR') : '-'),
    },
    {
      field: 'isMain',
      headerName: 'سرصفحه',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Chip 
            icon={<CheckCircleOutlineIcon />} 
            label="بله" 
            color="success" 
            size="small" 
            variant="outlined"
          />
        ) : (
          <Chip 
            icon={<HighlightOffIcon />} 
            label="خیر" 
            color="default" 
            size="small" 
            variant="outlined"
          />
        )
      )
    },
    {
      field: 'isHeader',
      headerName: 'هدر صفحه اصلی',
      width: 130,
      renderCell: (params) => (
        params.value ? (
          <Chip 
            icon={<CheckCircleOutlineIcon />} 
            label="بله" 
            color="warning" 
            size="small" 
            variant="outlined"
          />
        ) : (
          <Chip 
            icon={<HighlightOffIcon />} 
            label="خیر" 
            color="default" 
            size="small" 
            variant="outlined"
          />
        )
      )
    },
    {
      field: 'editorSelection',
      headerName: 'منتخب سردبیر',
      width: 130,
      renderCell: (params) => (
        params.value ? (
          <Chip 
            icon={<CheckCircleOutlineIcon />} 
            label="بله" 
            color="info" 
            size="small" 
            variant="outlined"
          />
        ) : (
          <Chip 
            icon={<HighlightOffIcon />} 
            label="خیر" 
            color="default" 
            size="small" 
            variant="outlined"
          />
        )
      )
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        const hasPermission = canEdit(params.row);
        return (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
            <Tooltip title={hasPermission ? "ویرایش" : "عدم دسترسی"}>
              <span>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => handleOpenModal(params.row)}
                  disabled={!hasPermission}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={hasPermission ? "حذف" : "عدم دسترسی"}>
              <span>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleDeleteClick(params.row._id)}
                  disabled={!hasPermission}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [currentUserId, currentUserRole]);

  const getRowId = React.useCallback((row) => row._id, []);
  
  const CustomToolbar = React.useCallback(() => (
    <Toolbar>
      <GridToolbarQuickFilter />
    </Toolbar>
  ), []);

  const slots = React.useMemo(() => ({ toolbar: CustomToolbar }), [CustomToolbar]);
  const slotProps = React.useMemo(() => ({ toolbar: { showQuickFilter: true } }), []);
  const gridSx = React.useMemo(() => ({ border: 0 }), []);

  return (
    <Box sx={{ p: 3 }}>
      {/* ... existing header ... */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">مدیریت خبرها</Typography>
        <Button variant="contained" startIcon={<ArticleOutlinedIcon />} onClick={() => handleOpenModal()}>
          افزودن خبر
        </Button>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={news}
          columns={columns}
          getRowId={getRowId}
          disableRowSelectionOnClick
          slots={slots}
          slotProps={slotProps}
          sx={gridSx}
          loading={loading}
        />
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentId ? 'ویرایش خبر' : 'افزودن خبر'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="عنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body1" component="label" sx={{ mb: 1, display: 'block' }}>
              متن خبر
            </Typography>
            <Editor 
              value={form.content} 
              onChange={(value) => setForm({ ...form, content: value })} 
            />
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isMain}
                onChange={(e) => setForm({ ...form, isMain: e.target.checked })}
              />
            }
            label="در سر صفحه نشان داده شود"
          />

          {currentUserRole === 'admin' && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isHeader}
                    onChange={(e) => setForm({ ...form, isHeader: e.target.checked })}
                  />
                }
                label="نمایش در هدر"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.editorSelection}
                    onChange={(e) => setForm({ ...form, editorSelection: e.target.checked })}
                  />
                }
                label="منتخب سردبیر"
              />
            </>
          )}

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
            {form.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img src={form.image} alt="News Preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                  sx={{ display: 'block', mx: 'auto', mt: 1 }}
                >
                  حذف تصویر
                </Button>
              </Box>
            )}
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تایید حذف</DialogTitle>
        <DialogContent>
          <Typography>آیا از حذف این خبر اطمینان دارید؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={loading}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

