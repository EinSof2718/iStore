import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
} from '@mui/material';

const TermsOfUsePage = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" fontWeight={700} color="text.primary" gutterBottom>Условия использования</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Последнее обновление: 1 января 2026 г.</Typography>

        <Paper sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                1. Общие положения
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Настоящие Условия использования (далее — «Условия») регулируют отношения между интернет-магазином iStore 
                (далее — «Продавец») и покупателями (далее — «Покупатель») при использовании сайта и совершении покупок.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Используя сайт iStore, вы соглашаетесь с настоящими Условиями. Если вы не согласны с каким-либо пунктом, 
                пожалуйста, не используйте сайт.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                2. Регистрация и аккаунт
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Для совершения покупок на сайте необходимо создать учетную запись. Вы несете ответственность за сохранность 
                вашего пароля и за все действия, совершенные под вашей учетной записью.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Вы обязуетесь предоставлять достоверную информацию при регистрации и поддерживать ее в актуальном состоянии.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                3. Оформление заказа
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                При оформлении заказа вы получаете подтверждение на указанный email или телефон. Продавец оставляет за собой 
                право отказать в заказе при отсутствии товара на складе или по иным причинам, уведомив Покупателя.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Все цены указаны в рублях и включают НДС. Продавец оставляет за собой право изменять цены без предварительного уведомления.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                4. Оплата
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Оплата производится в рублях следующими способами: наличными при получении, банковской картой, 
                электронными деньгами, банковским переводом.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Моментом оплаты считается поступление денежных средств на расчетный счет Продавца или выдача чека при наличной оплате.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                5. Доставка
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Доставка осуществляется в соответствии с условиями, указанными на странице «Доставка и оплата». 
                Сроки доставки зависят от выбранного способа и региона.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Риск случайной гибели или повреждения товара переходит к Покупателю с момента передачи товара.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                6. Возврат товара
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Возврат товара надлежащего качества возможен в течение 14 дней с момента получения. Товар должен 
                сохранить товарный вид, потребительские свойства, пломбы и упаковку.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Возврат денежных средств осуществляется в течение 10 рабочих дней с момента получения возвращенного товара.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                7. Гарантийные обязательства
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                На все товары распространяется гарантия, условия которой указаны на странице «Гарантия». 
                Гарантийный срок исчисляется с момента передачи товара Покупателю.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                8. Интеллектуальная собственность
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Все материалы сайта (тексты, изображения, логотипы, торговые марки) являются интеллектуальной собственностью 
                iStore и охраняются законом. Копирование материалов без разрешения запрещено.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                9. Конфиденциальность
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Обработка персональных данных Покупателей осуществляется в соответствии с Политикой конфиденциальности, 
                размещенной на сайте.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                10. Изменение условий
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Продавец оставляет за собой право вносить изменения в настоящие Условия в любое время. Новая редакция 
                вступает в силу с момента публикации на сайте. Рекомендуем периодически проверять данную страницу.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          По всем вопросам обращайтесь в службу поддержки iStore.
        </Typography>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 iStore. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default TermsOfUsePage;