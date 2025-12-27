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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

const passwordIsValid = (pwd) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [currentId, setCurrentId] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  const [form, setForm] = React.useState({ 
    firstName: '', 
    lastName: '', 
    username: '', 
    password: '', 
    role: 'user' 
  });

  const [roles, setRoles] = React.useState([]);

  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (mountedRef.current && data.success) {
        setRoles(data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error fetching users');
        setUsers(Array.isArray(data.data) ? data.data : []);
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
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleOpenModal = (item) => {
    setError('');
    setSuccess('');
    setCurrentId(item._id);
    setForm({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      username: item.username || '',
      password: '',
      role: item.role || 'user',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!form.firstName || !form.lastName || !form.username) {
      setError('تمام فیلدها الزامی هستند');
      return;
    }

    if (form.password && !passwordIsValid(form.password)) {
      setError('رمز عبور باید شامل حروف بزرگ، عدد و کاراکتر خاص باشد');
      return;
    }

    setLoading(true);
    try {
      const payloadData = {
        id: currentId,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        role: form.role,
      };
      if (form.password) payloadData.password = form.password;

      const payload = encryptData(payloadData);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();

      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error updating user');
        setSuccess('کاربر بروزرسانی شد');
        setModalOpen(false);
        fetchUsers();
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
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();

      if (mountedRef.current) {
        if (!res.ok) throw new Error(data.message || 'Error deleting user');
        setSuccess('کاربر حذف شد');
        setDeleteDialogOpen(false);
        setDeleteId(null);
        fetchUsers();
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

  const columns = React.useMemo(() => [
    { 
      field: 'fullName', 
      headerName: 'نام کامل', 
      flex: 1, 
      minWidth: 200,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`
    },
    { field: 'username', headerName: 'نام کاربری', minWidth: 150 },
    { 
      field: 'role', 
      headerName: 'نقش', 
      width: 120,
      renderCell: (params) => <Chip label={params.value} color={params.value=="admin"?"success":params.value=="author"?"warning":"default"} size="small" />
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
          <Tooltip title="ویرایش">
            <IconButton size="small" color="primary" onClick={() => handleOpenModal(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row._id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], []);

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
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">مدیریت کاربران</Typography>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
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
        <DialogTitle>ویرایش کاربر</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="نام"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="نام خانوادگی"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="نام کاربری"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>نقش</InputLabel>
            <Select
              value={form.role}
              label="نقش"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role.name}>
                  {role.description || role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            type="password"
            label="رمز عبور جدید (اختیاری)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText="تنها در صورت تغییر پر کنید"
          />
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
          <Typography>آیا از حذف این کاربر اطمینان دارید؟</Typography>
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

