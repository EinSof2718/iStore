import { Link as RouteLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  Apple,
  Assignment,
  CheckCircle,
  AccessTime,
  Shield,
  Devices,
  PriceCheck,
  Warning,
  Info,
  Call,
  Star,
  PhoneIphone,
  Backup,
  Security,
  Restore,
  Store,
  LocalShipping
} from '@mui/icons-material';

const TradeInPage = () => {
  const eligibleModels = [
    "iPhone XR", "iPhone SE", "iPhone 11, 11 Pro и 11 Pro Max",
    "iPhone 12, 12 mini, 12 Pro и 12 Pro Max",
    "iPhone 13, 13 mini, 13 Pro и 13 Pro Max",
    "iPhone 14, 14 Plus, 14 Pro и 14 Pro Max"
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="fixed" color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component={RouteLink} to="/"
              sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Apple /> iStore
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={RouteLink} to="/" startIcon={<Store />}>Магазин</Button>
              <Button color="inherit" component={RouteLink} to="/delivery_payment" startIcon={<LocalShipping />}>Доставка</Button>
              <Button color="inherit" component={RouteLink} to="/contacts" startIcon={<Phone />}>Контакты</Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ mt: 8 }} />

      {/* Hero секция */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Apple sx={{ fontSize: 48, mr: 2 }} />
                <Typography variant="h3" component="h1" fontWeight={700} color="text.primary">Trade-In</Typography>
              </Box>
              <Typography variant="h4" fontWeight={600} color="primary.main" sx={{ mb: 2 }}>
                Как купить новый iPhone по программе Trade-In
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Обменяй свой старый iPhone на новый и получи скидку!
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Секция: Как это работает */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" fontWeight={600} color="text.primary"
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />
            Как купить новый iPhone по программе Trade-In
          </Typography>

          <Grid container spacing={4}>
            <Grid>
              <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PriceCheck sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600} color="text.primary">Ориентировочная стоимость</Typography>
                  </Box>
                  <List dense sx={{ mb: 2 }}>
                    {[
                      ["iPhone 14 Pro Max", "до 55 000 ₽"],
                      ["iPhone 14 Pro", "до 50 000 ₽"],
                      ["iPhone 13 Pro Max", "до 45 000 ₽"],
                      ["iPhone 13", "до 35 000 ₽"],
                      ["iPhone 12", "до 25 000 ₽"],
                      ["iPhone 11", "до 18 000 ₽"],
                    ].map(([name, price], i) => (
                      <ListItem key={i} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}><PhoneIphone sx={{ color: 'primary.main' }} /></ListItemIcon>
                        <ListItemText primary={name} secondary={price} primaryTypographyProps={{ fontWeight: 500 }} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2, borderColor: 'divider' }} />
                  <Typography variant="body2" color="text.secondary">* Точная стоимость определяется после диагностики в магазине</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Секция: Модели iPhone для Trade-In */}
        <Box sx={{ mb: 8 }}>
          <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Devices sx={{ color: 'primary.main' }} /> Все модели iPhone, участвующие в Trade-In
            </Typography>
            <Grid container spacing={2}>
              {eligibleModels.map((model, index) => (
                <Grid key={index}>
                  <Card variant="outlined" sx={{
                    borderRadius: 2, bgcolor: 'background.paper', borderColor: 'divider',
                    transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                  }}>
                    <CardContent sx={{ py: 2.5, px: 2, display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ color: 'primary.main', mr: 1.5, fontSize: 22 }} />
                      <Typography variant="body1" fontWeight={500} color="text.primary">{model}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* Секция: Важная информация */}
        <Box sx={{ mb: 8 }}>
          <Alert severity="info" icon={<Warning />} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>Важно</Typography>
            <Typography variant="body1" paragraph fontWeight={500}>
              Обрати внимание, что сдаваемые устройства должны быть без существенных внешних повреждений корпуса и экрана, 
              с работающими функциональными кнопками, без признаков повреждений от контакта с водой.
            </Typography>
          </Alert>

          <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                <Info sx={{ fontSize: 48, color: 'secondary.main' }} />
              </Grid>
              <Grid>
                <Typography variant="h6" fontWeight={600} color="secondary.main" sx={{ mb: 2 }}>
                  Перед сдачей устройства:
                </Typography>
                <Grid container spacing={3}>
                  {[
                    { icon: <Backup />, title: 'Сделай резервную копию данных', desc: 'Мы рекомендуем сделать резервную копию данных своего телефона, если ты и дальше планируешь пользоваться ими на новом iPhone.' },
                    { icon: <Security />, title: 'Отключи Find My iPhone', desc: 'Отключи функцию Find My iPhone («Найти iPhone»). Это позволит удалить все персональные данные с твоего iPhone и восстановить на нем заводские настройки.' },
                  ].map((item, i) => (
                    <Grid key={i}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ color: 'secondary.main', mr: 1.5, mt: 0.5, fontSize: 20 }}>{item.icon}</Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Преимущества */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: 'primary.main' }} /> Преимущества программы Trade-In
          </Typography>
          <Grid container spacing={3}>
            {[
              { icon: <PriceCheck />, title: 'Выгодно', desc: 'Получи скидку на новый iPhone при сдаче старого устройства' },
              { icon: <AccessTime />, title: 'Быстро', desc: 'Диагностика всего 5-10 минут прямо в магазине' },
              { icon: <Shield />, title: 'Надежно', desc: 'Официальная программа Trade-In от iStore' },
              { icon: <Restore />, title: 'Экологично', desc: 'Твое устройство получит вторую жизнь' },
            ].map((item, i) => (
              <Grid key={i}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Контакты */}
        <Box sx={{ mb: 6 }}>
          <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid>
                <Typography variant="h4" fontWeight={700}>Остались вопросы?</Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>Наши специалисты с радостью помогут тебе с программой Trade-In</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" size="large" startIcon={<Call />}
                    href="tel:+79496970064"
                    sx={{ bgcolor: 'white', color: 'primary.main', py: 1.5, px: 4, '&:hover': { bgcolor: '#f0f0f0' } }}>
                    Позвонить
                  </Button>
                  <Button variant="outlined" size="large" startIcon={<LocationOn />}
                    sx={{ color: 'white', borderColor: 'white', py: 1.5, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    Найти магазин
                  </Button>
                </Box>
              </Grid>
              <Grid>
                <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="white" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1 }} /> Контактный телефон
                  </Typography>
                  <Typography variant="h5" component="a" href="tel:+79496970064"
                    sx={{ color: 'white', textDecoration: 'none', fontWeight: 700, '&:hover': { opacity: 0.8 }, display: 'block', mb: 2 }}>
                    +7 (949) 697 00 64
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography variant="body2">Ежедневно с 10:00 до 21:00</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Apple sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.primary">iStore Trade-In</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Официальная программа обмена iPhone.</Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Навигация</Typography>
              <Stack spacing={1}>
                {['Главная', 'Сервисный центр', 'Контакты'].map((name, i) => (
                  <Typography key={i} variant="body2" component={RouteLink} to={i === 0 ? '/' : i === 1 ? '/service-center' : '/contacts'}
                    sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>{name}</Typography>
                ))}
              </Stack>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Социальные сети</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="primary"><Facebook /></IconButton>
                <IconButton color="primary"><Instagram /></IconButton>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'divider' }} />
          <Typography variant="body2" align="center" color="text.secondary">
            © {new Date().getFullYear()} iStore Trade-In. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default TradeInPage;