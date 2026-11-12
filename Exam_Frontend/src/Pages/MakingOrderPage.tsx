import { useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  Home,
  LocationCity,
  Apartment,
  CheckCircle,
} from '@mui/icons-material';

// Интерфейсы
interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  discountPrice?: number;
  countProduct: number;
  totalPrice: number;
}

interface OrderData {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode: string;
}

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const MakingOrderPage = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Данные заказа
  const [orderData, setOrderData] = useState<OrderData>({
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0
  });
  
  // Информация о пользователе
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Адрес доставки
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: ''
  });
  
  // Методы доставки
  const [deliveryMethods] = useState<DeliveryMethod[]>([
    {
      id: 'courier',
      name: 'Курьерская доставка',
      description: 'Доставка курьером до двери',
      price: 300,
      estimatedDays: '1-3 дня'
    },
    {
      id: 'pickup',
      name: 'Самовывоз',
      description: 'Бесплатный самовывоз из магазина',
      price: 0,
      estimatedDays: 'Сегодня'
    },
    {
      id: 'post',
      name: 'Почта России',
      description: 'Доставка через Почту России',
      price: 200,
      estimatedDays: '3-7 дней'
    }
  ]);
  
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('courier');
  
  // Методы оплаты
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card',
      name: 'Банковская карта',
      description: 'Оплата онлайн банковской картой',
      icon: 'credit_card'
    },
    {
      id: 'cash',
      name: 'Наличными',
      description: 'Оплата наличными при получении',
      icon: 'money'
    },
    {
      id: 'installment',
      name: 'Рассрочка',
      description: 'Рассрочка на 12 месяцев',
      icon: 'calendar_today'
    }
  ]);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [saveAddress, setSaveAddress] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [comments, setComments] = useState('');
  
  // Шаги оформления заказа
  const steps = ['Корзина', 'Данные покупателя', 'Доставка', 'Оплата', 'Подтверждение'];
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Загрузка данных заказа из localStorage
  useEffect(() => {
    const loadOrderData = () => {
      try {
        const savedOrderData = localStorage.getItem('orderData');
        if (savedOrderData) {
          const parsedData = JSON.parse(savedOrderData);
          setOrderData(parsedData);
          
          // Загружаем сохраненные данные пользователя
          const savedUserInfo = localStorage.getItem('userInfo');
          if (savedUserInfo) {
            setUserInfo(JSON.parse(savedUserInfo));
          }
          
          const savedAddress = localStorage.getItem('deliveryAddress');
          if (savedAddress) {
            setDeliveryAddress(JSON.parse(savedAddress));
          }
          
          const savedDeliveryMethod = localStorage.getItem('selectedDeliveryMethod');
          if (savedDeliveryMethod) {
            setSelectedDeliveryMethod(savedDeliveryMethod);
          }
          
          const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
          if (savedPaymentMethod) {
            setSelectedPaymentMethod(savedPaymentMethod);
          }
        } else {
          // Если данных нет, возвращаем в корзину
          navigate('/basket');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        setError('Ошибка загрузки данных заказа');
      }
    };
    
    loadOrderData();
  }, [navigate]);
  
  // Расчет общей стоимости с учетом доставки
  const calculateTotalWithDelivery = () => {
    const deliveryMethod = deliveryMethods.find(method => method.id === selectedDeliveryMethod);
    const deliveryPrice = deliveryMethod ? deliveryMethod.price : 0;
    
    return {
      deliveryPrice,
      total: orderData.subtotal - orderData.discount + deliveryPrice
    };
  };
  
  const { deliveryPrice, total } = calculateTotalWithDelivery();
  
  // Валидация формы
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Данные покупателя
        if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
          setError('Заполните имя и фамилию');
          return false;
        }
        if (!userInfo.email.trim() || !/\S+@\S+\.\S+/.test(userInfo.email)) {
          setError('Введите корректный email');
          return false;
        }
        if (!userInfo.phone.trim() || !/^[\d\+\-\(\)\s]+$/.test(userInfo.phone)) {
          setError('Введите корректный номер телефона');
          return false;
        }
        break;
        
      case 2: // Доставка
        if (!deliveryAddress.city.trim() || !deliveryAddress.street.trim() || !deliveryAddress.house.trim()) {
          setError('Заполните адрес доставки');
          return false;
        }
        if (!selectedDeliveryMethod) {
          setError('Выберите способ доставки');
          return false;
        }
        break;
        
      case 3: // Оплата
        if (!selectedPaymentMethod) {
          setError('Выберите способ оплаты');
          return false;
        }
        if (createAccount && (!password || password !== confirmPassword)) {
          setError('Пароли не совпадают');
          return false;
        }
        break;
    }
    
    setError('');
    return true;
  };
  
  // Переход к следующему шагу
  const handleNext = () => {
    if (validateStep(activeStep)) {
      // Сохраняем данные шага
      saveStepData(activeStep);
      
      if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        handleSubmitOrder();
      }
    }
  };
  
  // Переход к предыдущему шагу
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else {
      navigate('/basket');
    }
  };
  
  // Сохранение данных шага
  const saveStepData = (step: number) => {
    switch (step) {
      case 1: // Данные покупателя
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        break;
      case 2: // Доставка
        localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
        localStorage.setItem('selectedDeliveryMethod', selectedDeliveryMethod);
        break;
      case 3: // Оплата
        localStorage.setItem('selectedPaymentMethod', selectedPaymentMethod);
        break;
    }
  };
  
  // Отправка заказа
const handleSubmitOrder = async () => {
  setLoading(true);

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    setError('Пользователь не авторизован');
    setLoading(false);
    return;
  }

  try {
    const user = JSON.parse(userStr);
    const userId = user.id;
    console.log('User ID:', userId);
    
    if (!userId) {
      setError('Не найден ID пользователя');
      setLoading(false);
      return;
    }
    
    // Формируем адрес доставки как строку
    const deliveryAddressStr = `${deliveryAddress.city}, ${deliveryAddress.street}, д. ${deliveryAddress.house}${deliveryAddress.apartment ? `, кв. ${deliveryAddress.apartment}` : ''}`;
    
    // ВАЖНО: Используйте этот payload
    const orderPayload = {
      userId: userId,
      totalAmount: total,
      customerName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
      customerEmail: userInfo.email,
      statusOrder: "pending",
      orderDate: new Date().toISOString(),
      customerPhone: userInfo.phone,
      deliveryAddress: deliveryAddressStr,
      deliveryMethod: selectedDeliveryMethod,
      deliveryCost: deliveryPrice,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: selectedPaymentMethod === 'cash' ? 'Ожидает оплаты' : 'Оплачен',
      comments: comments,
      items: orderData.items.map(item => ({
        productId: item.productId,
        countProduct: item.countProduct,
        price: item.discountPrice || item.price
      }))
    };
    
    console.log('Отправляем заказ (соответствует модели):', JSON.stringify(orderPayload, null, 2));
    
    // Отправляем заказ
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const orderResult = await response.json();
      console.log('Order result:', orderResult);
      
      // Очищаем корзину
      localStorage.removeItem('orderData');
      localStorage.removeItem('cart_backup');
      
      setNotification({
        open: true,
        message: 'Заказ успешно оформлен! Номер заказа: #' + (orderResult.orderId || orderResult.id || '0001'),
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/profile', { 
          state: { 
            orderId: orderResult.orderId || orderResult.id || '0001',
            orderTotal: total
          }
        });
      }, 2000);
      
    } else {
      // Получаем детали ошибки
      const responseText = await response.text();
      console.log('FULL ERROR RESPONSE:', responseText);
      
      let errorText = `HTTP ${response.status}: Ошибка при оформлении заказа`;
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);
        
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, errors]) => `• ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorText = `Ошибки валидации:\n${validationErrors}`;
        } else if (errorData.error) {
          errorText = errorData.error;
        }
      } catch (e) {
        errorText = `HTTP ${response.status}: ${responseText}`;
      }
      
      throw new Error(errorText);
    }
    
  } catch (error) {
    console.error('Ошибка оформления заказа:', error);
    //setError(error.message);
  } finally {
    setLoading(false);
  }
};


  // Закрытие уведомления
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Рендеринг содержимого шага
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Корзина
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Товары в заказе
            </Typography>
            
            {orderData.items.length === 0 ? (
              <Alert severity="info">Ваша корзина пуста. Вернитесь в корзину, чтобы добавить товары.</Alert>
            ) : (
              <>
                <List>
                  {orderData.items.map((item, index) => (
                    <ListItem key={index} sx={{ py: 1.5 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.countProduct} × ${formatPrice(item.discountPrice || item.price)}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body1" fontWeight="medium">
                          {formatPrice(item.price * item.countProduct)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Товары ({orderData.items.length})
                    </Typography>
                    <Typography variant="body2">{formatPrice(orderData.subtotal)}</Typography>
                  </Box>
                  
                  {orderData.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Скидка</Typography>
                      <Typography variant="body2" color="success.main">-{formatPrice(orderData.discount)}</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body1" fontWeight="medium">Итого к оплате</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">{formatPrice(orderData.total)}</Typography>
                  </Box>
                </Stack>
              </>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >Вернуться в корзину</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={orderData.items.length === 0}
              >Продолжить</Button>
            </Box>
          </Paper>
        );
        
      case 1: // Данные покупателя
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Контактная информация
            </Typography>
            
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  fullWidth
                  label="Имя"
                  value={userInfo.firstName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Фамилия"
                  value={userInfo.lastName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Телефон"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="+7 (999) 999-99-99"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                    />
                  }
                  label="Создать учетную запись для быстрых покупок"
                />
              </Grid>
              
              {createAccount && (
                <>
                  <Grid>
                    <TextField
                      fullWidth
                      label="Пароль"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={createAccount}
                    />
                  </Grid>
                  
                  <Grid>
                    <TextField
                      fullWidth
                      label="Подтверждение пароля"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={createAccount}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Назад
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Продолжить
              </Button>
            </Box>
          </Paper>
        );
        
      case 2: // Доставка
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Адрес доставки
            </Typography>
            
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  fullWidth
                  label="Город"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Индекс"
                  value={deliveryAddress.postalCode}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Улица"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Дом"
                  value={deliveryAddress.house}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, house: e.target.value }))}
                  required
                />
              </Grid>
              
              <Grid>
                <TextField
                  fullWidth
                  label="Квартира/Офис"
                  value={deliveryAddress.apartment}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, apartment: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Apartment fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                  }
                  label="Сохранить адрес для следующих заказов"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Способ доставки
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedDeliveryMethod}
                onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
              >
                {deliveryMethods.map((method) => (
                  <Paper key={method.id} sx={{ mb: 2, p: 2, border: selectedDeliveryMethod === method.id ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                      value={method.id}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {method.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description} • {method.estimatedDays}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {method.price === 0 ? 'Бесплатно' : formatPrice(method.price)}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Назад
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Продолжить
              </Button>
            </Box>
          </Paper>
        );
        
      case 3: // Оплата
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Способ оплаты
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                {paymentMethods.map((method) => (
                  <Paper key={method.id} sx={{ mb: 2, p: 2, border: selectedPaymentMethod === method.id ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                      value={method.id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {method.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
            
            {selectedPaymentMethod === 'card' && (
              <Alert severity="info" sx={{ mt: 2 }}>После подтверждения заказа вы будете перенаправлены на страницу безопасной оплаты</Alert>
            )}
            
            {selectedPaymentMethod === 'cash' && (
              <Alert severity="warning" sx={{ mt: 2 }}>Оплата наличными доступна только при доставке курьером</Alert>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom fontWeight="bold">Комментарий к заказу</Typography>
              
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Дополнительные пожелания к заказу, особенности доставки и т.д."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Назад
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Перейти к подтверждению
              </Button>
            </Box>
          </Paper>
        );
        
      case 4: // Подтверждение
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Подтверждение заказа </Typography>
            <Grid container spacing={3}>
              <Grid>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Контактная информация </Typography>
                    <Typography variant="body2">{userInfo.firstName} {userInfo.lastName}</Typography>
                    <Typography variant="body2">Email: {userInfo.email} </Typography>   
                    <Typography variant="body2"> Телефон: {userInfo.phone}</Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Доставка</Typography>
                    <Typography variant="body2">Способ: {deliveryMethods.find(m => m.id === selectedDeliveryMethod)?.name}</Typography>
                    <Typography variant="body2">
                      Адрес: {deliveryAddress.city}, {deliveryAddress.street}, д. {deliveryAddress.house}
                      {deliveryAddress.apartment && `, кв. ${deliveryAddress.apartment}`}
                    </Typography>
                    <Typography variant="body2">Стоимость доставки: {formatPrice(deliveryPrice)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom> Способ оплаты</Typography>
                    <Typography variant="body2">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Итоговая стоимость</Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="Товары" />
                        <Typography variant="body2">{formatPrice(orderData.subtotal)}</Typography>
                      </ListItem>
                      
                      {orderData.discount > 0 && (
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText primary="Скидка" />
                          <Typography variant="body2" color="success.main">
                            -{formatPrice(orderData.discount)}
                          </Typography>
                        </ListItem>
                      )}
                      
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="Доставка" />
                        <Typography variant="body2">{formatPrice(deliveryPrice)}</Typography>
                      </ListItem>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={<Typography variant="h6">Итого к оплате</Typography>} 
                        />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatPrice(total)}
                        </Typography>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {comments && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Комментарий к заказу
                  </Typography>
                  <Typography variant="body2">
                    {comments}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            <Alert severity="info" sx={{ mt: 3 }}>Нажимая кнопку "Подтвердить заказ", вы соглашаетесь с условиями покупки и политикой конфиденциальности </Alert>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button startIcon={<ArrowBack />} onClick={handleBack}> Назад</Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleNext}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{ 
                  px: 4,
                  bgcolor: 'green',
                  '&:hover': { bgcolor: 'darkgreen' }
                }}
              >
                {loading ? 'Оформляем заказ...' : 'Подтвердить заказ'}
              </Button>
            </Box>
          </Paper>
        );
        
      default:
        return null;
    }
  };
  
  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/basket')}>
          Вернуться в корзину
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Оформление заказа
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Заполните информацию для завершения покупки
        </Typography>
      </Box>
      
      {/* Шаги */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Содержимое шага */}
      {renderStepContent(activeStep)}
    </Container>
  );
};

export default MakingOrderPage;