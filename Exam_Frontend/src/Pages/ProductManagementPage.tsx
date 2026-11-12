import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, InputAdornment, Tooltip,
  Divider, FormControl, InputLabel, Select, MenuItem,
  ListItemButton, ListItemText, useTheme,
} from '@mui/material';
import {
  ArrowBack, Add, Edit, Delete, Search, Refresh, Close, Settings, PhotoCamera,
  Folder, Image, KeyboardArrowRight, Upload,
} from '@mui/icons-material';

// ── Интерфейсы ──────────────────────────────────────────────────────────────────
interface ParentCategory {
  parentCategoryId: number;
  name: string;
  children: ChildrenCategory[];
}

interface ChildrenCategory {
  categoryId: number;
  name: string;
  parentCategoryId: number;
  productCount: number;
}

interface Category {
  categoryId: number;
  name: string;
}

interface Product {
  productId: number;
  brandId: number;
  categoryId: number;
  name: string;
  price: number;
  specifications: string;
  photos: string;
  category?: Category;
}

interface ProductFormData {
  brandId: string;
  parentCategoryId: string;
  categoryId: string;
  name: string;
  price: string;
  specifications: string;
  photos: string;
}

interface FileItem {
  fileName: string;
  url: string;
}

const emptyForm: ProductFormData = {
  brandId: '',
  parentCategoryId: '',
  categoryId: '',
  name: '',
  price: '',
  specifications: '',
  photos: '',
};

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Состояния для выбора файлов из папки ──────────────────────────────────
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Загрузка товаров ──────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products?pageSize=1000', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(data.items ?? data ?? []);
    } catch (e: any) {
      setError('Не удалось загрузить товары: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Загрузка родительских категорий ──────────────────────────────────────
  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/Categories/tree');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Дерево категорий загружено:', data);
        console.log('🔢 Количество родительских категорий:', data.length);
        setParentCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Ошибка ответа:', response.status);
      }
    } catch (e) {
      console.error('Ошибка загрузки дерева категорий:', e);
    }
  };

  // ── Загрузка папок из public/products ────────────────────────────────────
  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/Files/products');
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Ошибка загрузки папок:', error);
      setFolders([]);
    }
  };

  const fetchFiles = async (folder: string) => {
    setFilesLoading(true);
    setFiles([]);
    setSelectedFile(null);
    try {
      const res = await fetch(`/api/Files/products/${encodeURIComponent(folder)}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleSelectFolder = (folder: string) => {
    setSelectedFolder(folder);
    setFileSearch('');
    fetchFiles(folder);
  };

  // ── Вспомогательные функции ──────────────────────────────────────────────
  const getParentCategoryId = (categoryId: number): string => {
    for (const parentCategory of parentCategories) {
      if (parentCategory.children.some(c => c.categoryId === categoryId)) {
        return String(parentCategory.parentCategoryId);
      }
    }
    return '';
  };

  const getParentCategoryName = (categoryId: number): string => {
    for (const parentCategory of parentCategories) {
      const child = parentCategory.children.find(c => c.categoryId === categoryId);
      if (child) return parentCategory.name;
    }
    return '';
  };

  const getChildrenCategory = (parentId: string): ChildrenCategory[] => {
    if (!parentId) return [];
    const parentCategory = parentCategories.find(p => String(p.parentCategoryId) === parentId);
    return parentCategory?.children ?? [];
  };

  /*const getCategoryName = (categoryId: number): string => {
    for (const parentCategory of parentCategories) {
      const child = parentCategory.children.find(c => c.categoryId === categoryId);
      if (child) return child.name;
    }
    return String(categoryId);
  };*/

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchParentCategories();
  }, []);

  // При открытии диалога загружаем папки
  useEffect(() => {
    if (dialogOpen) {
      fetchFolders();
      setSelectedFolder(null);
      setSelectedFile(null);
      setFiles([]);
      setFolderSearch('');
      setFileSearch('');
    }
  }, [dialogOpen]);

  // ── Фильтрация ─────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      String(p.productId).includes(q)
    );
  });

  const filteredFolders = folders.filter(f =>
    f.toLowerCase().includes(folderSearch.toLowerCase())
  );

  const filteredFiles = files.filter(f =>
    f.fileName.toLowerCase().includes(fileSearch.toLowerCase())
  );

  // ── Обработчики диалога ──────────────────────────────────────────────────
  const openCreate = () => {
    console.log('📋 parentCategories при открытии:', parentCategories);
    console.log('📋 Количество:', parentCategories.length);
    setDialogMode('create');
    setSelectedProduct(null);
    setFormData(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setFormData({
      brandId: String(product.brandId),
      parentCategoryId: getParentCategoryId(product.categoryId),
      categoryId: String(product.categoryId),
      name: product.name,
      price: String(product.price),
      specifications: product.specifications ?? '',
      photos: product.photos ?? '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      const body = {
        BrandId: Number(formData.brandId),
        CategoryId: Number(formData.categoryId),
        Name: formData.name,
        Price: Number(formData.price),
        Specifications: formData.specifications,
        Photos: formData.photos,
      };

      let res: Response;
      if (dialogMode === 'create') {
        res = await fetch('/api/products', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/products/${selectedProduct!.productId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, ProductId: selectedProduct!.productId }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? data.Error ?? 'Ошибка сервера');
        return;
      }

      setSuccess(dialogMode === 'create' ? 'Товар добавлен' : 'Товар обновлён');
      setDialogOpen(false);
      fetchProducts();
    } catch (e: any) {
      setFormError('Ошибка соединения: ' + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        setError('Ошибка при удалении');
      } else {
        setSuccess(`Товар "${productToDelete.name}" удалён`);
        fetchProducts();
      }
    } catch (e: any) {
      setError('Ошибка соединения: ' + e.message);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

  // ── Рендер ──────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 2 }}>
        Назад
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Управление товарами</Typography>
          <Typography color="text.secondary">Всего: {products.length}</Typography>
        </Box>

        <Button variant="outlined" startIcon={<Upload />} onClick={() => navigate('/import_prices')} sx={{mr:-50}}>
          Импорт цен из Excel
        </Button>

        <Button variant="contained" startIcon={<Add />} onClick={openCreate} color="primary">
          Добавить
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Поиск по названию, категории, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Tooltip title="Обновить">
          <IconButton onClick={fetchProducts}><Refresh /></IconButton>
        </Tooltip>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Название</b></TableCell>
              <TableCell><b>Категория</b></TableCell>
              <TableCell><b>Цена</b></TableCell>
              <TableCell><b>Фото</b></TableCell>
              <TableCell align="right"><b>Действия</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {search ? 'Ничего не найдено' : 'Нет товаров'}
                </TableCell>
              </TableRow>
            ) : filtered.map(product => (
              <TableRow key={product.productId} hover>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>#{product.productId}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {product.photos ? (
                      <Box
                        component="img"
                        src={product.photos.split(',')[0].trim()}
                        alt={product.name}
                        sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.100' }}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Box sx={{ width: 40, height: 40, bgcolor: 'grey.100', borderRadius: 1 }} />
                    )}
                    <Typography variant="body2" fontWeight="medium">{product.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={getParentCategoryName(product.categoryId)} size="small" sx={{ bgcolor: 'action.hover', fontWeight: 500 }} />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{formatPrice(product.price)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.photos || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => openEdit(product)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => confirmDelete(product)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Характеристики">
                    <IconButton size="small" onClick={() => navigate(`/products_management/${product.productId}/specifications`)}><Settings fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Фотографии">
                    <IconButton size="small" onClick={() => navigate(`/products_management/${product.productId}/photos`)}><PhotoCamera fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог создания / редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Новый товар' : 'Редактировать товар'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField label="Название" value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} fullWidth />

          <TextField label="Цена (₽)" type="number" value={formData.price}
            onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} fullWidth />

          <Divider />

          <FormControl fullWidth>
            <InputLabel>Родительская категория</InputLabel>
            <Select value={formData.parentCategoryId} label="Родительская категория"
              onChange={e => setFormData(p => ({ ...p, parentCategoryId: e.target.value, categoryId: '' }))}>
              <MenuItem value="">— Выберите —</MenuItem>
              {parentCategories.map(pc => (
                <MenuItem key={pc.parentCategoryId} value={String(pc.parentCategoryId)}>{pc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.parentCategoryId && (
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select value={formData.categoryId} label="Категория"
                onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}>
                <MenuItem value="">— Выберите —</MenuItem>
                {getChildrenCategory(formData.parentCategoryId).map(child => (
                  <MenuItem key={child.categoryId} value={child.categoryId}>{child.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Divider />

          <TextField label="Описание" value={formData.specifications}
            onChange={e => setFormData(p => ({ ...p, specifications: e.target.value }))} fullWidth multiline rows={3} />

          {/* Выбор фото из папки */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Фото товара</Typography>

            {/* Поле для ввода URL */}
            <TextField
              label="Фото (URL или путь)"
              value={formData.photos}
              onChange={e => setFormData(p => ({ ...p, photos: e.target.value }))}
              fullWidth
              placeholder="https://example.com/photo.jpg или /products/folder/image.jpg"
              sx={{ mb: 2 }}
            />

            {/* Выбор из папки */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Или выберите файл из папки:
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, height: 300, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {/* Левая панель — папки */}
              <Box sx={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Поиск папки..."
                  value={folderSearch}
                  onChange={e => setFolderSearch(e.target.value)}
                  autoComplete="off"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>
                  }}
                />
                <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderColor: 'divider' }}>
                  {filteredFolders.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                      Папки не найдены
                    </Typography>
                  ) : (
                    filteredFolders.map(folder => (
                      <ListItemButton
                        key={folder}
                        selected={selectedFolder === folder}
                        onClick={() => handleSelectFolder(folder)}
                        sx={{ py: 0.75 }}
                      >
                        <Folder sx={{ fontSize: 18, mr: 1, color: selectedFolder === folder ? 'primary.main' : 'text.disabled' }} />
                        <ListItemText primary={folder} primaryTypographyProps={{ variant: 'body2', noWrap: true }} />
                        <KeyboardArrowRight sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </ListItemButton>
                    ))
                  )}
                </Paper>
              </Box>

              {/* Правая панель — файлы */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Поиск файла..."
                  value={fileSearch}
                  onChange={e => setFileSearch(e.target.value)}
                  autoComplete="off"
                  disabled={!selectedFolder}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>
                  }}
                />

                <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderColor: 'divider' }}>
                  {!selectedFolder ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.disabled' }}>
                      <Folder sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">Выберите папку слева</Typography>
                    </Box>
                  ) : filesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : filteredFiles.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                      Файлы не найдены
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1, p: 1.5 }}>
                      {filteredFiles.map(file => (
                        <Box
                          key={file.fileName}
                          onClick={() => {
                            setSelectedFile(file);
                            setFormData(prev => ({ ...prev, photos: file.url }));
                          }}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: selectedFile?.url === file.url ? 'primary.main' : 'transparent',
                            bgcolor: selectedFile?.url === file.url ? 'action.selected' : 'action.hover',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'primary.light' },
                          }}
                        >
                          <Box
                            component="img"
                            src={file.url}
                            alt={file.fileName}
                            sx={{
                              width: '100%',
                              aspectRatio: '1',
                              objectFit: 'contain',
                              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              px: 0.5,
                              pb: 0.5,
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: 10,
                            }}
                          >
                            {file.fileName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                {/* Выбранный файл */}
                {selectedFile && (
                  <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Image sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" color="text.primary" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFile.url}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Превью выбранного фото */}
            {formData.photos && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Превью:</Typography>
                <Box
                  component="img"
                  src={formData.photos}
                  alt="Превью"
                  sx={{
                    maxHeight: 100,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    mt: 0.5,
                  }}
                  onError={(e: any) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={formLoading || !formData.name || !formData.price || !formData.categoryId}
            color="primary">
            {formLoading ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Удалить товар?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить <b>{productToDelete?.name}</b>? Это действие необратимо.
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
};

export default ProductManagementPage;