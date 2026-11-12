import { Link as RouteLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Stack,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Phone,
  LocationOn,
  AccessTime,
  Telegram,
  Instagram,
  Facebook,
  Apple,
  Store,
  Share,
  LocalShipping,
} from '@mui/icons-material';

const ContactsPage = () => {
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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Контакты
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Оформить заказ online на сайте вы можете круглосуточно.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid width={"4000px"}>
            <Card sx={{
              height: '100%', borderRadius: 3, bgcolor: 'background.paper',
              border: '1px solid', borderColor: 'divider',
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom sx={{ mb: 3 }}>
                  Хотите задать вопрос или сделать заказ?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
                  Свяжитесь с нами любым удобным способом:
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="medium" color="text.primary">Телефоны:</Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold"
                    sx={{ ml: 5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    +7 (949) 697 00 64
                  </Typography>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'divider' }} />

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Share sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="medium" color="text.primary">Мы в социальных сетях:</Typography>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ ml: 5 }}>
                    <Button variant="outlined" startIcon={<Facebook />} href="#" target="_blank"
                      sx={{ borderRadius: 2, textTransform: 'none' }}>ВКонтакте</Button>
                    <Button variant="outlined" startIcon={<Instagram />} href="#" target="_blank"
                      sx={{ borderRadius: 2, textTransform: 'none' }}>Instagram</Button>
                    <Button variant="outlined" startIcon={<Telegram />} href="#" target="_blank"
                      sx={{ borderRadius: 2, textTransform: 'none' }}>Telegram</Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid width={"4000px"}>
            <Card sx={{
              height: '100%', borderRadius: 3, bgcolor: 'background.paper',
              border: '1px solid', borderColor: 'divider',
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom sx={{ mb: 3 }}>
                  Адрес магазина
                </Typography>
                <Stack direction={"row"} spacing={4} sx={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                  <Box sx={{ display: 'flex', flex: '1 1 auto', minWidth: '250px' }}>
                    <LocationOn sx={{ mr: 2, color: 'error.main', fontSize: 28, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="medium" color="text.primary" gutterBottom>
                        Донецк, улица Артёмка, 51А
                      </Typography>
                      <Typography variant="h6" color="text.secondary">Green Plaza, 1 этаж</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flex: '1 1 auto', minWidth: '200px' }}>
                    <AccessTime sx={{ mr: 2, color: 'success.main', fontSize: 28, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="medium" color="text.primary" gutterBottom>
                        Время работы:
                      </Typography>
                      <Typography variant="h6" color="text.secondary">ежедневно с 10.00 до 18.00</Typography>
                    </Box>
                  </Box>
                </Stack>

                <Box sx={{ mt: 3, height: 250, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2710.876457654785!2d37.8028!3d48.0159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40e0903f1e4b8b2f%3A0x9e8a3f5e5e5e5e5e!2z0JTQvtC90LXRhtC6LCDQo9C60YDQsNC40L3QsA!5e0!3m2!1sru!2sru!4v1620000000000!5m2!1sru!2sru"
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade" title="Карта магазина" />
                </Box>

                <Button fullWidth variant="contained" size="large" startIcon={<LocationOn />}
                  href="https://maps.google.com/?q=Донецк+улица+Артёмка+51А" target="_blank"
                  sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem' }}>
                  Построить маршрут
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactsPage;