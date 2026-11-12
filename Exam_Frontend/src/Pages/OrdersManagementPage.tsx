import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, InputAdornment, Tooltip, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  ArrowBack, Search, Refresh, Close, Visibility, Delete, Edit,
} from '@mui/icons-material';


interface Order
{
    orderId: number
    userId:string 
    numberOrder: number 
    statusOrder:string  
    totalAmount: number  
    orderDate:string 
    customerName:string;
    customerEmail:string
    customerPhone:string
    deliveryAddress:string
    deliveryMethod:string
    deliveryCost:number 
    paymentMethod:string
    paymentStatus:string
    comments?:string
    itemsCount?:number;
}

const status = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
const statusColor = (s:string) => {
    if(s==="completed") return "success";
    if(s==="processing") return "warning";
    if(s==="shipped") return "info";
    if(s==="cancelled") return "error";
    return "default";
}
const statusLabel: Record<string, string> ={
    pending:"Ожидает",
    processing:"В обработке",
    shipped:"Отправлен",
    completed:"Выполнен",
    cancelled:"Отменен",
};

//const methodPayment =['card', 'cash', 'installment'];
const translateMethodPayment=(m:string)=>{
  if(m==="card") return "Карта";
  if(m==="cash") return "Наличные";
  if(m==="installment") return "Рассрочка";
}


//const methodDelivery =['courier', 'pickup', 'mail'];
const translateMethodDelivery=(m:string)=>{
  if(m==="courier") return "Курьер";
  if(m==="pickup") return "Самовывоз";
  if(m==="mail") return "Почта";
}

const formatPrice = (p:number)=>new Intl.NumberFormat('ru-RU', {style: "currency", currency:"RUB", minimumFractionDigits:0}).format(p);
const formatDate = (d:string)=>new Date(d).toLocaleDateString('ru-RU', {day:'2-digit', month:"2-digit", year:"numeric"});


const OrdersManagementPage = () =>
{
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchOrders = async () => 
    {
        setLoading(true);
        setError('');
       
        try
        {
            const res = await fetch('/api/orders', {credentials:"include"}); 
            if(!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const list:Order[] = Array.isArray(data) ? data : [];
            setOrders(list.sort((a,b)=>new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));         
        }
        catch(e:any)
        {
            setError('Не удалось загрузить заказы: ' + e.message);
        }
        finally
        {
            setLoading(false);
        }
    };//fetchOrders

    useEffect(() => {fetchOrders(); }, []);

    const filtered = orders.filter(o=>{
        const q = search.toLowerCase();
        const matchSearch = String(o.numberOrder).includes(q) || o.customerName?.toLowerCase().includes(q) || o.customerEmail?.toLowerCase().includes(q) || o.customerPhone?.toLowerCase().includes(q);
        const matchStatus = filterStatus ? o.statusOrder  === filterStatus:true;
        return matchSearch && matchStatus;
    });


    const openStatusDialog = (order: Order)=>{
        setSelectedOrder(order);
        setNewStatus(order.statusOrder);
        setStatusDialogOpen(true);
    };


    const handleStatusSave = async() => {
        if(!selectedOrder) return;
        setStatusLoading(true);

        try
        {
            const body ={...selectedOrder, OrderId: selectedOrder.orderId, StatusOrder:newStatus};
            const res = await fetch(`/api/orders/${selectedOrder.orderId}`, { 
                method:'PUT', 
                credentials:'include', 
                headers: {"Content-Type": 'application/json'}, 
                body:JSON.stringify(body),
            });

            if(!res.ok)
            {
                setError(`Ошибка обновления статуса заказа #${selectedOrder.numberOrder}`);
                return;
            }//if
            setSuccess(`Статус заказа #${selectedOrder.numberOrder} обновлён`);
            setStatusDialogOpen(false);
            fetchOrders();
        }
        catch(e:any)
        {
            setError('Ошибка соединения: ' + e.message);
        }
        finally
        {
            setStatusLoading(false);
        }
    };//handleStatusSave



    const handleDelete = async() => {
        if(!orderToDelete) return;
        setStatusLoading(true);

        try
        {
            const res = await fetch(`/api/orders/${orderToDelete.orderId}`, { 
                method:'DELETE', 
                credentials:'include', 
            });

            if(!res.ok)
            {
                setError(`Ошибка удаления заказа #${orderToDelete.numberOrder}`);
                return;
            }//if
            setSuccess(`Заказ #${orderToDelete.numberOrder} удален`);
            setStatusDialogOpen(false);
            fetchOrders();
        }
        catch(e:any)
        {
            setError('Ошибка соединения: ' + e.message);
        }
        finally
        {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setOrderToDelete(null);
        }
    };//handleStatusSave





    return(
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 2 }}>
        Назад
      </Button>
 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Управление заказами</Typography>
          <Typography color="text.secondary">Всего: {orders.length}</Typography>
        </Box>
      </Box>
 
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
 
      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Поиск по номеру, имени, email, телефону..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Статус</InputLabel>
          <Select label="Статус" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            {status.map(s => <MenuItem key={s} value={s}>{statusLabel[s] ?? s}</MenuItem>)}
          </Select>
        </FormControl>
        <Tooltip title="Обновить">
          <IconButton onClick={fetchOrders}><Refresh /></IconButton>
        </Tooltip>
      </Paper>
 
      {/* Таблица */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><b>№ заказа</b></TableCell>
              <TableCell><b>Дата</b></TableCell>
              <TableCell><b>Покупатель</b></TableCell>
              <TableCell><b>Сумма</b></TableCell>
              <TableCell><b>Доставка</b></TableCell>
              <TableCell><b>Оплата</b></TableCell>
              <TableCell><b>Статус</b></TableCell>
              <TableCell align="right"><b>Действия</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {search || filterStatus ? 'Ничего не найдено' : 'Нет заказов'}
                </TableCell>
              </TableRow>
            ) : filtered.map(order => (
              <TableRow key={order.orderId} hover>
                <TableCell><b>#{order.numberOrder}</b></TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{order.customerName}</Typography>
                  <Typography variant="caption" color="text.secondary">{order.customerEmail}</Typography>
                </TableCell>
                <TableCell><Typography fontWeight="medium">{formatPrice(order.totalAmount)}</Typography></TableCell>
                <TableCell>{translateMethodDelivery(order.deliveryMethod)}</TableCell>
                <TableCell>
                  <Typography variant="body2">{translateMethodPayment(order.paymentMethod)}</Typography>
                  <Typography variant="caption" color="text.secondary">{order.paymentStatus}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabel[order.statusOrder] ?? order.statusOrder}
                    color={statusColor(order.statusOrder) as any}
                    size="small"
                  />
                </TableCell>
                
                <TableCell align="right">
                  <Tooltip title="Подробнее">
                    <IconButton size="small" onClick={() => navigate(`/order/${order.orderId}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Изменить статус">
                    <IconButton size="small" onClick={() => openStatusDialog(order)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => { setOrderToDelete(order); setDeleteDialogOpen(true); }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
 
      {/* Диалог изменения статуса */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Изменить статус заказа #{selectedOrder?.numberOrder}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select label="Статус" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {status.map(s => <MenuItem key={s} value={s}>{statusLabel[s] ?? s}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleStatusSave} disabled={statusLoading} sx={{ bgcolor: 'primary' }}>
            {statusLoading ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Удалить заказ?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить заказ <b>#{orderToDelete?.numberOrder}</b>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
export default OrdersManagementPage;