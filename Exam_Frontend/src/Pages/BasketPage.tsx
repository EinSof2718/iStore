import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack,
  ShoppingBag,
  LocalShipping,
  CreditCard,
  Discount,
  Receipt,
  ClearAll,
  Close,
  CheckCircle,
  Warning
} from '@mui/icons-material';

// Интерфейсы
interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  color?: string;
  storage?: string;
  countProduct: number;
  maxCountProduct: number;
  inStock: boolean;
  brand?: string;
  model?: string;
}

interface BasketItem {
  basketId: number;
  userId: number;
  productId: number;
  countProduct: number;
  addedDate: string;
  product?: {
    productId: number;
    name: string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    brand?: string;
    model?: string;
    inStock?: boolean;
  };
}

interface PromoCode {
  code: string;
  discount: number;
  minPurchase: number;
  validUntil: string;
  description: string;
}

// Промокоды вынесены вне компонента для избежания пересоздания
const availablePromoCodes: PromoCode[] = [
  {
    code: 'WELCOME10',
    discount: 10,
    minPurchase: 1000,
    validUntil: '2026-12-31',
    description: 'Скидка 10% на первый заказ'
  },
  {
    code: 'SUMMER20',
    discount: 20,
    minPurchase: 5000,
    validUntil: '2027-08-01',
    description: 'Летняя скидка 20%'
  },
  {
    code: 'FREESHIP',
    discount: 0,
    minPurchase: 3000,
    validUntil: '2028-06-12',
    description: 'Бесплатная доставка'
  }
];

const BasketPage = () => {
  const navigate = useNavigate();
  //const theme = useTheme();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Получить ID текущего пользователя
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;  // ← GUID
    }
    return '1';
  };

  // Безопасное преобразование в число
  const safeParseNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    const safePrice = safeParseNumber(price, 0);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(safePrice);
  };

  // Получить URL изображения
  const getImageUrl = (url: string | undefined): string => {
    if (!url) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Njk2OTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const cleanUrl = url.startsWith("/") ? url : "/" + url;
    const fullUrl = `https://localhost:7165${cleanUrl}`;
    console.log('Сформированный URL изображения:', fullUrl); 
    return fullUrl;
  };

// Загрузка корзины с сервера
const fetchBasket = async () => {
  setLoading(true);
  setError('');
  
  try {
    const userId = getCurrentUserId();
    console.log('Загружаем корзину для пользователя:', userId);
    
    // Используем новый endpoint для получения корзины пользователя
    const response = await fetch(`/api/Baskets/user/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // Если endpoint не работает, попробуем старый метод с фильтрацией
      console.log('Пользовательский endpoint не сработал, пробуем общий с фильтрацией');
      const allResponse = await fetch(`/api/Baskets`);
      
      if (allResponse.ok) {
        const allBaskets = await allResponse.json();
        console.log('Все корзины:', allBaskets);
        
        // Фильтруем по userId вручную
        const basketItems = Array.isArray(allBaskets) 
          ? allBaskets.filter((item: any) => safeParseNumber(item.userId) === userId)
          : [];
        
        console.log('Отфильтрованная корзина пользователя:', basketItems);
        await processBasketItems(basketItems);
      } else {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
    } else {
      const basketItems = await response.json();
      console.log('Получена корзина пользователя:', basketItems);
      await processBasketItems(basketItems);
    }
    
  } catch (error) {
    console.error('Ошибка при загрузке корзины:', error);
    setError(error instanceof Error ? error.message : 'Ошибка загрузки корзины');
    setCartItems([]);
    setSelectedItems([]);
  } finally {
    setLoading(false);
  }
};

// Вынесем обработку товаров в отдельную функцию
const processBasketItems = async (basketItems: any[]) => {
  if (!Array.isArray(basketItems)) {
    console.error('Некорректный формат данных:', basketItems);
    throw new Error('Некорректный формат данных корзины');
  }
  
  // Преобразуем данные API в формат CartItem с безопасным парсингом
  const transformedItems: CartItem[] = await Promise.all(
    basketItems.map(async (item: any) => {
      let productDetails = item.product;
      
      // Если информации о товаре нет в корзине, запрашиваем отдельно
      if (!productDetails || !productDetails.name) {
        try {
          const productId = safeParseNumber(item.productId);
          if (productId > 0) {
            const productResponse = await fetch(`/api/products/${productId}`);
            if (productResponse.ok) {
              productDetails = await productResponse.json();
            }
          }
        } catch (err) {
          console.warn('Не удалось получить детали товара:', err);
        }
      }
      
      // Безопасное извлечение данных
      const basketId = safeParseNumber(item.basketId || item.basketItemId);
      const productId = safeParseNumber(item.productId);
      const name = productDetails?.name || `Товар #${productId}`;
      const price = safeParseNumber(productDetails?.price);
      const discountPrice = productDetails?.discountPrice !== undefined 
        ? safeParseNumber(productDetails.discountPrice)
        : undefined;
      const countProduct = safeParseNumber(item.countProduct, 1);
      
      return {
        id: basketId,
        productId: productId,
        name: name,
        price: price,
        discountPrice: discountPrice,
        image: getImageUrl(productDetails?.photos),
        countProduct: countProduct,
        maxCountProduct: 10,
        inStock: productDetails?.inStock ?? true,
        brand: productDetails?.brand || '',
        model: productDetails?.model || ''
      };
    })
  );
  
  console.log('Преобразованные товары:', transformedItems);
  setCartItems(transformedItems);
  
  // Автоматически выбираем все товары в наличии
  const inStockItems = transformedItems
    .filter(item => item.inStock)
    .map(item => item.id);
  setSelectedItems(inStockItems);
};

  // Удалить товар из корзины
  const removeItem = async (itemId: number) => {
    setIsRemoving(itemId);
    
    try {
      console.log('Удаляем товар из корзины:', itemId);
      
      const response = await fetch(`/api/Baskets/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok && response.status !== 204) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } finally {
      setIsRemoving(null);
    }
  };

  // Изменить количество товара
const updateCountProduct = async (itemId: number, newCountProduct: number) => {
  const safeNewCountProduct = Math.max(1, Math.min(10, safeParseNumber(newCountProduct, 1)));
  
  try {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    console.log('Обновляем количество товара:', itemId, 'новое количество:', safeNewCountProduct);
    
    // Способ 1: Используем новый endpoint для обновления только количества
    const updateData = {
      CountProduct: safeNewCountProduct
    };
    
    console.log('Update data:', updateData);
    
    const response = await fetch(`/api/Baskets/${itemId}/countProduct`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('Update response status:', response.status);
    
    // Если новый endpoint не работает, пробуем старый
    if (!response.ok && response.status !== 200) {
      console.log('Endpoint /countProduct не сработал, пробуем обычный PUT');
      
      // Способ 2: Полный PUT запрос
      const fullUpdateData = {
        basketId: itemId,
        userId: getCurrentUserId(),
        productId: item.productId,
        CountProduct: safeNewCountProduct,
        addedDate: new Date().toISOString()
      };
      
      const fullResponse = await fetch(`/api/Baskets/${itemId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullUpdateData)
      });
      
      console.log('Full PUT response status:', fullResponse.status);
      
      if (!fullResponse.ok && fullResponse.status !== 204) {
        const errorText = await fullResponse.text();
        console.error('Update error:', errorText);
        throw new Error(`Ошибка HTTP: ${fullResponse.status}`);
      }
    }
    
    // Обновляем локальное состояние только если API запрос успешен
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, countProduct: safeNewCountProduct}
          : item
      )
    );
    
    console.log('Количество успешно обновлено в базе данных');
    
  } catch (error) {
    console.error('Ошибка при обновлении количества:', error);
    setError('Не удалось обновить количество товара');
    
    // Можно показать уведомление пользователю
    alert('Не удалось сохранить изменения количества. Пожалуйста, попробуйте еще раз.');
  }
};

  // Очистить корзину
  const clearBasket = async () => {
    try {
      console.log('Очищаем всю корзину');
      const userId = getCurrentUserId();
      
      const response = await fetch(`/api/Baskets/user/${userId}`);
      
      if (response.ok) {
        const items: BasketItem[] = await response.json();
        
        await Promise.all(
          items.map(async (item: BasketItem) => {
            try {
              const deleteResponse = await fetch(`/api/Baskets/${item.basketId}`, {
                method: 'DELETE'
              });
              return deleteResponse.ok;
            } catch (err) {
              console.error('Ошибка при удалении элемента:', err);
              return false;
            }
          })
        );
      }
      
      setCartItems([]);
      setSelectedItems([]);
      setShowClearDialog(false);
      
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error);
      setCartItems([]);
      setSelectedItems([]);
      setShowClearDialog(false);
    }
  };

  // Применить промокод
  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoError('Введите промокод');
      return;
    }
    
    const promo = availablePromoCodes.find(p => 
      p.code.toLowerCase() === promoCode.trim().toLowerCase()
    );
    
    if (!promo) {
      setPromoError('Неверный промокод');
      return;
    }
    
    const currentDate = new Date();
    const promoDate = new Date(promo.validUntil);
    
    if (promoDate < currentDate) {
      setPromoError('Промокод истек');
      return;
    }
    
    const subtotal = calculateSubtotal();
    if (subtotal < promo.minPurchase) {
      setPromoError(`Минимальная сумма заказа ${formatPrice(promo.minPurchase)}`);
      return;
    }
    
    setAppliedPromo(promo);
    setPromoError('');
    setPromoCode('');
  };

  // Удалить промокод
  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Выделить/снять выделение с товара
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Выделить все товары
  const selectAllItems = () => {
    const allSelectableItems = cartItems
      .filter(item => item.inStock)
      .map(item => item.id);
    
    if (selectedItems.length === allSelectableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allSelectableItems);
    }
  };

  // Выделить только товары в наличии
  const selectInStockItems = () => {
    const inStockItems = cartItems
      .filter(item => item.inStock)
      .map(item => item.id);
    setSelectedItems(inStockItems);
  };

  // Рассчитать промежуточную сумму
  const calculateSubtotal = () => {
    const subtotal = cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => {
        const price = item.discountPrice !== undefined ? item.discountPrice : item.price;
        return sum + (price * item.countProduct);
      }, 0);
    
    return isNaN(subtotal) ? 0 : subtotal;
  };

  // Рассчитать скидку по промокоду
  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    const subtotal = calculateSubtotal();
    if (appliedPromo.discount > 0) {
      const discount = subtotal * (appliedPromo.discount / 100);
      return isNaN(discount) ? 0 : discount;
    }
    return 0;
  };

  // Рассчитать доставку
  const calculateShipping = () => {
    if (appliedPromo?.code === 'FREESHIP') {
      return 0;
    }
    
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal >= 3000) return 0;
    
    return 300;
  };

  // Рассчитать итоговую сумму
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    
    const total = Math.max(0, subtotal - discount + shipping);
    return isNaN(total) ? 0 : total;
  };

  // Перейти к оформлению заказа
  const proceedToCheckout = () => {
    if (selectedItems.length === 0) {
      setError('Выберите хотя бы один товар для оформления заказа');
      return;
    }
    
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
    const orderData = {
      items: selectedProducts,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      shipping: calculateShipping(),
      total: calculateTotal(),
      promoCode: appliedPromo?.code
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));
    navigate('/makingOrder');
  };

  // Перейти в каталог
  const continueShopping = () => {
    navigate('/catalog');
  };

  // Загружаем корзину при монтировании компонента
  useEffect(() => {
    fetchBasket();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shipping = calculateShipping();
  const total = calculateTotal();
  const selectedCount = selectedItems.length;
  const itemsCount = cartItems.length;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
      >
        <DialogTitle>Очистить корзину?</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить все товары из корзины?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>
            Отмена
          </Button>
          <Button 
            onClick={clearBasket} 
            color="error"
            variant="contained"
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={continueShopping}
          sx={{ mb: 2 }}
        >
          Продолжить покупки
        </Button>
        
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Корзина
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={itemsCount} color="primary">
            <ShoppingCartIcon />
          </Badge>
          <Typography variant="body1" color="text.secondary">
            {itemsCount === 0 
              ? 'Ваша корзина пуста'
              : `${itemsCount} ${itemsCount === 1 ? 'товар' : itemsCount < 5 ? 'товара' : 'товаров'} в корзине`
            }
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Ваша корзина пуста
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Добавьте товары из каталога, чтобы они отобразились здесь
          </Typography>
          <Button variant="contained" size="large" onClick={continueShopping} color='primary'>Перейти к покупкам</Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Левая колонка - Товары */}
          <Grid>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'action.hover',
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
                
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedItems.length === cartItems.filter(item => item.inStock).length}
                        indeterminate={
                          selectedItems.length > 0 && 
                          selectedItems.length < cartItems.filter(item => item.inStock).length
                        }
                        onChange={selectAllItems}
                        disabled={cartItems.filter(item => item.inStock).length === 0}
                      />
                    }
                    label={`Выбрать все (${cartItems.filter(item => item.inStock).length})`}
                  />
                  
                  <Tooltip title="Выбрать товары в наличии">
                    <Button
                      size="small"
                      onClick={selectInStockItems}
                      startIcon={<CheckCircle />}
                      
                    >
                      В наличии
                    </Button>
                  </Tooltip>
                </Box>
                
                <Tooltip title="Очистить корзину">
                  <IconButton
                    onClick={() => setShowClearDialog(true)}
                    size="small"
                  >
                    <ClearAll />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Список товаров */}
              <List>
                {cartItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const isRemovingItem = isRemoving === item.id;
                  const price = item.discountPrice !== undefined ? item.discountPrice : item.price;
                  const totalPrice = price * item.countProduct;
                  
                  return (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ 
                        py: 3,
                        opacity: isRemovingItem ? 0.5 : 1,
                        bgcolor: isSelected ? 'action.selected' : 'transparent'
                      }}>
                        {isRemovingItem ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : (
                          <>
                            {/* Чекбокс выбора */}
                            <Box sx={{ mr: 2 }}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleItemSelection(item.id)}
                                disabled={!item.inStock}
                              />
                            </Box>
                            
                            {/* Изображение товара */}
                            <Box sx={{ 
                              width: 100, 
                              height: 100, 
                              mr: 2,
                              borderRadius: 1,
                              overflow: 'hidden',
                              flexShrink: 0
                            }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                            
                            {/* Информация о товаре */}
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {item.name}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {formatPrice(totalPrice)}
                                </Typography>
                              </Box>
                              
                              {item.brand && item.model && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {item.brand} • {item.model}
                                </Typography>
                              )}
                              
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Цена:</strong> {formatPrice(price)}
                                  {item.discountPrice !== undefined && item.discountPrice < item.price && (
                                    <Typography 
                                      component="span" 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ textDecoration: 'line-through', ml: 1 }}
                                    >
                                      {formatPrice(item.price)}
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Количество:</strong> {item.countProduct}
                                </Typography>
                              </Box>
                              
                              {!item.inStock && (
                                <Alert 
                                  severity="warning" 
                                  icon={<Warning />}
                                  sx={{ mt: 1, py: 0, '& .MuiAlert-message': { py: '4px' } }}
                                >
                                  Нет в наличии
                                </Alert>
                              )}
                              
                              {/* Управление количеством и удаление */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <IconButton 
                                    onClick={() => updateCountProduct(item.id, item.countProduct - 1)}
                                    disabled={item.countProduct <= 1 || !item.inStock}
                                    size="small"
                                  >
                                    <Remove />
                                  </IconButton>
                                  <Typography sx={{ mx: 2, minWidth: 40, textAlign: 'center' }}>
                                    {item.countProduct}
                                  </Typography>
                                  <IconButton 
                                    onClick={() => updateCountProduct(item.id, item.countProduct + 1)}
                                    disabled={item.countProduct >= item.maxCountProduct || !item.inStock}
                                    size="small"
                                  >
                                    <Add />
                                  </IconButton>
                                </Box>
                                
                                <IconButton
                                  onClick={() => removeItem(item.id)}
                                  disabled={isRemovingItem}
                                  size="small"
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Box>
                          </>
                        )}
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          {/* Правая колонка - Итого */}
          <Grid>
            <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Итого
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Товары ({selectedCount})
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(subtotal)}
                  </Typography>
                </Box>
                
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Скидка {appliedPromo?.discount}%
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatPrice(discount)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Доставка
                  </Typography>
                  <Typography variant="body2">
                    {shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">К оплате</Typography>
                  <Typography variant="h5" fontWeight="bold">{formatPrice(total)}</Typography>
                </Box>
              </Box>
              
              {/* Промокод */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                  Промокод
                </Typography>
                
                {appliedPromo ? (
                  <Alert 
                    severity="success" 
                    icon={<Discount />}
                    action={
                      <IconButton size="small" onClick={removePromoCode}>
                        <Close />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2">
                      Промокод "{appliedPromo.code}" применен
                    </Typography>
                    {appliedPromo.discount > 0 && (
                      <Typography variant="body2" fontWeight="bold">
                        Скидка {appliedPromo.discount}%
                      </Typography>
                    )}
                    {appliedPromo.code === 'FREESHIP' && (
                      <Typography variant="body2" fontWeight="bold">
                        Бесплатная доставка
                      </Typography>
                    )}
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Введите промокод"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        error={!!promoError}
                      />
                      <Button
                        variant="outlined"
                        onClick={applyPromoCode}
                      >
                        Применить
                      </Button>
                    </Box>
                    
                    {promoError && (
                      <Typography variant="caption" color="error">
                        {promoError}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      Доступные промокоды: WELCOME10, SUMMER20, FREESHIP
                    </Typography>
                  </>
                )}
              </Box>
              
              {/* Кнопка оформления заказа */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={proceedToCheckout}
                disabled={selectedCount === 0}
                color='primary'
              >
                {selectedCount === 0 ? 'Выберите товары' : 'Перейти к оформлению'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                Нажимая кнопку, вы соглашаетесь с условиями оферты
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Дополнительная информация */}
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">
                    {shipping === 0 ? 'Бесплатная доставка' : `Доставка от ${formatPrice(300)}`}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Оплата картой, наличными, рассрочка
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">
                    Гарантия возврата 14 дней
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default BasketPage;