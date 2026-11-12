import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Link as RouteLink } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Card, CardContent, CardMedia,
  Button, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Pagination, Chip, Divider, IconButton, Slider, Breadcrumbs,
  CircularProgress, Alert, Stack, Paper
} from '@mui/material';
import { Search, ArrowBack } from '@mui/icons-material';

const COLOR_MAP: Record<string, string> = {
  'black': '#1a1a1a', 'white': '#f5f5f5', 'red': '#ff453a', 'blue': '#0a84ff',
  'green': '#30d158', 'yellow': '#ffd60a', 'purple': '#bf5af2', 'pink': '#ff375f',
  'silver': '#c8c8c8', 'gold': '#d4a843', 'titanium': '#8e8e8e', 'desert titanium': '#c4a882',
  'natural titanium':'#b5a99a', 'black titanium': '#3a3a3a', 'white titanium': '#e8e8e8',
  'midnight': '#1c1c2e', 'starlight': '#f2e8d9', 'ultramarine': '#3a4db5', 'teal': '#30c4c9',
  'черный': '#1a1a1a', 'белый': '#f5f5f5', 'красный': '#ff453a', 'синий': '#0a84ff',
  'зеленый': '#30d158', 'золотой': '#d4a843', 'серебристый': '#c8c8c8', 'фиолетовый': '#bf5af2',
  'розовый': '#ff6b9d', 'серый': '#8e8e8e',
};

const getColorHex = (color: string): string => COLOR_MAP[color.toLowerCase()] ?? '#888888';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  mainImageUrl?: string;
  brand?: string;
  model?: string;
  color?: string;
  storageOptions?: number;
  discount?: number;
  discountPrice?: number;
  isBestseller?: boolean;
}

interface ApiResponse {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterState {
  parentCategoryId: number | null;
  categoryId: number | null;
  minPrice: number;
  maxPrice: number;
  search: string;
  sortBy: string;
  sortDescending: boolean;
  page: number;
  pageSize: number;
  selectedModel: string;
  selectedStorage: string;
  selectedColor: string;
  priceRange: [number, number];
}

interface ParentCategory {
  parentCategoryId: number;
  name: string;
  children: { categoryId: number, name: string, productCnt: number }[];
}

const CatalogPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState("");
  const [serverCategories, setServerCategories] = useState<{ categoryId: number, name: string }[]>([]);
  const [serverParentsCategories, setServerParentsCategories] = useState<ParentCategory[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    parentCategoryId: null,
    categoryId: queryParams.get('categoryId') ? Number(queryParams.get("categoryId")) : null,
    minPrice: 0,
    maxPrice: 300000,
    search: queryParams.get('search') || '',
    sortBy: 'price-desc',
    sortDescending: false,
    page: 1,
    pageSize: 12,
    selectedModel: 'all',
    selectedStorage: 'all',
    selectedColor: 'all',
    priceRange: [0, 300000]
  });

  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/Categories");
      if (response.ok) setServerCategories(await response.json());
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchParentsCategory = async () => {
    try {
      const response = await fetch("/api/Categories/tree");
      if (response.ok) setServerParentsCategories(await response.json());
    } catch (error) {
      console.error('Error fetching parents categories:', error);
    }
  };

  const getMainProductImg = async (productId: number): Promise<string> => {
    try {
      const response = await fetch(`/api/PhotosProducts/product/${productId}`);
      if (response.ok) {
        const photos = await response.json();
        if (photos && Array.isArray(photos) && photos.length > 0) {
          const mainPhoto = photos.find((p: any) => p.mainPhoto === true);
          if (mainPhoto?.urlPhoto) return mainPhoto.urlPhoto;
          if (photos[0]?.urlPhoto) return photos[0].urlPhoto;
        }
      }
      return '/placeholder-product.png';
    } catch {
      return '/placeholder-product.png';
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      else if (filters.parentCategoryId) {
        const parent = serverParentsCategories.find(p => p.parentCategoryId === filters.parentCategoryId);
        if (parent && parent.children.length > 0) {
          params.append('categoryIds', parent.children.map(c => c.categoryId).join(','));
        }
      }

      if (filters.search) params.append('search', filters.search);
      if (filters.priceRange[0] > 0) params.append("minPrice", filters.priceRange[0].toString());
      if (filters.priceRange[1] < 300000) params.append("maxPrice", filters.priceRange[1].toString());
      
      // ⬇️ ИЗМЕНЕНИЕ 1: Отправляем выбранную сортировку на бэкенд ⬇️
      params.append('sortBy', filters.sortBy || 'name');
      params.append('sortDescending', filters.sortDescending.toString());
      params.append('page', filters.page.toString());
      params.append('pageSize', filters.pageSize.toString());

      const url = `/api/products?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: ApiResponse = await response.json();
      
      if (data && data.items && Array.isArray(data.items)) {
        const productsWithImages = await Promise.all(
          data.items.map(async (product) => {
            const mainImage = await getMainProductImg(product.productId);
            return { ...product, mainImageUrl: mainImage, imageUrl: mainImage };
          })
        );

        setProducts(productsWithImages);
        setFilteredProducts(productsWithImages);
        setPagination({ totalCount: data.totalCount, totalPages: data.totalPages });
      } else {
        throw new Error('Неправильный формат данных от сервера');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length === 0) return;
    let filtered = [...products];

    if (filters.selectedModel !== 'all') {
      filtered = filtered.filter(p => {
        const model = p.model || extractModel(p.name);
        return model.toLowerCase().trim() === filters.selectedModel.toLowerCase().trim();
      });
    }

    // ⬇️ ИЗМЕНЕНИЕ 2: Локальная сортировка УДАЛЕНА (сортирует бэкенд) ⬇️

    setFilteredProducts(filtered);
  }, [products, filters.selectedModel, filters.selectedStorage, 
      filters.selectedColor, filters.sortBy, filters.priceRange]);

  useEffect(() => {
    fetchParentsCategory();
    fetchCategories();
    fetchProducts();
  }, [
    filters.page, 
    filters.pageSize, 
    filters.sortBy,          // ⬅️ ИЗМЕНЕНИЕ 3: Добавлено в зависимости
    filters.sortDescending,
    filters.categoryId, 
    filters.parentCategoryId, 
    filters.search,
    filters.priceRange[0], 
    filters.priceRange[1]
  ]);

  const handleCategoryChange = (categoryId: number | null) => {
    setFilters(prev => ({ ...prev, categoryId, page: 1, selectedModel: 'all' }));
  };

  const handleParentCategoryChange = (parentCategoryId: number | null) => {
    setFilters(prev => ({ ...prev, parentCategoryId, categoryId: null, page: 1 }));
  };

  const extractModel = (name: string): string => {
    if (!name) return '';
    const match = name.match(/(?:iPhone|iPad|MacBook|Watch|AirPods|Samsung|PlayStation|PS|Xbox|Nintent)\s+([A-Za-zА-Яа-я0-9\s]+?)(?:\s+\d+\s*(?:GB|ГБ|ТБ|TB)\b|$)/i);
    return match ? match[1].trim() : '';
  };

  const getUniqueModels = () => [...new Set(products.map(p => p.model || extractModel(p.name)).filter(Boolean))];
  const getUniqueStorages = () => [...new Set(products.map(p => p.storageOptions ? `${p.storageOptions}GB` : '').filter(Boolean))];
  const getUniqueColors = () => [...new Set(products.map(p => p.color || '').filter(Boolean))];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value);
  const handleSearchSubmit = () => setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearchSubmit(); };
  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setFilters(prev => ({ ...prev, priceRange: [min, max] }));
  };
  const handleSortChange = (sortBy: string) => setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      parentCategoryId: null, categoryId: null, minPrice: 0, maxPrice: 300000, search: '',
      sortBy: 'price-desc', sortDescending: false, page: 1, pageSize: 12,
      selectedModel: 'all', selectedStorage: 'all', selectedColor: 'all',
      priceRange: [0, 300000]
    });
  };
  
  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

  const breadcrumbs = [
    <Link key="1" to="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Главная</Link>,
    <Typography key="2" color="text.primary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Каталог</Typography>
  ];
  if (filters.categoryId) {
    const selectedCategory = serverCategories.find(c => c.categoryId === filters.categoryId);
    breadcrumbs.splice(1, 0, 
      <Typography key="1.5" color="text.primary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{selectedCategory?.name || "Категория"}</Typography>
    );
  }

  const models = getUniqueModels();
  const storages = getUniqueStorages();
  const colors = getUniqueColors();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Breadcrumbs separator="›" sx={{ mb: { xs: 2, md: 3 }, '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap' }, '& .MuiBreadcrumbs-separator': { mx: { xs: 0.5, md: 1 } } }}>
        {breadcrumbs}
      </Breadcrumbs>

      {/* Заголовок */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 0 }, mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }, mb: { xs: 0, sm: 0 } }}>
            {filters.categoryId ? serverCategories.find(c => c.categoryId === filters.categoryId)?.name : 'Каталог товаров'}
          </Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)} size="small" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
            Назад
          </Button>
        </Box>
      </Box>

      {/* Панель фильтров */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth placeholder="Поиск товара..." value={searchInput} onChange={handleSearchChange} onKeyPress={handleKeyPress} size="small"
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={handleSearchSubmit} size="small"><Search /></IconButton></InputAdornment>) }}
              helperText="Нажмите Enter для поиска" sx={{ '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', md: '0.75rem' } } }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: { xs: 2, md: 2 }, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: 1 } }}>
                <InputLabel>Продукт</InputLabel>
                <Select value={filters.parentCategoryId || ''} label="Продукт" onChange={(e) => handleParentCategoryChange(e.target.value ? Number(e.target.value) : null)}>
                  <MenuItem value="">Все Продукты</MenuItem>
                  {serverParentsCategories.map(parent => (<MenuItem key={parent.parentCategoryId} value={parent.parentCategoryId}>{parent.name}</MenuItem>))}
                </Select>
              </FormControl>

              {filters.parentCategoryId && (
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: 1 } }}>
                  <InputLabel>Категория</InputLabel>
                  <Select value={filters.categoryId || ''} label="Категория" onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}>
                    <MenuItem value="">Все категории</MenuItem>
                    {serverParentsCategories.find(p => p.parentCategoryId === filters.parentCategoryId)?.children.map(category => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>{category.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {filters.categoryId && models.length > 0 && (
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: 1 } }}>
                  <InputLabel>Модель</InputLabel>
                  <Select value={filters.selectedModel} label="Модель" onChange={(e) => setFilters(prev => ({ ...prev, selectedModel: e.target.value, page: 1 }))}>
                    <MenuItem value="all">Все модели</MenuItem>
                    {models.map(model => (<MenuItem key={model} value={model}>{model}</MenuItem>))}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: 1 } }}>
                <InputLabel>Сортировка</InputLabel>
                <Select value={filters.sortBy} label="Сортировка" onChange={(e) => handleSortChange(e.target.value as string)}>
                  <MenuItem value="price-asc">Цена: по возрастанию</MenuItem>
                  <MenuItem value="price-desc">Цена: по убыванию</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 2, md: 3 } }} />

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {storages.length > 0 && (
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Память</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Все" size="small" onClick={() => setFilters(prev => ({ ...prev, selectedStorage: 'all' }))} color={filters.selectedStorage === 'all' ? 'primary' : 'default'} variant={filters.selectedStorage === 'all' ? 'filled' : 'outlined'} />
                {storages.map(storage => (
                  <Chip key={storage} label={storage} size="small" onClick={() => setFilters(prev => ({ ...prev, selectedStorage: storage }))} color={filters.selectedStorage === storage ? 'primary' : 'default'} variant={filters.selectedStorage === storage ? 'filled' : 'outlined'} />
                ))}
              </Stack>
            </Grid>
          )}

          {colors.length > 0 && (
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Цвет</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Все" size="small" onClick={() => setFilters(prev => ({ ...prev, selectedColor: 'all' }))} color={filters.selectedColor === 'all' ? 'primary' : 'default'} variant={filters.selectedColor === 'all' ? 'filled' : 'outlined'} />
                {colors.map(color => (
                  <Chip key={color} label={color} size="small" onClick={() => setFilters(prev => ({ ...prev, selectedColor: color }))} color={filters.selectedColor === color ? 'primary' : 'default'} variant={filters.selectedColor === color ? 'filled' : 'outlined'} />
                ))}
              </Stack>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Цена, ₽</Typography>
            <Slider
              value={filters.priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" valueLabelFormat={(value) => formatPrice(value)}
              min={0} max={300000} step={10000} sx={{ minWidth: 'auto', width: '100%' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>от {formatPrice(filters.priceRange[0])}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>до {formatPrice(filters.priceRange[1])}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, mt: { xs: 2, md: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Найдено: {filteredProducts.length} товаров</Typography>
          <Button size="small" onClick={handleResetFilters} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Сбросить все фильтры</Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Товары не найдены</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Попробуйте изменить параметры фильтрации</Typography>
          <Button variant="outlined" onClick={handleResetFilters}>Сбросить фильтры</Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', margin: 0 }}>
            {filteredProducts
              //.slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize)
              .map((product, idx) => (
                <Grid key={product.productId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    component={RouteLink} to={`/products/${product.productId}`}
                    sx={{
                      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textDecoration: 'none', position: 'relative',
                      bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: 'all 0.3s ease',
                      animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
                      '&:hover': {
                        transform: { xs: 'none', md: 'translateY(-6px)' },
                        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 16px 32px rgba(0,0,0,0.5)' : '0 16px 32px rgba(0,0,0,0.12)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: { xs: 8, md: 12 }, left: { xs: 8, md: 12 }, zIndex: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(product.discount || 0) > 0 && (<Chip label={`-${product.discount}%`} color="error" size="small" sx={{ fontWeight: 700, fontSize: { xs: '0.65rem', md: '0.7rem' }, height: { xs: 20, md: 24 } }} />)}
                      {product.isBestseller && (<Chip label="ХИТ" color="error" size="small" sx={{ fontWeight: 700, fontSize: { xs: '0.65rem', md: '0.7rem' }, height: { xs: 20, md: 24 } }} />)}
                    </Box>

                    <Box sx={{ height: { xs: 200, sm: 240, md: 280 }, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px 12px 0 0', overflow: 'hidden', p: { xs: 1, md: 2 } }}>
                      <CardMedia component="img" image={product.mainImageUrl || product.imageUrl || '/placeholder-product.png'} alt={product.name} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} onError={(e: any) => { e.target.src = '/placeholder-product.png'; }} />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 }, pb: { xs: 1.5, md: 1 }, '&:last-child': { pb: { xs: 1.5, md: 1 } } }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: { xs: 44, md: 56 }, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.25rem' }, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>

                      <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" sx={{ mb: { xs: 1, md: 1.5 }, flexWrap: 'wrap', gap: 0.5 }}>
                        {product.color && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Box sx={{ width: { xs: 8, md: 10 }, height: { xs: 8, md: 10 }, borderRadius: '50%', bgcolor: getColorHex(product.color), border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{product.color}</Typography>
                          </Stack>
                        )}
                        {product.color && product.storageOptions && (<Typography variant="caption" sx={{ color: 'divider' }}>·</Typography>)}
                        {product.storageOptions && (<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{product.storageOptions} ГБ</Typography>)}
                      </Stack>

                      {product.discountPrice ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 1 }} alignItems={{ xs: 'flex-start', sm: 'baseline' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'error.main', fontSize: { xs: '1.05rem', md: '1.25rem' } }}>{formatPrice(product.discountPrice)}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{formatPrice(product.price)}</Typography>
                        </Stack>
                      ) : (
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', fontSize: { xs: '1.05rem', md: '1.25rem' } }}>{formatPrice(product.price)}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 6 }, px: { xs: 1, md: 0 } }}>
              <Pagination
                count={pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                siblingCount={0}
                boundaryCount={1}
                sx={{ '& .MuiPaginationItem-root': { fontSize: { xs: '0.8rem', md: '0.875rem' }, minWidth: { xs: 28, md: 32 }, height: { xs: 28, md: 32 } } }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CatalogPage;