import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  ArrowBack,
  AccountCircle,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  Person,
  Security,
  ShoppingCart,
  History,
  Logout
} from '@mui/icons-material';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [formData, setFormData] = useState({fullName: '', phoneNumber: '',email: ''});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Проверка авторизации при загрузке
useEffect(() => {
  const checkAuth = async () => {
    setAuthChecking(true);
    
    try {
      console.log('Checking authentication...');
      
      // Пытаемся получить данные пользователя с сервера
      const response = await fetch('/api/Auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth check response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Auth data:', data);
        
        if (data.Success) {
          // Пользователь авторизован - обновляем данные
          setUser(data.User);
          setFormData({
            fullName: data.User.fullName || '',
            phoneNumber: data.User.phoneNumber || '',
            email: data.User.email || ''
          });
          
          // Обновляем localStorage
          localStorage.setItem('user', JSON.stringify(data.User));
          
          // Загружаем заказы
          loadUserOrders(data.User.id);
          setAuthChecking(false);
          return;
        }
      }
      
      // Если не удалось получить данные с сервера, пробуем localStorage
      console.log('Auth failed, checking localStorage...');
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('User from localStorage:', userData);
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          email: userData.email || ''
        });
        
        // Пытаемся загрузить заказы
        try {
          await loadUserOrders(userData.id);
        } catch (error) {
          console.log('Could not load orders - need to login again');
        }
        
      } else {
        console.log('No user data, redirecting to login');
        //navigate('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      // При ошибке пробуем localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          email: userData.email || ''
        });
        setError('Ошибка соединения с сервером. Данные могут быть устаревшими.');
      } else {
        //navigate('/login');
      }
    } finally {
      setAuthChecking(false);
      setLoading(false);
    }
  };

  checkAuth();
}, [navigate]);

  const loadUserOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`/api/orders/user/${userId}`, {
        method: "GET",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const res = await response.json();
        if (res.success)
          setOrders(res.orders || []);
        else 
          console.error('Failed to load orders:', res.error);
      } else {
        console.error('Failed to load orders, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      setFormData({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending update request with data:', {
        FullName: formData.fullName,
        PhoneNumber: formData.phoneNumber
      });

      const response = await fetch('/api/Auth/updateProfile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: formData.fullName,
          PhoneNumber: formData.phoneNumber
        })
      });

      console.log('Update response status:', response.status);
      
      if (response.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        //setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const data = await response.json();
      console.log('Update response data:', data);
      
      if (response.ok && data.success) {
        // Обновляем данные в localStorage
        const updatedUser = { ...user, fullName:data.user.fullName, phoneNumber: data.user.PhoneNumber, email:data.user.Email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess('Данные успешно обновлены');
        setEditing(false);
      } else {
        setError(data.Error || data.Errors?.join(', ') || 'Ошибка при сохранении');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Вызываем API для выхода (если есть)
      await fetch('/api/Auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (authChecking || loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Проверка авторизации...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  //const status = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const statusColor = (s:string) => {
      if(s==="completed") return "success";
      if(s==="processing") return "warning";
      if(s==="shipped") return "info";
      if(s==="cancelled") return "error";
      return "default";
  }

  const statusLabel: Record<string, string> ={
    pending:"Ожидает",
    processing:"В обработке",
    shipped:"Отправлен",
    completed:"Выполнен",
    cancelled:"Отменен",
  };

  //const methodPayment =['card', 'cash', 'installment'];
  const translateMethodPayment=(m:string)=>{
    if(m==="card") return "Карта";
    if(m==="cash") return "Наличные";
    if(m==="installment") return "Рассрочка";
  }


  //const methodDelivery =['courier', 'pickup', 'mail'];
  const translateMethodDelivery=(m:string)=>{
    if(m==="courier") return "Курьер";
    if(m==="pickup") return "Самовывоз";
    if(m==="mail") return "Почта";
  }





  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Кнопка назад */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ color: 'primary.main' }}
        >
          На главную
        </Button>
      </Box>

      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Личный кабинет</Typography>
        <Typography variant="body1" color="text.secondary">Управление вашим профилем и настройками</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Левая колонка - Профиль */}
        <Grid>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">Основная информация</Typography>
              <Button
                startIcon={editing ? <Cancel /> : <Edit />}
                onClick={handleEditToggle}
                variant="outlined"
                size="small"
              >
                {editing ? 'Отмена' : 'Редактировать'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <AccountCircle />}
                  </Avatar>
				  {user?.roles?.includes('Moderator') && (
                    <Chip
                      label="Модератор"
                      sx={{ mb: 2, bgcolor: 'rgb(20, 235, 49)', color: 'white',}}
                      size="small"
                    />
                  )}
				  
                  {user?.roles?.includes('Manager') && (
                    <Chip
                      label="Менеджер"
                      sx={{ mb: 2, bgcolor: '#328ef7', color: 'white',}}
                      size="small"
                    />
                  )}
                  {user?.roles?.includes('Admin') && (
                    <Chip
                      label="Администратор"
                      sx={{ mb: 2, bgcolor: '#e40f1a', color: 'white',}} 
                      size="small"
                    />
                  )}
                </Box>
              </Grid>

              <Grid>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="ФИО"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Телефон"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    placeholder="+7 (900) 000-00-00"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>

                {editing && (
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                    color='success'
                  >
                    {loading ? <CircularProgress size={20} /> : 'Сохранить изменения'}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* История заказов */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4, width:1140 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              <History sx={{ mr: 1, verticalAlign: 'middle' }} />
              История заказов ({orders.length})
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {ordersLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Загрузка заказов...</Typography>
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">У вас пока нет заказов</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/catalog')}
                  sx={{ mt: 2 }}
                >
                  Перейти в каталог
                </Button>
              </Box>
            ) : (
              <Box>
                {orders.map((order) => (
                  <Card key={order.orderId} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Заказ #{order.numberOrder || order.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Grid>
                      <Grid>
                        <Chip 
                          label={statusLabel[order.statusOrder] ?? order.statusOrder ?? "Ожидает"} 
                          size="small"
                          color={statusColor(order.statusOrder) as any}
                        />
                      </Grid>
                      <Grid>
                        <Typography variant="h6">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            minimumFractionDigits: 0
                          }).format(order.totalAmount)}
                        </Typography>
                      </Grid>
                      <Grid>
                        <Button
                          size="small"
                          onClick={() => navigate(`/order/${order.orderId}`)}
                        >
                          Подробнее
                        </Button>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Способ доставки:</strong> {translateMethodDelivery(order.deliveryMethod)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Способ оплаты:</strong> {translateMethodPayment(order.paymentMethod)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Товары:</strong> {order.itemsCount || 0} шт.
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Правая колонка */}
        <Grid>
          <Box sx={{display:"flex", flexDirection:{xs:'column', md:'row'}, gap:31.8, width:"100%"}}>
            {/* Быстрые действия */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Быстрые действия
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate('/basket')}>
                    <ListItemIcon>
                      <ShoppingCart />
                    </ListItemIcon>
                    <ListItemText primary="Корзина" />
                  </ListItemButton>
    
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Выйти" />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Статистика
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Заказов выполнено
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {orders.filter(o => o.statusOrder === 'completed').length}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Сумма покупок
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 0
                    }).format(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Статус
                  </Typography>
                  <Chip
                    label={orders.length >= 3 ? 'Постоянный покупатель' : 'Новый покупатель'}
                    color={orders.length > 0 ? 'success' : 'primary'}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Информация о безопасности */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  <Security sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  Безопасность
                </Typography>
                <Typography variant="body2" color="text.secondary">• Последний вход: сегодня</Typography>
                <Typography variant="body2" color="text.secondary">• Аккаунт подтвержден</Typography>                
                {/* <Button size="small" sx={{ mt: 2 }} onClick={() => alert('Функция смены пароля в разработке')}>Сменить пароль</Button> */}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>


      {/*Панель управления */}
      {user?.isManager && user?.roles?.includes('Admin') && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4, bgcolor: 'primary.50' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Панель управления</Typography>
            
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={4}>

            <Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/users_management")}
                color='primary'
              >Управление пользователями</Button>
            </Grid>

            <Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/orders_management")}
                color='primary'
              >Управление заказами</Button>
            </Grid>

            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/products_management")}
                color='primary'
              >Управление товарами</Button>
            </Grid>

            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/categories_management")}
                color='primary'
              >Управление категориями</Button>
            </Grid>


            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/stats")}
                color='primary'
              >Статистика магазина</Button>
            </Grid>


            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/reviews_moderation")}
                color='primary'
              >Модерация отзывов</Button>
            </Grid>

          </Grid>
        </Paper>
      )}

      {user?.isManager && user?.roles?.includes('Manager') && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4, bgcolor: 'primary.50' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Панель управления</Typography>
            
         <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={15}>
            <Grid>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/orders_management")}
                color='primary'
              >Управление заказами</Button>
            </Grid>

            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/products_management")}
                color='primary'
              >Управление товарами</Button>
            </Grid>

            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/categories_management")}
                color='primary'
              >Управление категориями</Button>
            </Grid>


            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/reviews_moderation")}
                color='primary'
              >Модерация отзывов</Button>
            </Grid>

          </Grid>
        </Paper>
	)}
		
		
		
		
		{user?.roles?.includes('Moderator') && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4, bgcolor: 'primary.50' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Панель управления</Typography>
            
         <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={15}>
            <Grid >
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/reviews_moderation")}
                color='primary'
              >Модерация отзывов</Button>
            </Grid>

          </Grid>
        </Paper>
      )}

    </Container>
  );
};

export default ProfilePage;