import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Grid,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Apple,
  CheckCircle,
  Phone,
  Email,
  Lock,
  Person
} from "@mui/icons-material";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "Введите имя";

    if (!formData.lastName.trim())
      newErrors.lastName = "Введите фамилию";

    if (!formData.email.trim())
      newErrors.email = "Введите email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Некорректный email";

    if (!formData.password.trim())
      newErrors.password = "Введите пароль";
    else if (formData.password.length < 6)
      newErrors.password = "Пароль должен содержать минимум 6 символов";

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Пароли не совпадают";

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "Необходимо согласиться с условиями";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phoneNumber: formData.phone || null,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Ошибка сервера';
        try {
          const errorData = await response.json();
          errorMessage = errorData.errors?.join(', ') || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Сохраняем данные пользователя
        const userData = {
          id: data.userId,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          isManager: false
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/'; // Используем полную перезагрузку
        }, 2000);
      }
      else {
        setErrors({
          submit: data.errors?.join(', ') || data.error || 'Ошибка регистрации'
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.message || 'Ошибка соединения с сервером. Проверьте, запущен ли сервер .NET.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 3
            }}
          />
          <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight="bold">
            Регистрация успешна!
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Аккаунт успешно создан. Вы будете перенаправлены на страницу входа...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

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
            Создание аккаунта
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Заполните форму для регистрации
          </Typography>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            borderRadius: 2,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Имя и фамилия */}
              <Grid>
                <TextField
                  fullWidth
                  label="Имя *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={loading}
                  placeholder="Иван"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={loading}
                  placeholder="Иванов"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid>
                <TextField
                  fullWidth
                  type="email"
                  label="Email адрес *"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                  placeholder="example@mail.ru"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Телефон */}
              <Grid>
                <TextField
                  fullWidth
                  type="tel"
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="+7 (900) 123-45-67"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Пароль */}
              <Grid>
                <TextField
                  fullWidth
                  type="password"
                  label="Пароль *"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  placeholder="Минимум 6 символов"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Подтверждение пароля */}
              <Grid>
                <TextField
                  fullWidth
                  type="password"
                  label="Подтверждение пароля *"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  placeholder="Повторите пароль"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 8, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Согласие с условиями */}
              <Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      disabled={loading}
                      color={errors.agreeToTerms ? "error" : "primary"}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Я согласен с{' '}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => navigate('/termsOfUse')}
                        sx={{ textDecoration: 'none' }}
                      >
                        условиями использования
                      </Link>
                      {' '}и{' '}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => navigate('/privacy')}
                        sx={{ textDecoration: 'none' }}
                      >
                        политикой конфиденциальности
                      </Link>
                      *
                    </Typography>
                  }
                />
                {errors.agreeToTerms && (
                  <Typography variant="caption" color="error" sx={{ ml: 4, display: 'block' }}>
                    {errors.agreeToTerms}
                  </Typography>
                )}
              </Grid>

              {/* Кнопка регистрации */}
              <Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    bgcolor: 'primary',
                    '&:hover': {
                      bgcolor: 'grey.800'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Регистрация...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </Button>
              </Grid>

              {/* Разделитель */}
              <Grid>
                <Divider>
                  <Typography variant="body1" color="text.secondary">
                    или
                  </Typography>
                </Divider>
              </Grid>

              {/* Ссылка на вход */}
              <Grid>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Уже есть аккаунт?{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                      sx={{
                        fontWeight: 500,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Войти
                    </Link>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Дополнительная информация */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Регистрируясь, вы подтверждаете, что ознакомились с политикой конфиденциальности
            и правилами обработки персональных данных.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;