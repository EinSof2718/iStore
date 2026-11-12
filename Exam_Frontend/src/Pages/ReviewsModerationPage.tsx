import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Alert, CircularProgress, Chip, Tooltip, Stack, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
  Rating, Avatar,
} from '@mui/material';
import {
  ArrowBack, Check, Close, Refresh, Replay
} from '@mui/icons-material';


interface Review {
    reviewId: number;
    productId: number;
    userId: string;
    userName: string;
    rating: number;
    description: string;
    createdDate: string;
    isApproved: boolean | null;
    rejectionReason: string | null;
}

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all'] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_LABEL: Record<StatusTab, string>={
    pending: "Ожидают",
    approved:"Одобренные",
    rejected:"Отклонённые",
    all:"Все",
};

const ReviewsModerationPage = () => {
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState<StatusTab>("pending");

    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchReviews = async (status:StatusTab=tab) => {
        setLoading(true);
        setError("");
        try 
        {
            const res = await fetch(`api/Reviews/all?status=${status}`, {credentials:'include'});
            if(!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setReviews(data.reviews ?? []);            
        } 
        catch (e:any) 
        {
         setError('Не удалось загрузить отзывы: ' + e.message);   
        }
        finally
        {
            setLoading(false);
        }
    };


    useEffect(() =>{
        fetchReviews(tab);
    },[tab]);


    const handleApprove = async (id:number) => {
        setActionLoading(id);
        try 
        {
            const res = await fetch(`api/Reviews/${id}/approve`, {method: "PUT", credentials:'include'});
            if(!res.ok) setError("Ошибка при одобрении");
            setSuccess("Отзыв одобрен");
            fetchReviews();           
        } 
        catch 
        {
            setError('Ошибка соединения')
        }
        finally
        {
            setActionLoading(null);
        }
    };

    const openReject = (id:number)=>{
        setRejectId(id);
        setRejectReason('');
        setRejectOpen(true);
    };

    const handleReject = async () => {
        if(!rejectId) return;
        setActionLoading(rejectId);

        try 
        {
            const res = await fetch(`api/Reviews/${rejectId}/reject`, {method: "PUT", credentials:'include', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({reason: rejectReason.trim() || 'Не соответствует правилам'}),});
            if(!res.ok) setError("Ошибка при отклонении");
            setSuccess("Отзыв отклонён");
            setRejectOpen(false);
            fetchReviews();           
        } 
        catch 
        {
            setError('Ошибка соединения')
        }
        finally
        {
            setActionLoading(null);
        }
    };


    const handleReset = async(id:number)=>{
        setActionLoading(id);
        try 
        {
            const res = await fetch(`api/Reviews/${id}/reset`, {method: "PUT", credentials:'include'});
            if(!res.ok) setError("Ошибка");
            setSuccess("Отзыв возвращён на модерацию");
            fetchReviews();           
        } 
        catch 
        {
            setError('Ошибка соединения')
        }
        finally
        {
            setActionLoading(null);
        }
    };

    const formatDate = (d:string) => new Date(d).toLocaleDateString('ru-RU', {day: '2-digit', month:'short', year:'numeric'});
    const pendingCount = reviews.filter(r=>r.isApproved===null).length;

    return(
        <Container maxWidth="xl" sx={{py:4}}>
            <Button startIcon={<ArrowBack />} onClick={()=>navigate('/profile')} sx={{mb:2, color:'text.secondary'}}>Назад</Button>

            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:3}}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">Модерация отзывов</Typography>
                    <Typography color="text.primary">Управление отзывами покупателей</Typography>
                </Box>
                <Tooltip title="Обновить">
                    <IconButton onClick={()=>fetchReviews}><Refresh /></IconButton>
                </Tooltip>
            </Box>

            {error && <Alert severity="error" sx={{mb:2}} onClose={()=>setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb:2}} onClose={()=>setSuccess('')}>{success}</Alert>}


            {/* Табы */}
            <Paper sx={{mb:3, border: '1x solid', borderColor:'divider'}}>
                <Tabs value={tab} onChange={(_, v)=>setTab(v)} variant='fullWidth'>
                    {STATUS_TABS.map(s=>(
                        <Tab key={s} value={s} label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <span>{STATUS_LABEL[s]}</span>
                                {s==='pending' && pendingCount>0 && (
                                    <Chip label={pendingCount} size="small" color="warning" sx={{height:18, fontSize:10}}/>
                                )}
                            </Stack>
                        }/>
                    ))}
                </Tabs>
            </Paper>


            {/* Таблица */}
            <TableContainer component={Paper} sx={{borderRadius:2, border:"1px solid", borderColor:'divider'}}>
                <Table>
                    <TableHead>
                        <TableRow sx={{bgcolor: 'action.hover'}}>
                            {['ID', 'Пользователь', "Товар", "Оценка", "Отзыв", "Дата", "Статус", "Действие"].map(h=>(
                                <TableCell key={h} sx={{fontWeight:700}}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} align="center" sx={{py:3}}><CircularProgress /></TableCell></TableRow>
                        ) : reviews.length===0 ? (
                            <TableRow><TableCell colSpan={8} align="center" sx={{py:6, color: 'text.secondary'}}>{tab==='pending' ? 'Нет отзывов ожидающих модерации' : 'Нет отзывов'}</TableCell></TableRow>
                        ) : reviews.map(review=>(
                            <TableRow key={review.reviewId} hover sx={{bgcolor: review.isApproved===null ? 'warning.light' + '10' : review.isApproved===false ? 'error.light' + '08' : undefined}}>
                                <TableCell sx={{color:'text.secondary', fontSize: 13}}>#{review.reviewId}</TableCell>
                                
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar sx={{width:28, height:28, fontSize:12, bgcolor:'primary.main'}}>{(review.userName || 'U')[0].toUpperCase()}</Avatar>
                                        <Typography variant='body2' fontWeight={500}>{review.userName || '-'}</Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Chip label={`#${review.productId}`} size="small" sx={{bgcolor: 'action.hover'}}/>
                                </TableCell>

                                <TableCell>
                                    <Rating value={review.rating} readOnly size="small" sx={{color:'#F59E08'}}/>
                                </TableCell>

                                <TableCell sx={{maxWidth:300}}>
                                    <Typography variant="body2" sx={{overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{review.description}</Typography>
                                    {review.rejectionReason && (
                                        <Typography variant="caption" color="error.main" sx={{display:'block', mt:0.5}}>Причина: {review.rejectionReason}</Typography>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">{formatDate(review.createdDate)}</Typography>
                                </TableCell>

                                <TableCell>
                                    {review.isApproved===null && <Chip label="Ожидает" size="small" color="warning"/>}
                                    {review.isApproved===true && <Chip label="Одобрен" size="small" color="success"/>}
                                    {review.isApproved===false && <Chip label="Отклонён" size="small" color="error"/>}
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={0.5}>
                                        
                                        {/* Одобрить */}
                                        {review.isApproved!==true && (
                                            <Tooltip title="Одобрить">
                                                <IconButton size="small" color="success" disabled={actionLoading===review.reviewId} onClick={() => handleApprove(review.reviewId)}>{actionLoading===review.reviewId ? <CircularProgress size={16} /> : <Check fontSize="small" />}</IconButton>
                                            </Tooltip>
                                        )}

                                        {/* Отклонить */}
                                        {review.isApproved!==false && (
                                            <Tooltip title="Отклонить">
                                                <IconButton size="small" color="error" disabled={actionLoading===review.reviewId} onClick={() => openReject(review.reviewId)}><Close fontSize="small"/></IconButton>
                                            </Tooltip>
                                        )}

                                        {/* Вернуть на модерацию */}
                                        {review.isApproved!==null && (
                                            <Tooltip title="Вернуть на модерацию">
                                                <IconButton size="small" color="default" disabled={actionLoading===review.reviewId} onClick={() => handleReset(review.reviewId)}><Replay fontSize="small"/></IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


            {/* Диалог отклонения */}
            <Dialog open={rejectOpen}>
                <DialogTitle>Отклонить отзыв</DialogTitle>
                <DialogContent sx={{pt: '16px !important'}}>
                        <TextField fullWidth multiline rows={10} autoFocus label="Причина отклонения" placeholder="Например: содержит недостоверную информацию, нарушает правила..." value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
                </DialogContent>

                <DialogActions sx={{px:3, pb:2}}>
                    <Button onClick={()=>setRejectOpen(false)} sx={{color:'text.secondary'}}>Отмена</Button>
                    <Button variant="contained" color="error" onClick={handleReject}>Отклонить</Button>                    
                </DialogActions>
            </Dialog>
        </Container>
    );
};


export default ReviewsModerationPage