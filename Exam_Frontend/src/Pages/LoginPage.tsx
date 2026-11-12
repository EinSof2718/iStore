import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Paper,
  Link,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput
} from "@mui/material";
import {
  ArrowBack,
  Apple,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Info
} from "@mui/icons-material";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Отправка данных:', formData.email);
      
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (response.ok) {
        const userFromServer = data.user || data.User;
        
        if (!userFromServer) {
          setError('Ошибка: данные пользователя не получены');
          setLoading(false);
          return;
        }

        // Формируем объект пользователя для localStorage
        const userToSave = {
          id: userFromServer.id || userFromServer.userId || 'temp-id',
          fullName: userFromServer.fullName || userFromServer.name || formData.email.split('@')[0],
          email: userFromServer.email || formData.email,
          isManager: userFromServer.isManager || false,
          phoneNumber: userFromServer.phoneNumber || '',
          roles: userFromServer.roles || []
        };
        
        console.log('Сохраняем пользователя:', userToSave);
        localStorage.setItem('user', JSON.stringify(userToSave));
        
        // Успешный вход - переходим на главную
        window.location.href = '/';
      } else {
        setError(data.error || data.message || 'Ошибка при входе');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* Кнопка назад */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{
              color: 'primary.main',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            На главную
          </Button>
        </Box>

        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Apple
            sx={{
              fontSize: 48,
              mb: 2,
              color: 'text.primary'
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Вход в аккаунт
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Введите свои данные для входа
          </Typography>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            borderRadius: 2,
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              icon={<Info />}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="email"
                label="Email адрес"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="example@mail.ru"
                autoComplete="email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="password">Пароль</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  label="Пароль"
                  startAdornment={
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4 
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2">Запомнить меня</Typography>}
              />

              {/*<Link
                component="button"
                type="button"
                onClick={() => alert('Функция восстановления пароля в разработке')}
                disabled={loading}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >Забыли пароль? </Link>*/}
                
             
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 4,
                bgcolor: 'primary',
                '&:hover': {
                  bgcolor: 'grey.800'
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary">или</Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 4,
                borderColor: 'grey.400',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'grey.600',
                  bgcolor: 'action.hover'
                }
              }}
            >Создать новый аккаунт</Button>
              
            

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Нажимая "Войти", вы соглашаетесь с{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/termsOfUse')}
                  sx={{
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  условиями использования
                </Link>
              </Typography>
            </Box>
          </form>


        </Paper>

        {/* Информация о безопасности */}
        <Box sx={{ mt: 4, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            Ваши данные защищены с помощью шифрования. Никогда не сообщайте свои учетные данные третьим лицам.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;