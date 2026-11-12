import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  CreditCard,
  Person,
  Receipt,
  Print,
  Download,
  Image as ImageIcon
} from '@mui/icons-material';

// Интерфейс для типизации
interface OrderItem {
  id?: number;
  orderItemId?: number;
  productId: number;
  countProduct: number;
  price: number;
}

interface Order {
  orderId?: number;
  id?: number;
  numberOrder: number;
  statusOrder: string;
  totalAmount: number;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryCost: number;
  paymentMethod: string;
  paymentStatus: string;
  comments?: string;
  items: OrderItem[];
  userId: string;
}

interface ApiResponse {
  success: boolean;
  order: Order;
  error?: string;
}

const OrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    console.log(info);
  };

  // Функция для загрузки информации о продукте
  const loadProductInfo = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        localStorage.setItem(`product_${productId}`, JSON.stringify(productData));
        return productData;
      }
    } catch (err) {
      console.log(`Не удалось загрузить продукт ${productId}`);
    }
    return null;
  };

  // Функция для получения информации о продукте из кэша
  const getProductInfo = (productId: number) => {
    try {
      const productData = localStorage.getItem(`product_${productId}`);
      if (productData) {
        return JSON.parse(productData);
      }
    } catch (err) {
      // Игнорируем ошибки
    }
    return null;
  };

  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) {
        setError('ID заказа не указан');
        setLoading(false);
        return;
      }

      setDebugInfo([]);
      addDebugInfo(`Начинаем загрузку заказа #${orderId}`);

      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Пробуем загрузить заказ напрямую через новый эндпоинт
        addDebugInfo(`Пробуем загрузить заказ через прямой эндпоинт: /api/orders/${orderId}`);
        const directResponse = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers
        });

        if (directResponse.ok) {
          const result: ApiResponse = await directResponse.json();
          
          if (result.success && result.order) {
            addDebugInfo(`Заказ успешно загружен через прямой эндпоинт`);
            console.log('Данные заказа из API:', result.order);
            
            // Проверяем структуру items
            const items = result.order.items || [];
            addDebugInfo(`В заказе найдено товаров: ${items.length}`);
            
            // Нормализуем заказ
            const normalizedOrder: Order = {
              orderId: result.order.orderId,
              id: result.order.id,
              numberOrder: result.order.numberOrder,
              statusOrder: result.order.statusOrder || 'Неизвестно',
              totalAmount: result.order.totalAmount || 0,
              orderDate: result.order.orderDate || new Date().toISOString(),
              customerName: result.order.customerName || 'Не указано',
              customerEmail: result.order.customerEmail || 'Не указан',
              customerPhone: result.order.customerPhone || 'Не указан',
              deliveryAddress: result.order.deliveryAddress || 'Не указан',
              deliveryMethod: result.order.deliveryMethod || 'Не указан',
              deliveryCost: result.order.deliveryCost || 0,
              paymentMethod: result.order.paymentMethod || 'Не указан',
              paymentStatus: result.order.paymentStatus || 'Неизвестно',
              comments: result.order.comments || '',
              userId: result.order.userId || '',
              items: items
            };
            
            setOrder(normalizedOrder);
            
            // Параллельно загружаем информацию о продуктах
            if (items.length > 0) {
              addDebugInfo(`Начинаем загрузку информации о ${items.length} продуктах`);
              items.forEach((item: OrderItem) => {
                if (item.productId) {
                  loadProductInfo(item.productId);
                }
              });
            }
            
          } else {
            addDebugInfo(`API вернул success: false`);
            throw new Error(result.error || 'Неизвестная ошибка сервера');
          }
        } else {
          addDebugInfo(`Прямой эндпоинт ответил ${directResponse.status}`);
          
          // Если не получилось напрямую, пробуем найти в списке всех заказов
          addDebugInfo('Пробуем найти заказ в общем списке');
          const allOrdersResponse = await fetch(`/api/orders`, {
            method: 'GET',
            headers
          });

          if (allOrdersResponse.ok) {
            const allOrders = await allOrdersResponse.json();
            
            if (Array.isArray(allOrders)) {
              const foundOrder = allOrders.find((o: any) => 
                (o.orderId?.toString() === orderId) || 
                (o.numberOrder?.toString() === orderId)
              );
              
              if (foundOrder) {
                addDebugInfo(`Заказ найден в общем списке: ID ${foundOrder.orderId}, Номер ${foundOrder.numberOrder}`);
                
                // Проверяем, есть ли items в этом формате
                const items = foundOrder.items || foundOrder.Items || [];
                addDebugInfo(`В заказе найдено товаров: ${items.length}`);
                
                // Нормализуем заказ
                const normalizedOrder: Order = {
                  orderId: foundOrder.orderId,
                  id: foundOrder.id,
                  numberOrder: foundOrder.numberOrder || 0,
                  statusOrder: foundOrder.statusOrder || 'Неизвестно',
                  totalAmount: foundOrder.totalAmount || 0,
                  orderDate: foundOrder.orderDate || new Date().toISOString(),
                  customerName: foundOrder.customerName || 'Не указано',
                  customerEmail: foundOrder.customerEmail || 'Не указан',
                  customerPhone: foundOrder.customerPhone || 'Не указан',
                  deliveryAddress: foundOrder.deliveryAddress || 'Не указан',
                  deliveryMethod: foundOrder.deliveryMethod || 'Не указан',
                  deliveryCost: foundOrder.deliveryCost || 0,
                  paymentMethod: foundOrder.paymentMethod || 'Не указан',
                  paymentStatus: foundOrder.paymentStatus || 'Неизвестно',
                  comments: foundOrder.comments || '',
                  userId: foundOrder.userId || '',
                  items: items
                };
                
                setOrder(normalizedOrder);
                
                // Загружаем информацию о продуктах
                if (items.length > 0) {
                  items.forEach((item: OrderItem) => {
                    if (item.productId) {
                      loadProductInfo(item.productId);
                    }
                  });
                }
              } else {
                throw new Error('Заказ не найден');
              }
            } else {
              throw new Error('Некорректный формат данных от сервера');
            }
          } else {
            throw new Error(`Не удалось загрузить список заказов: ${allOrdersResponse.status}`);
          }
        }
        
      } catch (err: any) {
        const errorMsg = `Ошибка загрузки: ${err.message}`;
        setError(errorMsg);
        addDebugInfo(errorMsg);
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
        addDebugInfo('Загрузка завершена');
      }
    };

    loadOrderData();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('оплачен') || statusLower?.includes('completed') || statusLower?.includes('доставлен')) {
      return 'success';
    } else if (statusLower?.includes('обработка') || statusLower?.includes('processing')) {
      return 'warning';
    } else if (statusLower?.includes('ожидает') || statusLower?.includes('pending')) {
      return 'default';
    } else if (statusLower?.includes('отменен') || statusLower?.includes('cancelled')) {
      return 'error';
    }
    return 'default';
  };

  const getStatusSteps = () => {
    if (!order?.statusOrder) return 0;
    
    const status = order.statusOrder.toLowerCase();
    if (status.includes('доставлен') || status.includes('completed')) return 4;
    if (status.includes('отправлен') || status.includes('shipped')) return 3;
    if (status.includes('обработк') || status.includes('processing')) return 2;
    if (status.includes('оформлен') || status.includes('pending')) return 1;
    return 0;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Счет_${order?.numberOrder || orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Счет временно недоступен');
      }
    } catch {
      alert('Функция скачивания счета в разработке');
    }
  };


  /*const status = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const statusColor = (s:string) => {
      if(s==="completed") return "success";
      if(s==="processing") return "warning";
      if(s==="shipped") return "info";
      if(s==="cancelled") return "error";
      return "default";
  }*/

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


  // Расчет общей стоимости товаров
  const calculateItemsTotal = (): number => {
    if (!order?.items || order.items.length === 0) return 0;
    return order.items.reduce((total: number, item: OrderItem) => {
      return total + (item.countProduct * item.price);
    }, 0);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Загрузка данных заказа...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !order) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Отладочная информация:</Typography>
          {debugInfo.map((info, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{info}</Typography>
          ))}
        </Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          variant="contained"
        >Вернуться в профиль</Button>
          
        
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Шапка */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/profile')}
            sx={{ mb: 1 }}
          >К моим заказам</Button>
            
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Заказ #{order?.numberOrder || order?.orderId || orderId}</Typography>
            
          
          <Typography variant="body1" color="text.secondary">{order?.orderDate ? formatDate(order.orderDate) : 'Дата не указана'}</Typography>
            
          
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Print />}
            onClick={handlePrint}
            variant="outlined"
          >Печать</Button>
            
          
          <Button
            startIcon={<Download />}
            onClick={handleDownloadInvoice}
            variant="outlined"
          >Счет</Button>
            
          
        </Box>
      </Box>

      {/* Статус заказа */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Статус заказа
          </Typography>
          <Chip
            label={statusLabel[order?.statusOrder ?? ''] ?? order?.statusOrder ?? 'Неизвестно'}
            color={getStatusColor(order?.statusOrder || '')}
            size="medium"
          />
        </Box>
        
        <Stepper activeStep={getStatusSteps()} alternativeLabel sx={{ mb: 2 }}>
          <Step>
            <StepLabel>Оформлен</StepLabel>
          </Step>
          <Step>
            <StepLabel>В обработке</StepLabel>
          </Step>
          <Step>
            <StepLabel>Отправлен</StepLabel>
          </Step>
          <Step>
            <StepLabel>В пути</StepLabel>
          </Step>
          <Step>
            <StepLabel>Доставлен</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={4} alignItems={'flex-start'}>
        {/* Левая колонка - Информация о заказе */}
        <Grid size={{xs:12, md:8}}>
          {/* Товары в заказе */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
              Состав заказа
            </Typography>
            
            
            <Divider sx={{ mb: 3 }} />
            
            {order?.items && order.items.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Товар</TableCell>
                        <TableCell align="center">Количество</TableCell>
                        <TableCell align="right">Цена за шт.</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item: OrderItem, index: number) => {
                        const productInfo = getProductInfo(item.productId);
                        const productName = productInfo?.name || `Товар #${item.productId}`;
                        const productImgUrl = productInfo?.photos?.split(',')[0]?.trim();
                        
                        return (
                          <TableRow key={item.id || item.orderItemId || index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {productImgUrl ? (
                                  <Box
                                    component="img"
                                    src={productImgUrl}
                                    alt={productName}
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      mr: 2
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: 'grey.100',
                                      borderRadius: 1,
                                      mr: 2
                                    }}
                                  >
                                    <ImageIcon color="disabled" />
                                  </Box>
                                )}
                                <Box>
                                  <Typography fontWeight="medium">
                                    {productName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Артикул: {item.productId}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{item.countProduct}</TableCell>
                            <TableCell align="right">{formatPrice(item.price)}</TableCell>
                            <TableCell align="right">
                              {formatPrice(item.countProduct * item.price)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      Стоимость товаров
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography align="right">
                      {formatPrice(calculateItemsTotal())}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Grid container spacing={2}>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      Доставка
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography align="right">
                      {formatPrice(order?.deliveryCost || 0)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid>
                    <Typography variant="h6" fontWeight="bold">Итого к оплате </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="h6" align="right" fontWeight="bold" color="primary">
                      {formatPrice(order?.totalAmount || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>В заказе нет товаров</Typography>              
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.8rem' }}>Заказ #{order?.orderId || order?.id}, Номер #{order?.numberOrder}, Сумма: {formatPrice(order?.totalAmount || 0)}</Typography>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'left' }}>
                  <Typography variant="caption" fontWeight="bold">Информация:</Typography>
                  {debugInfo.map((info, index) => (
                    <Typography key={index} variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{info}</Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Правая колонка - Детали заказа */}
        <Grid size={{xs:12, md:4}}>
          {/* Информация о покупателе */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
              Информация о покупателе
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="ФИО"
                  secondary={order?.customerName || 'Не указано'}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Email"
                  secondary={order?.customerEmail || 'Не указан'}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Телефон"
                  secondary={order?.customerPhone || 'Не указан'}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Информация о доставке */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                Доставка
              </Typography>
              
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Способ"
                    secondary={translateMethodDelivery(order?.deliveryMethod ?? '') || 'Не указан'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Адрес"
                    secondary={order?.deliveryAddress || 'Не указан'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Стоимость доставки"
                    secondary={formatPrice(order?.deliveryCost || 0)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Информация об оплате */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                Оплата
              </Typography>
              
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Способ"
                    secondary={translateMethodPayment(order?.paymentMethod ?? '') || 'Не указан'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Статус"
                    secondary={order?.paymentStatus || 'Неизвестно'}
                  />
                  <Chip
                    label={order?.paymentStatus || 'Неизвестно'}
                    color={order?.paymentStatus?.includes('Оплачен') ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Комментарии */}
          {order?.comments && order.comments.trim() !== '' && (
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Комментарий к заказу
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  "{order.comments}"
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderPage;