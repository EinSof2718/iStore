import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Card, CardContent, CardMedia,
  Button, Chip, Divider, Breadcrumbs, Link, CircularProgress, Alert,
  Stack, Paper, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Pagination, Slider, Tooltip,
  useTheme,
} from '@mui/material';
import { Search, ArrowBack } from '@mui/icons-material';

// ── Цветовая карта для индикаторов ────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  'black': '#1a1a1a',
  'white': '#f5f5f5',
  'red': '#ff453a',
  'blue': '#0a84ff',
  'green': '#30d158',
  'yellow': '#ffd60a',
  'orange': '#fd6804',
  'purple': '#bf5af2',
  'pink': '#ff375f',
  'silver': '#c8c8c8',
  'gold': '#d4a843',
  'titanium': '#8e8e8e',
  'desert titanium': '#c4a882',
  'natural titanium':'#b5a99a',
  'black titanium': '#3a3a3a',
  'white titanium': '#e8e8e8',
  'midnight': '#1c1c2e',
  'starlight': '#f2e8d9',
  'ultramarine': '#3a4db5',
  'teal': '#30c4c9',
  'черный': '#1a1a1a',
  'белый': '#f5f5f5',
  'красный': '#ff453a',
  'синий': '#0a84ff',
  'зеленый': '#30d158',
  'золотой': '#d4a843',
  'серебристый': '#c8c8c8',
  'фиолетовый': '#bf5af2',
  'розовый': '#ff6b9d',
  'оранжевый': '#fd6804',
  'серый': '#8e8e8e',
};

const getColorHex = (color: string): string =>
  COLOR_MAP[color.toLowerCase()] ?? '#888888';

// ── Интерфейс ──────────────────────────────────────────────────────────────────
interface Product {
  productId: number;
  name: string;
  brand?: string;
  model?: string;
  price: number;
  discountPrice?: number;
  description: string;
  category: string;
  color?: string;
  storageOptions?: number;
  isBestseller?: boolean;
  isNew?: boolean;
}

// ── Компонент фильтра памяти ───────────────────────────────────────────────────
const StorageChip = ({ label, active, onClick, theme }: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
  theme: any;
}) => (
  <Box
    onClick={onClick}
    sx={{
      px: 2, py: 0.75,
      borderRadius: 2,
      border: '1px solid',
      borderColor: active ? theme.palette.primary.main : theme.palette.divider,
      bgcolor: active ? theme.palette.primary.main : 'transparent',
      color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
      fontSize: '0.8rem',
      fontWeight: active ? 700 : 400,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      '&:hover': {
        borderColor: active ? theme.palette.primary.main : theme.palette.text.primary,
        color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
      },
    }}
  >
    {label}
  </Box>
);

// ── Компонент фильтра цвета ────────────────────────────────────────────────────
const ColorDot = ({ color, active, onClick, theme }: { 
  color: string; 
  active: boolean; 
  onClick: () => void;
  theme: any;
}) => {
  const hex = getColorHex(color);
  const isLight = ['white', 'белый', 'silver', 'серебристый', 'starlight', 'white titanium'].includes(color.toLowerCase());

  return (
    <Tooltip title={color} placement="top">
      <Box
        onClick={onClick}
        sx={{
          width: 32, height: 32,
          borderRadius: '50%',
          bgcolor: hex,
          border: active 
            ? `2px solid ${theme.palette.primary.main}` 
            : `1px solid ${isLight ? theme.palette.divider : 'transparent'}`,
          boxShadow: active 
            ? `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}` 
            : 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'scale(1.15)' },
        }}
      />
    </Tooltip>
  );
};

// ── Главный компонент ──────────────────────────────────────────────────────────
const GamingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();
  const modelFromUrl = searchParams.get('model');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedModel, setSelectedModel] = useState(modelFromUrl || 'all');
  const [selectedStorage, setSelectedStorage] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([20000, 200000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [productImg, setProductImg] = useState<Record<number, string>>({});

  // Цвета и память из характеристик (SpecificationsProducts)
  const [specColors, setSpecColors] = useState<string[]>([]);
  const [specStorage, setSpecStorage] = useState<string[]>([]);

  // productId товаров с выбранным цветом (null = фильтр не применён)
  const [colorFilterIds, setColorFilterIds] = useState<number[] | null>(null);
  const [storageFilterIds, setStorageFilterIds] = useState<number[] | null>(null);

  const extractModel = (name: string): string => {
    if (!name) return '';
    const match = name.match(/(PlayStation|PS|Xbox|Nintendo|Steam Deck|Switch)\s+([A-Za-zА-Яа-я0-9\s]+?)(?:\s+\d+\s*(?:GB|ГБ|ТБ|TB)\b|$)/i);
    return match ? match[1].trim() : '';
  };

  const loadAllProductImages = async (prods: Product[]) => {
    const map: Record<number, string> = {};
    prods.forEach((p: any) => {
      map[p.productId] = p.photos ? p.photos.split(',')[0].trim() : '/placeholder-product.png';
    });
    setProductImg(map);
  };

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr: Product[] = Array.isArray(data) ? data : (data?.items ?? []);

        const gamingProducts = arr.filter(p=>{
            const name = (p.name || '').toLowerCase();
            const category = typeof p.category==="string" ? p.category.toLowerCase() : '';
            const brand = (p.brand || '').toLowerCase();

            const gamingKeywords = [
                'playstation', 'ps5', 'ps4', 'ps3', 'ps vita',
                'xbox', 'xbox series', 'xbox one',
                'nintendo', 'switch', 'wii', 'gameboy',
                'steam deck', 'rog ally', 'legion go',
                'gaming', 'игровая', 'приставка', 'консоль',
                'play station', 'игровой'
            ];
            
            return gamingKeywords.some(keyword => name.includes(keyword) || category.includes(keyword) || brand.includes(keyword));
        });

        const final = gamingProducts.length > 0 ? gamingProducts : [];
        setProducts(final);
        setFilteredProducts(final);
        await loadAllProductImages(final);

        // Загружаем уникальные цвета из характеристик
        try {
          const colorsRes = await fetch('/api/SpecificationsProducts/colors');
          if (colorsRes.ok) {
            const colorsData: string[] = await colorsRes.json();
            setSpecColors(colorsData);
          }
        } catch (e) {
          console.warn('Не удалось загрузить цвета:', e);
        }

        // Загружаем уникальные объемы памяти из характеристик
        try {
          const storageRes = await fetch('/api/SpecificationsProducts/storage');
          if (storageRes.ok) {
            const storageData: string[] = await storageRes.json();
            setSpecStorage(storageData);
          }
        } catch (e) {
          console.warn('Не удалось загрузить объемы памяти:', e);
        }

      } catch {
        setError('Ошибка загрузки данных с сервера');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  // При выборе цвета — запрашиваем productId с бэкенда
  useEffect(() => {
    if (selectedColor === 'all') {
      setColorFilterIds(null);
      return;
    }
    const fetchColorFilter = async () => {
      try {
        const res = await fetch(`/api/SpecificationsProducts/filterColor?color=${encodeURIComponent(selectedColor)}`);
        if (res.ok) {
          const ids: number[] = await res.json();
          setColorFilterIds(ids);
        }
      } catch (e) {
        console.warn('Ошибка фильтрации по цвету:', e);
        setColorFilterIds(null);
      }
    };
    fetchColorFilter();
  }, [selectedColor]);

  // При выборе памяти — запрашиваем productId с бэкенда
  useEffect(() => {
    if (selectedStorage === 'all') {
      setStorageFilterIds(null);
      return;
    }
    const fetchStorageFilter = async () => {
      try {
        const res = await fetch(`/api/SpecificationsProducts/filterStorage?storage=${encodeURIComponent(selectedStorage)}`);
        if (res.ok) {
          const ids: number[] = await res.json();
          setStorageFilterIds(ids);
        }
      } catch (e) {
        console.warn('Ошибка фильтрации по памяти:', e);
        setStorageFilterIds(null);
      }
    };
    fetchStorageFilter();
  }, [selectedStorage]);

  useEffect(() => {
    if (!products.length) { setFilteredProducts([]); return; }
    let filtered = [...products];

    if (selectedModel !== 'all')
      filtered = filtered.filter(p =>
        (p.model || extractModel(p.name)).toLowerCase().trim() === selectedModel.toLowerCase().trim()
      );

    // Убираем локальную фильтрацию по памяти, оставляем только через бэкенд
    // if (selectedStorage !== 'all')
    //   filtered = filtered.filter(p => (p.storageOptions ? `${p.storageOptions} GB` : '') === selectedStorage);

    // Фильтр по цвету через productId полученные с бэкенда
    if (selectedColor !== 'all' && colorFilterIds !== null)
      filtered = filtered.filter(p => colorFilterIds.includes(p.productId));

    // Фильтр по памяти через productId полученные с бэкенда
    if (selectedStorage !== 'all' && storageFilterIds !== null)
      filtered = filtered.filter(p => storageFilterIds.includes(p.productId));

    filtered = filtered.filter(p => {
      const price = p.discountPrice || p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      const pa = a.discountPrice || a.price || 0;
      const pb = b.discountPrice || b.price || 0;
      if (sortBy === 'price-asc') return pa - pb;
      if (sortBy === 'price-desc') return pb - pa;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });

    setFilteredProducts(filtered);
    setPage(1);
  }, [products, selectedModel, selectedStorage, storageFilterIds, selectedColor, colorFilterIds, sortBy, priceRange, searchQuery]);

  const handleResetFilters = () => {
    setSelectedModel('all'); setSelectedStorage('all'); setSelectedColor('all');
    setPriceRange([20000, 200000]); setSearchQuery(''); setSortBy('popular');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

  const models = [...new Set(products.map(p => p.model || extractModel(p.name)).filter(Boolean))];
  // Используем данные с бэкенда для памяти, если есть
  const storages = specStorage.length > 0 
    ? specStorage 
    : [...new Set(products.map(p => p.storageOptions ? `${p.storageOptions} GB` : '').filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
  // цвета берём из характеристик (specColors)
  const colors = specColors;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      <Button variant="contained" onClick={() => navigate('/')}>На главную</Button>
    </Container>
  );

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default, 
      minHeight: '100vh', 
      pb: 8 
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Хлебные крошки */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            component={RouterLink} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              color: theme.palette.text.secondary,
              '&:hover': { color: theme.palette.text.primary }
            }}
          >
            Главная
          </Link>
          <Link 
            component={RouterLink} 
            to="/catalog" 
            sx={{ 
              textDecoration: 'none', 
              color: theme.palette.text.secondary,
              '&:hover': { color: theme.palette.text.primary }
            }}
          >
            Каталог
          </Link>
          <Typography color={theme.palette.text.primary}>Гейминг</Typography>
        </Breadcrumbs>

        {/* Заголовок */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
              Гейминг
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Выберите свою модель. Все модели в наличии с гарантией.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ 
              borderColor: theme.palette.divider, 
              color: theme.palette.text.primary,
              '&:hover': { 
                borderColor: theme.palette.text.primary,
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            Назад
          </Button>
        </Box>

        {/* ── Панель фильтров ─────────────────────────────────────────────── */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          bgcolor: theme.palette.background.paper, 
          border: `1px solid ${theme.palette.divider}` 
        }}>

          {/* Строка поиска + сортировка */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              placeholder="Поиск..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size="small"
              autoComplete="off"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
              }}
              sx={{
                flex: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.background.default,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
                '& input': { color: theme.palette.text.primary },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
              <InputLabel sx={{ color: theme.palette.text.secondary }}>Модель</InputLabel>
              <Select 
                value={selectedModel} 
                label="Модель" 
                onChange={e => setSelectedModel(e.target.value)}
                sx={{ 
                  bgcolor: theme.palette.background.default, 
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                }}
              >
                <MenuItem value="all">Все модели</MenuItem>
                {models.map(m => <MenuItem key={m} value={m}>Гейминг {m}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel sx={{ color: theme.palette.text.secondary }}>Сортировка</InputLabel>
              <Select 
                value={sortBy} 
                label="Сортировка" 
                onChange={e => setSortBy(e.target.value)}
                sx={{ 
                  bgcolor: theme.palette.background.default, 
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.text.secondary },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                }}
              >
                <MenuItem value="popular">Популярные</MenuItem>
                <MenuItem value="price-asc">Цена: по возрастанию</MenuItem>
                <MenuItem value="price-desc">Цена: по убыванию</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ borderColor: theme.palette.divider, mb: 3 }} />

          {/* Фильтры: память + цвет + цена */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Память */}
            {storages.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary, 
                  letterSpacing: 1, 
                  textTransform: 'uppercase', 
                  display: 'block', 
                  mb: 1.5 
                }}>
                  Память
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StorageChip 
                    label="Все" 
                    active={selectedStorage === 'all'} 
                    onClick={() => setSelectedStorage('all')}
                    theme={theme}
                  />
                  {storages.map(s => (
                    <StorageChip 
                      key={s} 
                      label={s} 
                      active={selectedStorage === s} 
                      onClick={() => setSelectedStorage(s)}
                      theme={theme}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Цвет — из характеристик товаров */}
            {colors.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary, 
                  letterSpacing: 1, 
                  textTransform: 'uppercase', 
                  display: 'block', 
                  mb: 1.5 
                }}>
                  Цвет {selectedColor !== 'all' && (
                    <Box component="span" sx={{ color: theme.palette.text.primary, ml: 1 }}>
                      — {selectedColor}
                    </Box>
                  )}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                  {/* Кнопка "Все" для цвета */}
                  <Box
                    onClick={() => setSelectedColor('all')}
                    sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: selectedColor === 'all' 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      boxShadow: selectedColor === 'all' 
                        ? `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}` 
                        : 'none',
                      background: 'conic-gradient(#ff453a 0deg 60deg, #ff9f0a 60deg 120deg, #30d158 120deg 180deg, #0a84ff 180deg 240deg, #bf5af2 240deg 300deg, #ff375f 300deg 360deg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'scale(1.15)' },
                    }}
                  />
                  {colors.map(c => (
                    <ColorDot 
                      key={c} 
                      color={c} 
                      active={selectedColor === c} 
                      onClick={() => setSelectedColor(c)}
                      theme={theme}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Цена */}
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary, 
                letterSpacing: 1, 
                textTransform: 'uppercase', 
                display: 'block', 
                mb: 1.5 
              }}>
                Цена
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as [number, number])}
                valueLabelDisplay="auto"
                valueLabelFormat={v => formatPrice(v)}
                min={0} max={200000} step={5000}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': { 
                    bgcolor: theme.palette.primary.main,
                    border: `2px solid ${theme.palette.background.default}` 
                  },
                  '& .MuiSlider-track': { bgcolor: theme.palette.primary.main },
                  '& .MuiSlider-rail': { bgcolor: theme.palette.divider },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {formatPrice(priceRange[0])}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {formatPrice(priceRange[1])}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Итог фильтров */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: 3, 
            pt: 2, 
            borderTop: `1px solid ${theme.palette.divider}` 
          }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Найдено: <Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                {filteredProducts.length}
              </Box> моделей
            </Typography>
            <Button 
              size="small" 
              onClick={handleResetFilters}
              sx={{ 
                color: theme.palette.text.secondary, 
                fontSize: 12,
                '&:hover': { 
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              Сбросить все фильтры
            </Button>
          </Box>
        </Paper>

        {/* ── Карточки товаров ───────────────────────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: theme.palette.background.paper, 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
              Ничего не найдено
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
              Попробуйте изменить параметры фильтрации
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2.5} key={`${page}-${selectedModel}-${selectedStorage}-${selectedColor}-${sortBy}`}>
              {filteredProducts.slice((page - 1) * 12, page * 12).map((product, idx) => (
                <Grid key={product.productId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    component={RouterLink}
                    to={`/products/${product.productId}`}
                    sx={{
                      height: '100%', display: 'flex', flexDirection: 'column',
                      textDecoration: 'none', position: 'relative',
                      bgcolor: theme.palette.background.paper, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                      '@keyframes fadeUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'none' },
                      },
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: isDarkMode 
                          ? '0 16px 32px rgba(0,0,0,0.5)' 
                          : '0 16px 32px rgba(0,0,0,0.12)',
                        borderColor: theme.palette.primary.main,
                      },
                      '&:hover .add-btn': { opacity: 1, transform: 'translateY(0)' },
                    }}
                  >
                    {/* Бейджи */}
                    <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      {product.isNew && (
                        <Chip 
                          label="NEW" 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            color: theme.palette.primary.contrastText, 
                            fontWeight: 700, 
                            height: 22 
                          }} 
                        />
                      )}
                      {!!product.discountPrice && (
                        <Chip 
                          label="SALE" 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.error.main, 
                            color: theme.palette.error.contrastText, 
                            fontWeight: 700, 
                            height: 22 
                          }} 
                        />
                      )}
                      {product.isBestseller && (
                        <Chip 
                          label="HIT" 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.warning.main, 
                            color: theme.palette.warning.contrastText, 
                            fontWeight: 700, 
                            height: 22 
                          }} 
                        />
                      )}
                    </Box>

                    {/* Фото */}
                    <Box sx={{ 
                      height: 280, 
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '12px 12px 0 0', 
                      overflow: 'hidden' 
                    }}>
                      <CardMedia 
                        component="img" 
                        image={productImg[product.productId] || '/placeholder-product.png'} 
                        alt={product.name}
                        sx={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }}
                        onError={(e: any) => { e.target.src = '/placeholder-product.png'; }} 
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ 
                        color: theme.palette.text.primary, 
                        mb: 0.5,
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        minHeight: 56 
                      }}>
                        {product.name}
                      </Typography>

                      {/* Цвет + память */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                        {product.color && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Box sx={{ 
                              width: 10, height: 10, borderRadius: '50%', 
                              bgcolor: getColorHex(product.color),
                              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, 
                              flexShrink: 0 
                            }} />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {product.color}
                            </Typography>
                          </Stack>
                        )}
                        {product.color && product.storageOptions && (
                          <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                            ·
                          </Typography>
                        )}
                        {product.storageOptions && (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {product.storageOptions} ГБ
                          </Typography>
                        )}
                      </Stack>

                      {/* Цена */}
                      {product.discountPrice ? (
                        <Stack direction="row" spacing={1} alignItems="baseline">
                          <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.error.main }}>
                            {formatPrice(product.discountPrice)}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary, 
                            textDecoration: 'line-through' 
                          }}>
                            {formatPrice(product.price)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                          {formatPrice(product.price)}
                        </Typography>
                      )}
                    </CardContent>

                
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Пагинация */}
            {filteredProducts.length > 12 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={Math.ceil(filteredProducts.length / 12)} 
                  page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': { 
                      color: theme.palette.text.primary, 
                      borderColor: theme.palette.divider 
                    },
                    '& .Mui-selected': { 
                      bgcolor: `${theme.palette.primary.main} !important`, 
                      color: `${theme.palette.primary.contrastText} !important` 
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default GamingPage;