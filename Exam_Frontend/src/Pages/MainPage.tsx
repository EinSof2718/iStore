import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Container, Box, Typography, Button, Card, CardContent,
  Divider, Link, Stack, Paper, Avatar, IconButton, Menu, MenuItem,
  Grid, Badge, useTheme,
} from '@mui/material';
import {
  Phone, LocationOn, Facebook, Instagram, LocalShipping, Verified, CreditCard,
  Support, Apple, Laptop, Watch, Headphones, Games, Speaker, AccountCircle,
  Logout, KeyboardArrowDown, ShoppingCartOutlined, KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { Sun, Moon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useAppTheme } from '../context/ThemeContext';

/* ── Типы ────────────────────────────────────────────────────────────────── */
interface ProductItem {
  productId: number;
  name: string;
  category?: string;
  brand?: string;
  price?: number;
  photos?: string;
  description?: string;
}

interface Product {
  productId?: number;
  name: string;
  desc: string;
  price: string;
  image: string;
  isNew?: boolean;
  discount?: number;
  link: string;
}

/* ── Загрузка фото ───────────────────────────────────────────────────────── */
const getMainProductImg = async (productId: number): Promise<string> => {
  try {
    const r = await fetch(`/api/PhotosProducts/product/${productId}`);
    if (r.ok) {
      const photos = await r.json();
      if (photos?.length) {
        return photos.find((p: any) => p.mainPhoto)?.urlPhoto || photos[0]?.urlPhoto;
      }
    }
  } catch {}
  return '/placeholder-product.png';
};

/* ── Карусель ────────────────────────────────────────────────────────────── */
const ProductCarousel = ({ products }: { products: Product[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const G = 16;
  const [cardWidth, setCardWidth] = useState(280);

  useEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w < 600) setCardWidth(220);
      else if (w < 900) setCardWidth(250);
      else setCardWidth(280);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const scroll = (d: number) =>
    containerRef.current?.scrollBy({ left: d, behavior: 'smooth' });

  useEffect(() => {
    const t = setInterval(() => {
      if (!containerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll(cardWidth + G);
      }
    }, 4000);
    return () => clearInterval(t);
  }, [cardWidth]);

  return (
    <Box sx={{ position: 'relative', mb: { xs: 3, md: 6 } }}>
      <IconButton
        onClick={() => scroll(-(cardWidth + G))}
        sx={{
          position: 'absolute',
          left: { xs: -8, md: -45 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          boxShadow: 2,
          display: { xs: 'none', md: 'flex' },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          gap: `${G}px`,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          py: 2,
          px: 0,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          scrollSnapType: { xs: 'x mandatory', md: 'none' },
        }}
      >
        {products.map((p, i) => (
          <Card
            key={i}
            component={RouteLink}
            to={p.link}
            sx={{
              minWidth: cardWidth,
              maxWidth: cardWidth,
              flexShrink: 0,
              textDecoration: 'none',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              scrollSnapAlign: { xs: 'start', md: 'none' },
              '&:hover': {
                transform: { xs: 'none', md: 'translateY(-6px)' },
                boxShadow: 4,
                borderColor: 'primary.main',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                height: { xs: 200, md: 250 },
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                style={{ maxWidth: '110%', maxHeight: '95%', objectFit: 'contain' }}
              />
              {p.discount && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'error.main',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  −{p.discount}%
                </Box>
              )}
            </Box>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}
              >
                {p.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                noWrap
                sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
              >
                {p.desc}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color="primary.main"
                sx={{ mt: 1, fontSize: { xs: '0.9rem', md: '0.875rem' } }}
              >
                {p.price}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <IconButton
        onClick={() => scroll(cardWidth + G)}
        sx={{
          position: 'absolute',
          right: { xs: -8, md: -45 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          boxShadow: 2,
          display: { xs: 'none', md: 'flex' },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
};

/* ── Главный компонент ───────────────────────────────────────────────────── */
const MainPage = () => {
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [, setAllProducts] = useState<ProductItem[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setAnchorEl(null);
    navigate('/');
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  /* Слайды Hero */
  const slides = [
    {
      title: 'iPhone 17 Pro',
      subtitle: 'Титановый дизайн.\nНовый уровень камеры',
      accent: '#6C63FF',
      bgDark: 'linear-gradient(135deg, #0d0d1a 0%, #1a1040 100%)',
      bgLight: 'linear-gradient(135deg, #f0f0ff 0%, #e8e0ff 100%)',
      image: '/heroslider/iphone.png',
      link: '/catalog/iphone',
    },
    {
      title: 'MacBook Air M4',
      subtitle: 'Тонкий. Лёгкий.\nДо 22 часов работы',
      accent: '#10B981',
      bgDark: 'linear-gradient(135deg, #0a1a12 0%, #0d2818 100%)',
      bgLight: 'linear-gradient(135deg, #f0fff8 0%, #e0f5ec 100%)',
      image: '/heroslider/macbook.png',
      link: '/catalog/macbook',
    },
    {
      title: 'Samsung S26 Ultra',
      subtitle: 'Камера нового\nпоколения',
      accent: '#3B82F6',
      bgDark: 'linear-gradient(135deg, #0a0f1a 0%, #0d1a2e 100%)',
      bgLight: 'linear-gradient(135deg, #f0f5ff 0%, #e0eaff 100%)',
      image: '/heroslider/samsung.png',
      link: '/catalog/samsung',
    },
    {
      title: 'Dyson',
      subtitle: 'Идеальная укладка\nбез повреждений',
      accent: '#E61EB4',
      bgDark: 'linear-gradient(135deg, #1a0a14 0%, #2a0d1e 100%)',
      bgLight: 'linear-gradient(135deg, #fff0fa 0%, #ffe0f5 100%)',
      image: '/heroslider/dyson.png',
      link: '/catalog/dyson',
    },
  ];

  /* Категории */
  const categories = [
    { name: 'iPhone', image: '/category/iphoneCategory.png', icon: <Apple />, path: '/catalog/iphone', keyword: 'iphone', color: '#6C63FF' },
    { name: 'iPad', image: '/category/ipadCategory.png', icon: <Apple />, path: '/catalog/ipad', keyword: 'ipad', color: '#8B5CF6' },
    { name: 'MacBook', image: '/category/macbookCategory.png', icon: <Laptop />, path: '/catalog/macbook', keyword: 'macbook', color: '#10B981' },
    { name: 'Watch', image: '/category/applewatchCategory.png', icon: <Watch />, path: '/catalog/appleWatch', keyword: 'watch', color: '#F59E0B' },
    { name: 'AirPods', image: '/category/airpodsCategory.png', icon: <Headphones />, path: '/catalog/airPods', keyword: 'airpods', color: '#EC4899' },
    { name: 'Samsung', image: '/category/samsungCategory.png', icon: <Apple />, path: '/catalog/samsung', keyword: 'samsung', color: '#3B82F6' },
    { name: 'Гейминг', image: '/category/gamingCategory.png', icon: <Games />, path: '/catalog/gaming', keyword: 'playstation|xbox|switch|ps', color: '#EF4444' },
    { name: 'Аудиотехника', image: '/category/audioCategory.png', icon: <Speaker />, path: '/catalog/audio', keyword: 'станция|homepod|marshall', color: '#8B5CF6' },
    { name: 'Dyson', image: '/category/dysonCategory.png', icon: <Speaker />, path: '/catalog/dyson', keyword: 'фен|выпрямитель|стайлер', color: '#E61EB4' },
  ];

  /* Преимущества */
  const advantages = [
    { icon: <LocalShipping />, title: 'Быстрая доставка', desc: 'Доставка по городу за 2 часа' },
    { icon: <Verified />, title: 'Официальная гарантия', desc: 'Гарантия 12 месяцев' },
    { icon: <CreditCard />, title: 'Рассрочка 0%', desc: 'Беспроцентная рассрочка' },
    { icon: <Support />, title: 'Экспертный сервис', desc: 'Помощь в настройке' },
  ];

  const footerLink = [
    { title: 'Доставка и оплата', path: '/delivery_payment' },
    { title: 'Гарантия', path: '/warranty' },
    { title: 'Сервисный центр', path: '/service-center' },
    { title: 'Trade-in', path: '/trade-in' },
    { title: 'Контакты', path: '/contacts' },
  ];

  const defaultProducts: Product[] = [
    { name: 'iPhone 17 Pro', desc: 'Титановый дизайн', price: 'от 109 990 ₽', image: 'https://istore.pw/wp-content/uploads/2025/09/kosmicheskiy-oranzheviy-1.png', isNew: true, discount: 5, link: '/catalog/iphone' },
    { name: 'MacBook Air', desc: 'Чип M4', price: 'от 104 990 ₽', image: 'https://istore.pw/wp-content/uploads/2025/05/collage-5.png', isNew: true, link: '/products/6' },
    { name: 'Apple Watch S11', desc: 'Всегда на связи', price: 'от 39 990 ₽', image: 'https://istore.pw/wp-content/uploads/2025/09/black-1_result.png', isNew: true, link: '/products/7' },
    { name: 'AirPods Pro 3', desc: 'Шумоподавление', price: 'от 24 990 ₽', image: 'https://istore.pw/wp-content/uploads/2025/09/apple-airpods-pro-3-1.png', isNew: true, link: '/products/8' },
    { name: 'iPad Pro', desc: 'Чип M4', price: 'от 89 990 ₽', image: 'https://istore.pw/wp-content/uploads/2024/07/Screenshot_1020-600x600.png', link: '/products/4' },
    { name: 'Samsung S25', desc: 'ИИ-камера', price: 'от 79 990 ₽', image: 'https://istore.pw/wp-content/uploads/2025/02/Screenshot_9-2.png', discount: 7, link: '/catalog' },
    { name: 'Dyson', desc: 'Для дома', price: 'от 19 990 ₽', image: 'https://istore.pw/wp-content/uploads/2024/03/Screenshot_975.png', link: '/catalog' },
    { name: 'Консоли', desc: 'Для геймеров', price: 'от 49 990 ₽', image: 'https://istore.pw/wp-content/uploads/2024/12/collage-600x600.png', link: '/catalog' },
  ];

  /*const getProductsForCategory = (kw: string) => {
    const patterns = kw.split('|');
    return allProducts.filter(p =>
      patterns.some(pt =>
        `${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(pt)
      )
    );
  };*/

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    (async () => {
      try {
        const r = await fetch('/api/products');
        if (!r.ok) return;
        const data = await r.json();
        const arr: ProductItem[] = Array.isArray(data) ? data : data?.items || [];
        setAllProducts(arr);

        const top8 = arr.slice(0, 8);
        const withImages = await Promise.all(
          top8.map(async p => ({
            productId: p.productId,
            name: p.name,
            desc: p.description || '',
            price: p.price ? `от ${p.price.toLocaleString()} ₽` : '',
            image: await getMainProductImg(p.productId),
            isNew: true,
            link: `/products/${p.productId}`,
          }))
        );

        setPopularProducts(withImages.length ? withImages : defaultProducts);
      } catch {
        setPopularProducts(defaultProducts);
      }
    })();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveSlide(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[activeSlide];
  const bg = isDark ? slide.bgDark : slide.bgLight;
  const textColor = isDark ? '#fff' : '#1a1a1a';
  const subtextColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const products = popularProducts.length ? popularProducts : defaultProducts;

  /*const CutProductName = (name: string, maxLen: number = 23): string => {
    if (!name) return '';
    if (name.length <= maxLen) return name;
    return name.substring(0, maxLen);
  };*/

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* HEADER */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: scrolled ? 'rgba(15,23,42,0.92)' : 'background.default',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.4s ease',
        }}
      >
        <Container maxWidth="xl" disableGutters>
          {/* Верхняя панель */}
          <Toolbar
            sx={{
              minHeight: { xs: '36px !important', md: '40px !important' },
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: { xs: 1, md: 2 },
              gap: { xs: 1, md: 0 },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2 }}>
              <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                +7 (949) 697 00 64
              </Typography>
              <Typography sx={{ mx: 1, color: 'text.secondary' }}>|</Typography>
              <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Донецк, ул. Артёма, 51А
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
              <Phone sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                +7 (949) 697 00 64
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={handleMenuClick}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 22, md: 24 },
                        height: { xs: 22, md: 24 },
                        mr: 1,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <AccountCircle sx={{ fontSize: { xs: 14, md: 16 }, color: '#fff' }} />
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        maxWidth: { xs: 60, sm: 120 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'text.primary',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {user.fullName || user.email}
                    </Typography>
                    <KeyboardArrowDown sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: 3,
                      },
                    }}
                  >
                    <MenuItem onClick={handleProfile} sx={{ gap: 1 }}>
                      <AccountCircle sx={{ fontSize: 20 }} /> Профиль
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ gap: 1, color: 'error.main' }}>
                      <Logout sx={{ fontSize: 20 }} /> Выйти
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/login')}
                    size="small"
                    variant="contained"
                    sx={{
                      borderRadius: '8px',
                      px: { xs: 1.5, md: 2 },
                      py: 0.5,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      minWidth: 'auto',
                      textTransform: 'none',
                    }}
                  >
                    Войти
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      px: { xs: 1.5, md: 2 },
                      py: 0.5,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      minWidth: 'auto',
                      ml: 1,
                      textTransform: 'none',
                    }}
                  >
                    Регистрация
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              component={RouteLink}
              to="/basket"
              sx={{
                color: 'text.primary',
                ml: { xs: 0.5, md: 1 },
                p: { xs: 0.5, md: 1 },
              }}
            >
              <Badge badgeContent={0} color="error">
                <ShoppingCartOutlined sx={{ fontSize: { xs: 20, md: 24 } }} />
              </Badge>
            </IconButton>

            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'text.primary',
                ml: 0.5,
                p: { xs: 0.5, md: 1 },
              }}
            >
              {mode === 'light' ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
            </IconButton>
          </Toolbar>

          {/* MegaMenu */}
          <Toolbar
            sx={{
              minHeight: { xs: '44px !important', md: '48px !important' },
              justifyContent: { xs: 'flex-start', md: 'center' },
              position: 'relative',
              gap: { xs: 0.5, md: 2 },
              px: { xs: 1, md: 0 },
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {categories.map(cat => (
              <Box
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                sx={{ position: 'relative', flexShrink: 0 }}
              >
                <Box
                  component={RouteLink}
                  to={cat.path}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: hoveredCategory === cat.name ? 'primary.main' : 'text.secondary',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    fontWeight: 500,
                    py: 1,
                    px: { xs: 0.75, md: 0.5 },
                    borderBottom: '2px solid',
                    borderColor: hoveredCategory === cat.name ? 'primary.main' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: 'primary.main' },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {React.cloneElement(cat.icon, {
                    sx: { fontSize: { xs: 14, md: 16 }, mr: 0.5 },
                  })}
                  {cat.name}
                </Box>
              </Box>
            ))}
          </Toolbar>
        </Container>
      </AppBar>

      {/* HERO */}
      <Box
        sx={{
          height: { xs: 420, sm: 500, md: 600 },
          overflow: 'hidden',
          mt: { xs: '80px', sm: '84px', md: '90px' },
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'absolute', inset: 0, background: bg }}
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: '20%', md: '35%' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: { xs: 250, md: 450 },
                  height: { xs: 250, md: 450 },
                  borderRadius: '50%',
                  bgcolor: slide.accent,
                  opacity: 0.08,
                  filter: 'blur(60px)',
                  pointerEvents: 'none',
                }}
              />

              <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  {/* Текст */}
                  <motion.div
                    key={`text-${activeSlide}`}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: textColor,
                          lineHeight: 1.1,
                          fontSize: { xs: '1.75rem', sm: '2.2rem', md: '3.5rem' },
                          mb: { xs: 1.5, md: 2 },
                          letterSpacing: '-0.02em',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {slide.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: subtextColor,
                          fontWeight: 400,
                          mb: { xs: 3, md: 4 },
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line',
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
                        }}
                      >
                        {slide.subtitle}
                      </Typography>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent={{ xs: 'center', md: 'flex-start' }}
                      >
                        <Button
                          component={RouteLink}
                          to={slide.link}
                          variant="contained"
                          size="large"
                          sx={{
                            px: { xs: 3, md: 4 },
                            py: { xs: 1.25, md: 1.5 },
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: slide.accent,
                            color: '#fff',
                            boxShadow: `0 8px 24px ${slide.accent}40`,
                            position: { xs: 'static', md: 'relative' },
                            left: { xs: 'auto', md: 100 },
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            '&:hover': {
                              bgcolor: slide.accent,
                              opacity: 0.9,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 12px 32px ${slide.accent}50`,
                            },
                            transition: 'all 0.25s ease',
                          }}
                        >
                          Выбрать свой
                        </Button>
                        <Button
                          component={RouteLink}
                          to="/catalog"
                          variant="outlined"
                          size="large"
                          sx={{
                            px: { xs: 3, md: 4 },
                            py: { xs: 1.25, md: 1.5 },
                            borderRadius: 3,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                            color: textColor,
                            position: { xs: 'static', md: 'relative' },
                            left: { xs: 'auto', md: 120 },
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            '&:hover': { borderColor: slide.accent, color: slide.accent },
                          }}
                        >
                          Каталог
                        </Button>
                      </Stack>
                    </Box>
                  </motion.div>

                  {/* Фото */}
                  <motion.div
                    key={`img-${activeSlide}`}
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: 300,
                          height: 300,
                          borderRadius: '50%',
                          bgcolor: slide.accent,
                          opacity: 0.12,
                          filter: 'blur(40px)',
                        }}
                      />
                      <Box
                        component="img"
                        src={slide.image}
                        alt={slide.title}
                        sx={{
                          maxHeight: 420,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          position: 'relative',
                          zIndex: 1,
                          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                        }}
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </Box>
                  </motion.div>
                </Box>
              </Container>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Индикаторы */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 16, md: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 5,
          }}
        >
          {slides.map((s, i) => (
            <Box
              key={i}
              onClick={() => setActiveSlide(i)}
              sx={{
                width: activeSlide === i ? 28 : 8,
                height: 8,
                borderRadius: 4,
                cursor: 'pointer',
                bgcolor:
                  activeSlide === i
                    ? s.accent
                    : isDark
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': { width: activeSlide === i ? 28 : 16 },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* КАТЕГОРИИ */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2.5, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
          >
            Категории
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {categories.map((cat, idx) => (
            <Grid key={cat.name} size={{ xs: 4, sm: 4, md: 3, lg: 'auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <Box
                  component={RouteLink}
                  to={cat.path}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1.5, sm: 2, md: 3 },
                    minWidth: { md: 110 },
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    textDecoration: 'none',
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-4px)' },
                      borderColor: cat.color,
                      boxShadow: isDark
                        ? `0 8px 24px ${cat.color}30`
                        : `0 8px 24px ${cat.color}20`,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={cat.image}
                    alt={cat.name}
                    sx={{
                      width: { xs: 36, sm: 40, md: 44 },
                      height: { xs: 36, sm: 40, md: 44 },
                      objectFit: 'contain',
                      mb: { xs: 1, md: 1.5 },
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    textAlign="center"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
                  >
                    {cat.name}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ТОВАРЫ */}
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{display: 'flex',justifyContent: 'space-between',alignItems: 'center',mb: 1,flexDirection: { xs: 'column', sm: 'row' },gap: { xs: 1, sm: 0 },}}>
          <Typography variant="h4"sx={{fontWeight: 700,color: 'text.primary',fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },}}>Хиты недели</Typography>

          <Button component={RouteLink} to="/catalog" endIcon={<KeyboardArrowRight />} sx={{color: 'primary.main',fontWeight: 600,fontSize: { xs: '0.8rem', md: '0.875rem' },}}>
            <Typography sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}>Смотреть все</Typography>
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.85rem', md: '1.125rem' } }}>Топовые товары с лучшими предложениями</Typography>
        
        <ProductCarousel products={products.slice(0, 10)} />
      </Container>

      {/* ПРЕИМУЩЕСТВА */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4, md: 6 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: { xs: 150, md: 200 },
              height: { xs: 150, md: 200 },
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.05,
            }}
          />
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: { xs: 3, md: 6 },
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
            }}
          >
            Почему выбирают нас
          </Typography>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {advantages.map((adv, idx) => (
              <Grid key={adv.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: { xs: 56, md: 72 },
                        height: { xs: 56, md: 72 },
                        mb: { xs: 2, md: 3 },
                        mx: 'auto',
                        transition: 'transform 0.4s ease',
                        '&:hover': { transform: 'scale(1.15) rotate(5deg)' },
                        boxShadow: '0 4px 20px rgba(108,99,255,0.2)',
                      }}
                    >
                      {React.cloneElement(adv.icon, {
                        sx: { fontSize: { xs: 28, md: 36 }, color: '#fff' },
                      })}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: 'text.primary',
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      {adv.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: { xs: '0.85rem', md: '1rem' },
                      }}
                    >
                      {adv.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ФУТЕР */}
      <Box
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          pt: { xs: 4, md: 8 },
          pb: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  ml: { xs: 0, md: 7 },
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                <Apple sx={{ mr: 1, fontSize: { xs: 24, md: 32 } }} /> iStore
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  mr: { xs: 0, md: 5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }}
              >
                Официальный реселлер техники Apple в Донецке.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Контакты
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: { xs: 0, md: 7 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }}
              >
                <Phone sx={{ fontSize: 16, color: 'text.secondary' }} /> +7 (949) 697 00 64
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  ml: { xs: 0, md: 4 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }}
              >
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} /> Донецк, ул. Артёма, 51А
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Информация
              </Typography>
              <Stack spacing={{ xs: 1, md: 1.5 }}>
                {footerLink.map(item => (
                  <Link
                    key={item.title}
                    component={RouteLink}
                    to={item.path}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'primary.main' },
                      fontSize: { xs: '0.8rem', md: '1rem' },
                    }}
                  >
                    {item.title}
                  </Link>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Часы работы
              </Typography>
              <Typography sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '1rem' } }}>
                Пн-Пт: 10:00 - 20:00
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.85rem', md: '1rem' },
                }}
              >
                Сб-Вс: 11:00 - 18:00
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: { xs: 2, md: 3 }, ml: { xs: 0, md: 12 } }}
              >
                <IconButton
                  component="a"
                  href="#"
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'primary.main', color: '#fff' },
                  }}
                >
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton
                  component="a"
                  href="#"
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'primary.main', color: '#fff' },
                  }}
                >
                  <Instagram fontSize="small" />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'divider', mb: { xs: 2, md: 4 } }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              © 2026 iStore. Все права защищены.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
            >
              <Link
                component={RouteLink}
                to="/privacy"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                }}
                underline="hover"
              >
                Политика конфиденциальности
              </Link>
              <Link
                component={RouteLink}
                to="/termsOfUse"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                }}
                underline="hover"
              >
                Условия использования
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage;