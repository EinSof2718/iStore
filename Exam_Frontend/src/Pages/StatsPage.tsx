import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Grid, Avatar, Button,
  CircularProgress, Alert, useTheme,
} from '@mui/material';
import {
  ArrowBack, TrendingUp, ShoppingCart, People, Inventory,
  EmojiEvents, LocalShipping,
} from '@mui/icons-material';

import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const formatPrice = (v:number)=> new Intl.NumberFormat('ru-RU', {style: 'currency', currency:'RUB', minimumFractionDigits:0}).format(v);

const MONTHS = ['Янв','Фев','Март','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const COLORS = ['#6C63FF','#10B981','#F59E0B','#EF4444','#EC4899','#3B82F6','#8B5CF6','#E61EB4'];


const CustomTooltip = ({active, payload, label}: any)=>{
    //const theme = useTheme();
    if(!active || !payload?.length) return null;
    return(
        <Paper sx={{p:1.5, bgcolor: 'background.paper', border:'1px solid', borderColor:'divider', borderRadius: 2}}>
            <Typography variant="caption" color = "text.secondary" display="block">{label}</Typography>
            {payload.map((p:any, i:number)=>(
                <Typography key={i} variant="body2" fontWeight={600} sx={{color: p.color}}>{p.name} : {p.name?.includes("₽") || p.name === "Выручка" ? formatPrice(p.value) : p.value}</Typography>
            ))}
        </Paper>
    );
};


const MetricCard = ({title, value, icon, color, sub}: any) =>(
    <Paper sx={{p:3, borderRadius: 3, border: '1px solid', borderColor:'divider', height:'100%'}}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography> 
                <Typography variant="h4" fontWeight={800} color="text.primary">{value}</Typography> 
                {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
            </Box>
            <Avatar sx={{bgcolor: `${color}18`, color, width:48, height: 48}}>{icon}</Avatar>
        </Box>
    </Paper>
);


  const translateMethodDelivery=(m:string)=>{
    if(m==="courier") return "Курьер";
    if(m==="pickup") return "Самовывоз";
    if(m==="mail") return "Почта";
  }
  const translateStatusPayment=(m:string)=>{
    if(m==="pending") return "Ожидает";
    if(m==="processing") return "В обработке";
    if(m==="shipped") return "Отправлен";
    if(m==="completed") return "Выполнен";
    if(m==="cancelled") return "Отменен";
  }


const StatsPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try
            {
                const res = await fetch('/api/Stats/dashboard', {credentials:'include'});
                if(!res.ok) throw new Error(`HTTP ${res.status}`);
                setData(await res.json());
            }
            catch(e:any)
            {
                setError('Не удалось загрузить статистику: ' + e.message);

            }
            finally
            {
                setLoading(false);
            }
        };
        load();
    },[])

    if(loading) 
        return(<Box sx={{display: 'flex', justifyContent:'content', alignItems:'center', minHeight:'60vh'}}><CircularProgress/></Box>);

    if(error)
        return(<Container sx={{py:4}}><Alert severity="error">{error}</Alert></Container>)
    

    const monthlyData = (data?.monthlyStats ?? []).map((m:any)=>({
        name:MONTHS[m.month-1],
        Заказы: m.orders,
        Выручка: Math.round(Number(m.revenue)),
    }));

    const topProducts = (data?.topProducts ?? []).slice(0, 7).map((p:any)=>({
        name: p.name,
        Продано: p.totalSold,
        fill:COLORS[0],
    }));

    const statusData = (data?.statusStats ?? []).map((s:any, i:number)=>({
        name: translateStatusPayment(s.status),
        value: s.count,
        fill:COLORS[i % COLORS.length],
    }));

    const categoryData = (data?.categoryStats ?? []).slice(0, 5).map((c:any, i:number)=>({
        name: c.category,
        value: c.totalSold,
        fill:COLORS[i % COLORS.length],
    }));

    const deliveryData = (data?.deliveryStats ?? []).map((d:any, i:number)=>({
        name: translateMethodDelivery(d.method) || "Не указан",
        value: d.count,
        fill:COLORS[i % COLORS.length],
    }));
    
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0,0.06)';
    const axisColor = isDark ? '#666' : '#999';


    

    return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 3, color: 'text.secondary' }}>
          Назад
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary">Аналитика магазина</Typography>
          <Typography color="text.secondary">Статистика продаж и активности покупателей</Typography>
        </Box>

        {/* ── Метрики ─────────────────────────────────────────────────────── */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { title: 'Всего заказов', value: data?.summary?.totalOrders ?? 0,   icon: <ShoppingCart />, color: '#6C63FF' },
            { title: 'Выручка', value: formatPrice(data?.summary?.totalRevenue ?? 0), icon: <TrendingUp />, color: '#10B981' },
            { title: 'Средний чек', value: formatPrice(data?.summary?.avgOrderValue ?? 0), icon: <TrendingUp />, color: '#F59E0B' },
            { title: 'Товаров в каталоге', value: data?.summary?.totalProducts ?? 0, icon: <Inventory />, color: '#EF4444' },
            { title: 'Пользователей', value: data?.summary?.totalUsers ?? 0,    icon: <People />,     color: '#EC4899' },
          ].map(m => (
            <Grid key={m.title} size={{ xs: 12, sm: 6, md: 4}} sx={{ flex: 1}}>
              <MetricCard {...m} />
            </Grid>
          ))}
        </Grid>

        {/* ── График продаж по месяцам ──────────────────────────────────── */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Динамика продаж</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Заказы и выручка за последние 12 месяцев</Typography>
          {monthlyData.length === 0 ? (
            <Typography color="text.disabled" textAlign="center" py={4}>Нет данных за последние 12 месяцев</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <defs>
                  <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => formatPrice(v).replace('₽','').trim()} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left"  type="monotone" dataKey="Заказы"  stroke="#6C63FF" strokeWidth={2.5} fill="url(#gradOrders)"  dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
                <Area yAxisId="right" type="monotone" dataKey="Выручка" stroke="#10B981" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Топ товаров */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmojiEvents sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight={700}>Топ товаров по продажам</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Количество проданных единиц</Typography>
              {topProducts.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={4}>Нет данных о продажах</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts}  layout="vertical"  margin={{ left: 10, right: 30}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Продано" radius={[0, 6, 6, 0]} background={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', radius: 6 }}>
                      {topProducts.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Статусы заказов */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Статусы заказов</Typography>
              {statusData.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={4}>Нет данных</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={4} dataKey="value">
                        {statusData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value} заказов`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 1 }}>
                    {statusData.map((s: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.fill }} />
                          <Typography variant="caption" color="text.secondary">{s.name}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={600}>{s.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Продажи по категориям */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Продажи по категориям</Typography>
              {categoryData.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={4}>Нет данных</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={110} data={categoryData} startAngle={180} endAngle={-180}>
                    <RadialBar dataKey="value" cornerRadius={6} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}>
                      {categoryData.map((entry: any, i: number) => (<Cell key={i} fill={entry.fill} />))}
                    </RadialBar>
                    <Tooltip formatter={(v: any) => [`${v} шт.`]} />
                    <Legend iconSize={10} formatter={(value) => <span style={{ fontSize: 11, color: axisColor }}>{value}</span>} />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Способы доставки */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocalShipping sx={{ color: '#3B82F6' }} />
                <Typography variant="h6" fontWeight={700}>Доставка</Typography>
              </Box>
              {deliveryData.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={4}>Нет данных</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deliveryData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                      {deliveryData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} заказов`]} />
                    <Legend iconSize={10} formatter={(value) => <span style={{ fontSize: 11, color: axisColor }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Топ покупателей */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <EmojiEvents sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight={700}>Топ покупателей</Typography>
              </Box>
              {(data?.topBuyers ?? []).length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={4}>Нет данных</Typography>
              ) : (
                <Box>
                  {(data?.topBuyers ?? []).slice(0, 6).map((buyer: any, i: number) => (
                    <Box key={buyer.userId} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length], fontSize: 14, fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {buyer.customerName || buyer.customerEmail || 'Пользователь'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {buyer.orderCount} заказов · {formatPrice(buyer.totalSpent)}
                        </Typography>
                      </Box>
                      
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsPage;
