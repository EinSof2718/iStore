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
  Avatar,
  IconButton,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  LocalShipping,
  Verified,
  CreditCard,
  Support,
  Apple,
  ExpandMore,
  Store,
  Schedule,
  Payment,
  DirectionsCar,
  ShoppingCart,
  CheckCircle,
  PhoneInTalk,
  Email,
  AccessTime,
  VerifiedUser
} from '@mui/icons-material';

const DeliveryPaymentPage = () => {
  //const navigate = useNavigate();

  const steps = [
    { label: 'Выбор товара', description: 'Выберите необходимый товар и кликните "Добавить в корзину"' },
    { label: 'Оформление заказа', description: 'Заполните форму заказа и оставьте свои контактные данные' },
    { label: 'Подтверждение', description: 'В течение 30 минут с вами свяжется менеджер для подтверждения заказа' },
    { label: 'Получение', description: 'Получите заказанный товар удобным для вас способом' },
  ];

  const deliveryOptions = [
    {
      title: 'Самовывоз', description: 'Бесплатный самовывоз из нашего магазина',
      price: 'Бесплатно', time: '1-2 часа', icon: <Store />,
      details: 'iStore по адресу: Донецк, ул. Артема 51А ТЦ Green Plaza, 1 этаж, с 10.00 до 19.00'
    },
    {
      title: 'Курьерская доставка', description: 'Доставка курьером по городу',
      price: '300 ₽', time: 'В течение дня', icon: <DirectionsCar />,
      details: 'Доставка осуществляется с 10:00 до 20:00. Курьер предварительно свяжется с вами за 1 час до доставки.'
    },
    {
      title: 'Почта России', description: 'Доставка в отделение почты',
      price: 'от 250 ₽', time: '3-7 дней', icon: <LocalShipping />,
      details: 'Срок доставки зависит от региона. Вы получите SMS-уведомление о прибытии заказа в отделение.'
    },
    {
      title: 'Транспортная компания', description: 'Доставка в другие города',
      price: 'от 500 ₽', time: '5-14 дней', icon: <LocalShipping />,
      details: 'Доставка через СДЭК, Boxberry или другие ТК по вашему выбору. Стоимость рассчитывается индивидуально.'
    },
  ];

  const paymentMethods = [
    { name: 'Наличные', icon: '💵', description: 'При получении товара' },
    { name: 'Банковская карта', icon: <CreditCard />, description: 'Онлайн или при получении' },
    { name: 'Apple Pay', icon: <Apple />, description: 'Быстрая оплата через iPhone' },
    { name: 'Банковский перевод', icon: '🏦', description: 'По реквизитам компании' },
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
              <Button color="inherit" component={RouteLink} to="/warranty" startIcon={<VerifiedUser />}>Гарантия</Button>
              <Button color="inherit" component={RouteLink} to="/contacts" startIcon={<Phone />}>Контакты</Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ mt: 8 }} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600} color="text.primary">
          Доставка и оплата
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Вы можете сделать заказ онлайн и забрать его в магазине iStore. На этой странице вы найдете все, 
          что вам нужно знать о доставке и управлении вашим заказом.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* Как сделать заказ */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" display="flex" alignItems="center" gap={1}>
            <ShoppingCart /> Как сделать заказ в iStore
          </Typography>
          <Stepper orientation="vertical" sx={{ mt: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.label} active={true}>
                <StepLabel StepIconComponent={() => (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>{index + 1}</Avatar>
                )}>
                  <Typography variant="h6" color="text.primary">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="text.secondary">{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* Способы доставки */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" display="flex" alignItems="center" gap={1}>
            <LocalShipping /> Способы доставки
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {deliveryOptions.map((option, index) => (
              <Grid key={index}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{option.icon}</Avatar>
                      <Box>
                        <Typography variant="h6" color="text.primary">{option.title}</Typography>
                        <Chip label={option.price} color="primary" size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" paragraph>{option.description}</Typography>
                    <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Срок доставки</Typography>
                        <Typography variant="body2" color="text.primary" display="flex" alignItems="center" gap={0.5}>
                          <AccessTime fontSize="small" /> {option.time}
                        </Typography>
                      </Box>
                    </Stack>
                    <Accordion elevation={0} sx={{ mt: 2, bgcolor: 'transparent', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" color="text.primary">Подробнее</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">{option.details}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* Способы оплаты */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" display="flex" alignItems="center" gap={1}>
            <Payment /> Способы оплаты
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {paymentMethods.map((method, index) => (
              <Grid key={index}>
                <Paper sx={{
                  p: 3, height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-4px)' }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mb: 2, width: 56, height: 56 }}>{method.icon}</Avatar>
                  <Typography variant="h6" color="text.primary" gutterBottom>{method.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{method.description}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* Самовывоз */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary" display="flex" alignItems="center" gap={1}>
            <Store /> Самовывоз из магазина
          </Typography>
          <Card sx={{ mt: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid>
                  <Typography variant="h6" color="text.primary" gutterBottom display="flex" alignItems="center" gap={1}>
                    <LocationOn color="primary" /> Адрес магазина
                  </Typography>
                  <Typography variant="body1" color="text.primary" paragraph>
                    Донецк, ул. Артема 51А<br />ТЦ Green Plaza, 1 этаж
                  </Typography>
                  <Typography variant="h6" color="text.primary" gutterBottom display="flex" alignItems="center" gap={1} sx={{ mt: 3 }}>
                    <Schedule color="primary" /> Часы работы
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    Пн-Пт: 10:00 - 19:00<br />Сб-Вс: 10:00 - 18:00
                  </Typography>
                </Grid>
                <Grid>
                  <Typography variant="h6" color="text.primary" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Verified color="primary" /> Преимущества самовывоза
                  </Typography>
                  <List>
                    {['Бесплатно', 'Получите заказ в течение 1-2 часов', 'Проверка товара перед оплатой', 'Консультация специалиста'].map((text, i) => (
                      <ListItem disablePadding key={i} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary={text} primaryTypographyProps={{ color: 'text.primary' }} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Контакты */}
        <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            <Support sx={{ mr: 1, verticalAlign: 'middle' }} /> Нужна помощь?
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
            Наши специалисты готовы ответить на все ваши вопросы
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<PhoneInTalk />}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
              href="tel:+78001234567">+7 (800) 123-45-67</Button>
            <Button variant="outlined" startIcon={<Email />}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              href="mailto:info@istore.ru">info@istore.ru</Button>
          </Stack>
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
              <Typography variant="body2" color="text.secondary">Официальный партнер Apple в Донецке</Typography>
            </Grid>
            <Grid>
              <Typography variant="h6" gutterBottom color="text.primary">Контакты</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" /> Донецк, ул. Артема 51А, ТЦ Green Plaza
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

export default DeliveryPaymentPage;