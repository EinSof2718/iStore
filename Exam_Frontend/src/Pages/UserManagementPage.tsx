import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Tooltip, Avatar, Stack, Card, CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack, Add, Edit, Delete, Search, Refresh,
  AccountCircle, Close,
} from '@mui/icons-material';

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  roles: string[];
  isManager: boolean;
}

interface UserFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  role: string;
}

const emptyForm: UserFormData = {
  email: '',
  fullName: '',
  phoneNumber: '',
  password: '',
  role: 'User',
};

const ROLES = ['User', 'Moderator', 'Manager', 'Admin'];

const roleColor = (role: string) => {
  if (role === 'Admin') return { bgcolor: '#e40f1a', color: 'white' };
  if (role === 'Manager') return { bgcolor: '#1976d2', color: 'white' };
  if (role === 'Moderator') return { bgcolor: 'rgb(20, 235, 49)', color: 'white' };
  return {};
};

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? data.Users ?? data ?? []);
    } catch (e: any) {
      setError('Не удалось загрузить пользователей: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Фильтрация ──────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.phoneNumber?.toLowerCase().includes(q)
    );
  });

  // ── Открыть диалог создания ──────────────────────────────────
  const openCreate = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setFormData(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  // ── Открыть диалог редактирования ───────────────────────────
  const openEdit = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      password: '',
      role: user.roles?.[0] ?? 'User',
    });
    setFormError('');
    setDialogOpen(true);
  };

  // ── Сохранить (создать / обновить) ───────────────────────────
  const handleSave = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      let res: Response;
      if (dialogMode === 'create') {
        res = await fetch('/api/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: formData.email,
            FullName: formData.fullName,
            PhoneNumber: formData.phoneNumber,
            Password: formData.password,
            Role: formData.role,
          }),
        });
      } else {
        res = await fetch(`/api/users/${selectedUser!.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FullName: formData.fullName,
            PhoneNumber: formData.phoneNumber,
            Role: formData.role,
            ...(formData.password ? { Password: formData.password } : {}),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? data.Error ?? data.errors?.join(', ') ?? 'Ошибка сервера');
        return;
      }

      setSuccess(dialogMode === 'create' ? 'Пользователь создан' : 'Данные обновлены');
      setDialogOpen(false);
      fetchUsers();
    } catch (e: any) {
      setFormError('Ошибка соединения: ' + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Удалить ──────────────────────────────────────────────────
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Ошибка при удалении');
      } else {
        setSuccess(`Пользователь ${userToDelete.email} удалён`);
        fetchUsers();
      }
    } catch (e: any) {
      setError('Ошибка соединения: ' + e.message);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Кнопка назад */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/profile')}
        sx={{
          mb: { xs: 2, md: 2 },
          fontSize: { xs: '0.8rem', md: '0.875rem' },
        }}
      >
        Назад
      </Button>

      {/* Заголовок */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 3, md: 3 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
          >
            Управление пользователями
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}
          >
            Всего: {users.length}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          color="primary"
          size="medium"
          sx={{
            fontSize: { xs: '0.8rem', md: '0.875rem' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Добавить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Поиск */}
      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Поиск по имени, email, телефону..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Tooltip title="Обновить">
          <IconButton onClick={fetchUsers}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — таблица (md+)
          ═══════════════════════════════════════════════════════════ */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><b>Пользователь</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Телефон</b></TableCell>
              <TableCell><b>Роль</b></TableCell>
              <TableCell align="right"><b>Действия</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {search ? 'Ничего не найдено' : 'Нет пользователей'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : <AccountCircle fontSize="small" />}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {user.fullName || '—'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(user.roles ?? []).map(r => (
                        <Chip key={r} label={r} size="small" sx={roleColor(r)} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEdit(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" onClick={() => confirmDelete(user)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE — карточки (xs/sm)
          ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary', borderRadius: 2 }}>
            {search ? 'Ничего не найдено' : 'Нет пользователей'}
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map(user => (
              <Card
                key={user.id}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Верхняя часть: аватар + имя + действия */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.main',
                        fontSize: 16,
                      }}
                    >
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <AccountCircle />}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        noWrap
                        sx={{ fontSize: '0.95rem' }}
                      >
                        {user.fullName || '—'}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {user.email}
                      </Typography>

                      {user.phoneNumber && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {user.phoneNumber}
                        </Typography>
                      )}
                    </Box>

                    {/* Кнопки действий */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => openEdit(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => confirmDelete(user)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Роли */}
                  {(user.roles ?? []).length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(user.roles ?? []).map(r => (
                          <Chip
                            key={r}
                            label={r}
                            size="small"
                            sx={{ ...roleColor(r), fontSize: '0.7rem', height: 22 }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Диалог создания / редактирования ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 700 }}>
          {dialogMode === 'create' ? 'Новый пользователь' : 'Редактировать пользователя'}
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, md: 2 },
            pt: '16px !important',
          }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="ФИО"
            value={formData.fullName}
            onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            fullWidth
            size="small"
            disabled={dialogMode === 'edit'}
          />
          <TextField
            label="Телефон"
            value={formData.phoneNumber}
            onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
            fullWidth
            size="small"
            placeholder="+7 (900) 000-00-00"
          />
          <TextField
            label={
              dialogMode === 'edit'
                ? 'Новый пароль (оставьте пустым, чтобы не менять)'
                : 'Пароль'
            }
            type="password"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            fullWidth
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Роль</InputLabel>
            <Select
              label="Роль"
              value={formData.role}
              onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map(r => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={formLoading}
            size="small"
            color="primary"
            sx={{
              fontSize: { xs: '0.8rem', md: '0.875rem' },
            }}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Диалог подтверждения удаления ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 700 }}>
          Удалить пользователя?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Вы уверены, что хотите удалить <b>{userToDelete?.email}</b>? Это действие необратимо.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteLoading}
            size="small"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;