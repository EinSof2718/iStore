import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, TextField,
  Alert, CircularProgress, IconButton, Divider, Stack,
} from '@mui/material';
import { ArrowBack, Save, Add, Delete, DragIndicator } from '@mui/icons-material';

interface SpecRow {
  specificationsProductId?: number;
  specKey: string;
  specValue: string;
  sortOrder: number;
  localId: string;
}

// Маппинг ответа бэкенда → внутренний формат
// Бэкенд возвращает: specificationsKey, specificationsValue, specificationsProductId, sortOrder
const mapFromServer = (s: any): SpecRow => ({
  specificationsProductId: s.specificationsProductId,
  specKey:   s.specificationsKey   ?? s.specKey   ?? '',
  specValue: s.specificationsValue ?? s.specValue ?? '',
  sortOrder: s.sortOrder ?? 0,
  localId: crypto.randomUUID(),
});

const emptyRow = (order: number): SpecRow => ({
  specKey: '',
  specValue: '',
  sortOrder: order,
  localId: crypto.randomUUID(),
});

const ProductSpecificationsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [specs, setSpecs] = useState<SpecRow[]>([emptyRow(0)]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSpecs = async () => {
    try {
      const res = await fetch(`/api/SpecificationsProducts/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSpecs(data.map(mapFromServer));
        } else {
          setSpecs([emptyRow(0)]);
        }
      }
    } catch (e: any) {
      setError('Ошибка загрузки: ' + e.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSpecs();
      setLoading(false);
    };
    init();
  }, [productId]);

  const handleChange = (localId: string, field: 'specKey' | 'specValue', value: string) => {
    setSpecs(prev => prev.map(s => s.localId === localId ? { ...s, [field]: value } : s));
  };

  const handleAddRow = () => {
    setSpecs(prev => [...prev, emptyRow(prev.length)]);
  };

  const handleDeleteRow = (localId: string) => {
    if (specs.length === 1) return;
    setSpecs(prev => prev.filter(s => s.localId !== localId));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const valid = specs.filter(s => s.specKey.trim() && s.specValue.trim());

    if (valid.length === 0) {
      setError('Добавьте хотя бы одну характеристику');
      setSaving(false);
      return;
    }

    try {
      // Бэкенд ожидает: { productId, specifications: [{ specificationsKey, specificationsValue }] }
      const res = await fetch('/api/SpecificationsProducts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(productId),
          specifications: valid.map(s => ({
            specificationsKey:   s.specKey.trim(),
            specificationsValue: s.specValue.trim(),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Ошибка ${res.status}`);
        return;
      }

      setSuccess(`Сохранено ${valid.length} характеристик`);
      await loadSpecs(); // перезагружаем с сервера
    } catch (e: any) {
      setError('Ошибка соединения: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  //const hasValidRows = specs.some(s => s.specKey.trim() && s.specValue.trim());

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/products_management')} sx={{ mb: 2 }}>
        К товарам
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Характеристики товара</Typography>
          <Typography color="text.secondary">Товар #{productId}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          color='primary'
        >
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Добавь любые характеристики — название и значение. Пустые строки игнорируются.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          {specs.map((spec) => (
            <Box key={spec.localId} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <DragIndicator sx={{ color: 'text.disabled', flexShrink: 0 }} />

              <TextField
                label="Название"
                placeholder="Процессор"
                value={spec.specKey}
                onChange={(e) => handleChange(spec.localId, 'specKey', e.target.value)}
                sx={{ flex: 1 }}
                size="small"
                autoComplete="off"
              />
              <TextField
                label="Значение"
                placeholder="Apple A18 Pro"
                value={spec.specValue}
                onChange={(e) => handleChange(spec.localId, 'specValue', e.target.value)}
                sx={{ flex: 2 }}
                size="small"
                autoComplete="off"
              />
              <IconButton
                onClick={() => handleDeleteRow(spec.localId)}
                color="error"
                size="small"
                disabled={specs.length === 1}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Button
          startIcon={<Add />}
          onClick={handleAddRow}
          sx={{ mt: 3 }}
          variant="outlined"
          fullWidth
        >
          Добавить характеристику
        </Button>
      </Paper>

      
    </Container>
  );
};

export default ProductSpecificationsPage;