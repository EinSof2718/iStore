import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, Alert,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Stack, Divider, LinearProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowBack, Upload, Download, CheckCircle, Error,
  TableChart, FileUpload,
} from '@mui/icons-material';

interface ImportRes{
    row:number;
    productId:number;
    name:string;
    oldPrice:number;
    newPrice:number;
}

interface ImportError{
    row:number;
    error: string;
}

interface ImportResponse
{
    message:string;
    updatedCnt:number;
    errorsCnt: number;
    results: ImportRes[];
    errors: ImportError[];
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(p || 0);


const ImportPricePage = ()=>
{
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const fileRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File|null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState<ImportResponse | null>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if(!file) return;
        const extension = file.name.split('.').pop()?.toLowerCase();
        if(extension != "xls" && extension != "xlsx")
        {
            setError('Допустимы только файлы .xls и .xlsx');
            return;
        }//if
        setFile(file);
        setError('');
        setResponse(null);
    };//handleFileChange

    const handleDrop = (e:React.DragEvent)=>{
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if(!file) return;
        const extension = file.name.split('.').pop()?.toLowerCase();
        if(extension != "xls" && extension != "xlsx")
        {
            setError('Допустимы только файлы .xls и .xlsx');
            return;
        }//if
        setFile(file);
        setError('');
        setResponse(null);
    };//handleDrop


    const handleUpload = async () => {
        if(!file) return;
        setLoading(true);
        setError('');
        setResponse(null);

        const formData = new FormData();
        formData.append('file', file);

        try{
            const res = await fetch(`/api/ImportPrice/prices`, {method: 'POST', credentials:'include', body: formData});
            const data = await res.json();
            if(!res.ok)
            {
                setError(data.error ?? `Error ${res.status}`);
                return;
            }//if

            setResponse(data);
            setFile(null);
            if(fileRef.current)
                fileRef.current.value = '';
        }
        catch(e:any)
        {
            setError('Ошибка соединения: ' + e.message);
        }
        finally
        {
            setLoading(false);
        }
    };//handleUpload




    const handleDownloadTemplate = async () =>{
        setDownloading(true);
        setError('');
        try 
        {
            const res = await fetch(`/api/ImportPrice/template`, {credentials:'include'});
            if(!res.ok)
            {
                setError("Ошибка скачивания шаблона");
                return;
            }//if
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `istore_prices_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e:any) 
        {
            setError('Ошибка ' + e.message);   
        }
        finally
        {
            setDownloading(false);
        }
    };//handleDownloadTemplate

    const priceDiff =(oldPrice: number, newPrice: number)=>{
        const diff = newPrice-oldPrice;
        if(diff===0) return null;
        return (
            <Chip
                size="small"
                label={diff > 0 ? `+${formatPrice(diff)}` : formatPrice(diff)}
                sx={{bgcolor: diff > 0 ? 'error.light' : 'success.light', color:   diff > 0 ? 'error.dark'  : 'success.dark',fontSize: 11, height: 20,}} 
            />
        );
    };//priceDiff

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 2, color: 'text.secondary' }}>
        Назад
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">Импорт цен из Excel</Typography>
        <Typography color="text.secondary">Загрузи файл .xlsx с колонками ProductId и Price</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>

        {/* ── Инструкция ───────────────────────────────────────────────────── */}
        <Paper sx={{ p: 3, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TableChart sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>Формат файла</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Файл должен содержать строку заголовков и данные:
          </Typography>

          {/* Мини-превью таблицы */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)' }}>
                  {['ProductId', 'Name', 'Price'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'primary.main' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[[1, 'Iphone 17 pro', '109990'], [2, 'Ipad Air 11', '89990'], [3, 'AirPods Pro 2', '15990'],].map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} sx={{ fontSize: 12, color: cell === '' ? 'text.disabled' : 'text.primary' }}>
                        {cell || '(пусто)'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          <Button fullWidth variant="outlined" startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
            onClick={handleDownloadTemplate} disabled={downloading}>
            Скачать шаблон с текущими ценами
          </Button>
        </Paper>

        {/* ── Загрузка файла ────────────────────────────────────────────────── */}
        <Paper sx={{ p: 3, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FileUpload sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>Загрузка файла</Typography>
          </Box>

          {/* Drag & Drop зона */}
          <Box
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: file ? 'success.main' : 'divider',
              borderRadius: 2,
              p: 4, mb: 2,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: file
                ? (isDark ? 'rgba(48,209,88,0.08)' : 'rgba(48,209,88,0.05)')
                : 'action.hover',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: isDark ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.04)' },
            }}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />

            {file ? (
              <>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography fontWeight={600} color="success.main">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} КБ · нажми чтобы заменить
                </Typography>
              </>
            ) : (
              <>
                <Upload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography fontWeight={500} color="text.secondary">Перетащи файл или нажми для выбора</Typography>
                <Typography variant="caption" color="text.disabled">.xlsx, .xls</Typography>
              </>
            )}
          </Box>

          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <Button fullWidth variant="contained" size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
            onClick={handleUpload} disabled={!file || loading}
            sx={{ borderRadius: 2 }}>
            {loading ? 'Обрабатываем...' : 'Загрузить и применить цены'}
          </Button>
        </Paper>
      </Stack>

      {/* ── Результаты ───────────────────────────────────────────────────────── */}
      {response && (
        <Box>
          {/* Итог */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
            <Alert severity="success" icon={<CheckCircle />} sx={{ flex: 1, minWidth: 200 }}>
              <strong>{response.message}</strong>
            </Alert>
            {response.errorsCnt > 0 && (
              <Alert severity="warning" icon={<Error />} sx={{ flex: 1, minWidth: 200 }}>
                Ошибок: <strong>{response.errorsCnt}</strong> строк пропущено
              </Alert>
            )}
          </Stack>

          {/* Таблица обновлённых товаров */}
          {response.results.length > 0 && (
            <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>
                  Обновлённые товары ({response.results.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      {['Строка', 'ID', 'Название', 'Старая цена', 'Новая цена', 'Изменение'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.results.map((r, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ color: 'text.disabled', fontSize: 12 }}>{r.row}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>#{r.productId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{r.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: r.oldPrice !== r.newPrice ? 'line-through' : 'none' }}>
                            {formatPrice(r.oldPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color={r.newPrice < r.oldPrice ? 'success.main' : r.newPrice > r.oldPrice ? 'error.main' : 'text.primary'}>
                            {formatPrice(r.newPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell>{priceDiff(r.oldPrice, r.newPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Таблица ошибок */}
          {response.errors.length > 0 && (
            <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'error.light', bgcolor: isDark ? 'rgba(255,69,58,0.08)' : 'rgba(255,69,58,0.04)' }}>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  Ошибки ({response.errors.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Строка</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Причина</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.errors.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: 'text.secondary' }}>{e.row}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{e.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ImportPricePage;