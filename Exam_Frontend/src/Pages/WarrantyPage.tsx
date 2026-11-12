import { Link as RouteLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
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
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  Verified,
  Support,
  Apple,
  Security,
  Build,
  Assignment,
  Settings,
  Description,
  AccessTime,
  HistoryToggleOff,
  GppGood,
  DeviceUnknown,
  LocalShipping,
  Store
} from '@mui/icons-material';

const WarrantyPage = () => {
  //const [expanded, setExpanded] = useState('panel1');

  const warrantyTypes = [
    {
      type: 'Новые устройства Apple',
      period: '1 год',
      provider: 'Официальная гарантия Apple',
      coverage: 'Гарантия с момента активации устройства',
      icon: <Apple />,
      color: 'primary.main'
    },
    {
      type: 'Б/У устройства Apple',
      period: '3 месяца',
      provider: 'Гарантия магазина iStore',
      coverage: 'Гарантия на основные компоненты',
      icon: <HistoryToggleOff />,
      color: 'success.main'
    },
    {
      type: 'Аксессуары и комплектующие',
      period: '6 месяцев',
      provider: 'Гарантия iStore / Производителя',
      coverage: 'Гарантия на производственные дефекты',
      icon: <DeviceUnknown />,
      color: 'warning.main'
    }
  ];

  const warrantyProcess = [
    {
      step: 1,
      title: 'Обращение в сервис',
      description: 'При обнаружении неисправности обратитесь в наш сервисный центр',
      icon: <Settings />
    },
    {
      step: 2,
      title: 'Проверка гарантии',
      description: 'Предоставьте гарантийный талон и документы о покупке',
      icon: <Assignment />
    },
    {
      step: 3,
      title: 'Диагностика',
      description: 'Наши специалисты проведут бесплатную диагностику устройства',
      icon: <Build />
    },
    {
      step: 4,
      title: 'Ремонт или замена',
      description: 'Выполним гарантийный ремонт или замену устройства',
      icon: <Verified />
    }
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600} color="text.primary">
            <Security sx={{ mr: 2, verticalAlign: 'middle', color: 'primary.main' }} />
            Гарантия
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Мы стремимся к тому, чтобы вы радовались новой покупке. Однако, если что-то пошло не так, мы здесь, чтобы помочь.
          </Typography>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
            Гарантия на товары
          </Typography>
          
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body1" color="text.primary" paragraph>
                На каждое устройство мы предоставляем гарантию. Гарантия может быть представлена производителем либо магазином iStore.
              </Typography>
              <Alert severity="info" icon={<Description />} sx={{ mt: 2 }}>
                Подтверждением гарантийных обязательств служит гарантийный талон.
              </Alert>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
            Сроки гарантии
          </Typography>
          
          <Grid container spacing={3}>
            {warrantyTypes.map((item, index) => (
              <Grid key={index}>
                <Paper sx={{
                  p: 3, height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: '1px solid', borderColor: 'divider',
                  borderTop: `4px solid`,
                  borderTopColor: item.color,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                }}>
                  <Box sx={{
                    bgcolor: item.color, color: 'white', width: 60, height: 60,
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mb: 2
                  }}>
                    {item.icon}
                  </Box>
                  
                  <Typography variant="h5" gutterBottom fontWeight={600} color="text.primary">
                    {item.type}
                  </Typography>
                  
                  <Chip label={`${item.period} гарантии`}
                    sx={{ mb: 2, bgcolor: item.color, color: 'white', fontWeight: 600 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Провайдер:</strong> {item.provider}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.coverage}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Alert severity="info" icon={<GppGood />} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Важная информация о гарантии Apple
            </Typography>
            <Typography variant="body1">
              <strong>Новые устройства Apple имеют 1 год официальной гарантии с момента активации.</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Б/У устройства Apple имеют <strong>3 месяца гарантии</strong>, предоставляемой магазином iStore.
            </Typography>
          </Alert>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
            Как работает гарантийное обслуживание
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {warrantyProcess.map((step, index) => (
              <Grid key={index}>
                <Card sx={{
                  height: '100%', textAlign: 'center',
                  bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider'
                }}>
                  <CardContent>
                    <Box sx={{
                      bgcolor: 'primary.main', color: 'white', width: 50, height: 50,
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', mx: 'auto', mb: 2,
                      fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                      {step.step}
                    </Box>
                    
                    <Box sx={{ color: 'primary.main', mb: 1 }}>{step.icon}</Box>
                    
                    <Typography variant="h6" color="text.primary" gutterBottom>
                      {step.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" gutterBottom fontWeight={600} display="flex" alignItems="center" gap={1}>
            <Support /> Нужна помощь с гарантией?
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
            Обратитесь в наш сервисный центр для диагностики и гарантийного обслуживания
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <LocationOn /> Адрес сервисного центра
              </Typography>
              <Typography variant="body1">
                Донецк, ул. Артема 51А<br />ТЦ Green Plaza, 2 этаж
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" /> Пн-Пт: 10:00 - 19:00, Сб-Вс: 10:00 - 18:00
              </Typography>
            </Grid>
            
            <Grid>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Phone /> Контакты
              </Typography>
              <Stack spacing={2}>
                <Button variant="contained" startIcon={<Phone />}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
                  href="tel:+78001234567">+7 (800) 123-45-67</Button>
                <Button variant="outlined" startIcon={<Description />}
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Записаться на диагностику
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: 4, mt: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid>
              <Typography variant="h6" gutterBottom color="text.primary" display="flex" alignItems="center" gap={1}>
                <Apple /> iStore
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Официальный партнер Apple в Донецке
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="h6" gutterBottom color="text.primary">Сервисный центр</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" /> Донецк, ул. Артема 51А, ТЦ Green Plaza, 2 этаж
                </Typography>
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" /> +7 (800) 123-45-67
                </Typography>
              </Stack>
            </Grid>
            <Grid>
              <Typography variant="h6" gutterBottom color="text.primary">Мы в соцсетях</Typography>
              <Stack direction="row" spacing={2}>
                <IconButton color="primary"><Facebook /></IconButton>
                <IconButton color="primary"><Instagram /></IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            © 2026 iStore. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WarrantyPage;