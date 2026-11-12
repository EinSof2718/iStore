import { Link as RouteLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Paper,
  Grid,
  Alert,
  IconButton
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  Apple,
  Security,
  Build,
  Settings,
  AccessTime,
  DeviceUnknown,
  BatteryChargingFull,
  Wifi,
  VolumeUp,
  CameraAlt,
  Memory,
  LockOpen
} from '@mui/icons-material';

const ServiceCenterPage = () => {
  //const [expanded, setExpanded] = useState(false);

  const problems = [
    { icon: <Security />, text: "Обеспечение/восстановление проведения" },
    { icon: <DeviceUnknown />, text: "Восстановление после попадания влаги" },
    { icon: <Build />, text: "Замена корпуса" },
    { icon: <Settings />, text: "Замена карты" },
    { icon: <BatteryChargingFull />, text: "Замена аккумулятора" },
    { icon: <Wifi />, text: "Замена Wi-Fi модуля" },
    { icon: <VolumeUp />, text: "Ремонт и замена динамиков, микрофона" },
    { icon: <CameraAlt />, text: "Ремонт и замена фронтальной и основной камеры" },
    { icon: <Memory />, text: "Восстановление модели, процессора, цепи питания" },
    { icon: <LockOpen />, text: "Разблокировка и отказ от Apple ID" }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero секция */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Apple sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                <Typography variant="h3" component="h1" fontWeight={700} color="text.primary">Сервисный центр</Typography>
              </Box>
              <Typography variant="h5" color="text.secondary">От настройки Apple ID до замены дисплея. Мы всегда готовы помочь.</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Секция: Решаемые проблемы */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" fontWeight={600} color="text.primary"
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Build sx={{ fontSize: 32, color: 'primary.main' }} />Какие проблемы мы решаем
          </Typography>
          <Grid container spacing={3}>
            {problems.map((problem, index) => (
              <Grid key={index}>
                <Card sx={{
                  height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                  transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: 'primary.main', mr: 1.5 }}>{problem.icon}</Box>
                      <Typography variant="body1" fontWeight={500} color="text.primary">{problem.text}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Alert severity="info" sx={{ mt: 4 }}>
            Если вы не знаете, какие изменения в вашем устройстве, либо не нашли их в этом списке, 
            обратитесь к нам — вас проконсультирует специалист.
          </Alert>
        </Box>

        {/* Секция: Контакты */}
        <Box sx={{ mb: 6 }}>
          <Paper sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Grid container spacing={4}>
              <Grid>
                <Typography variant="h4" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>Контакты сервисного центра</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600} color="text.primary">Донецк, улица Артёмова, 51А, Green Plaza</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Phone sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" component="a" href="tel:+74956070064"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { color: 'secondary.main' } }}>
                    +7 (495) 607 00 64
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <IconButton color="primary"><Facebook /></IconButton>
                  <IconButton color="primary"><Instagram /></IconButton>
                </Stack>
              </Grid>
              <Grid>
                <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h6" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1 }} /> Часы работы
                  </Typography>
                  <Typography variant="body1" color="text.primary">Пн-Пт: 10:00 - 20:00</Typography>
                  <Typography variant="body1" color="text.primary">Сб-Вс: 11:00 - 18:00</Typography>
                  <Divider sx={{ my: 2, borderColor: 'divider' }} />
                  <Typography variant="body2" color="text.secondary">Срочный ремонт принимается до 19:00</Typography>
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
                <Apple sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary">Сервисный центр</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Профессиональный ремонт Apple устройств с гарантией.</Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Навигация</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={RouteLink} to="/"
                  sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Главная</Typography>
                <Typography variant="body2" component={RouteLink} to="/contacts"
                  sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Контакты</Typography>
              </Stack>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Контакты</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ fontSize: 16, mr: 1 }} /> +7 (495) 607 00 64
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 16, mr: 1 }} /> Донецк, улица Артёмова, 51А, Green Plaza
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'divider' }} />
          <Typography variant="body2" align="center" color="text.secondary">
            © {new Date().getFullYear()} Сервисный центр. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ServiceCenterPage;