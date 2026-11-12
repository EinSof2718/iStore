import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container, Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, Tooltip, Switch, FormControlLabel,
  useTheme, ListItemButton, ListItemText, Tabs, Tab, InputAdornment,
} from '@mui/material';
import {
  ArrowBack, Add, Delete, Star, StarBorder, Refresh,
  Folder, Image, Search, Link as LinkIcon, KeyboardArrowRight,
} from '@mui/icons-material';

interface Photo {
  photosProductId: number;
  productId: number;
  urlPhoto: string;
  mainPhoto: boolean;
  mediaType: "image" | "video";
}

interface FileItem {
  fileName: string;
  url: string;
}

const ProductPhotosPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Диалог добавления
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0 = браузер, 1 = URL
  const [urlInput, setUrlInput] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Браузер файлов
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  // Диалог удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Загрузка фото товара ────────────────────────────────────────────────────

  const fetchPhotos = async () => {
    if (!productId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/PhotosProducts/product/${productId}`, { credentials: 'include' });
      if (res.status === 404) { setPhotos([]); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map((p: any) => ({
        photosProductId: p.photosProductId || p.PhotosProductId,
        productId: p.productId || p.ProductId,
        urlPhoto: p.urlPhoto || p.UrlPhoto,
        mainPhoto: p.mainPhoto || p.MainPhoto,
        mediaType: p.mediaType || p.MediaType,
      })) : [];
      setPhotos(normalized);
    } catch (e: any) {
      setError('Не удалось загрузить фото/видео: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Загрузка папок из public/products ──────────────────────────────────────

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/Files/products');
      if (res.ok) setFolders(await res.json());
    } catch {}
  };

  const fetchFiles = async (folder: string) => {
    setFilesLoading(true);
    setFiles([]);
    setSelectedFile(null);
    try {
      const res = await fetch(`/api/Files/products/${encodeURIComponent(folder)}`);
      if (res.ok) setFiles(await res.json());
    } catch {}
    finally { setFilesLoading(false); }
  };

  useEffect(() => { fetchPhotos(); fetchFolders(); }, [productId]);

  const handleSelectFolder = (folder: string) => {
    setSelectedFolder(folder);
    setFileSearch('');
    fetchFiles(folder);
  };

  const openDialog = () => {
    setDialogOpen(true);
    setTab(0);
    setUrlInput('');
    setIsMain(false);
    setFormError('');
    setSelectedFolder(null);
    setSelectedFile(null);
    setFiles([]);
    setFolderSearch('');
    setFileSearch('');
  };

  // ── Добавить фото ────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    const url = tab === 0
      ? selectedFile?.url
      : urlInput.trim();

    if (!url) {
      setFormError(tab === 0 ? 'Выберите файл из папки' : 'Введите URL фото/видео');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch('/api/PhotosProducts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ProductId: Number(productId), UrlPhoto: url, MainPhoto: isMain }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || data.message || 'Ошибка при добавлении');
        return;
      }
      setSuccess('Фото/видео добавлено');
      setDialogOpen(false);
      fetchPhotos();
    } catch (e: any) {
      setFormError('Ошибка соединения: ' + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Главное фото ─────────────────────────────────────────────────────────────

  const handleSetMain = async (photo: Photo) => {
    try {
      const res = await fetch(`/api/PhotosProducts/${photo.photosProductId}/set-main`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) { setSuccess('Главное фото обновлено'); fetchPhotos(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Ошибка обновления'); }
    } catch (e: any) { setError('Ошибка соединения: ' + e.message); }
  };

  // ── Удалить фото ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!photoToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/PhotosProducts/${photoToDelete.photosProductId}`, {
        method: 'DELETE', credentials: 'include',
      });
      if (res.ok) {
        setSuccess('Фото/видео удалено'); fetchPhotos();
        setDeleteDialogOpen(false); setPhotoToDelete(null);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Ошибка при удалении');
      }
    } catch (e: any) { setError('Ошибка соединения: ' + e.message); }
    finally { setDeleteLoading(false); }
  };

  // ── Рендер ───────────────────────────────────────────────────────────────────

  const filteredFolders = folders.filter(f => f.toLowerCase().includes(folderSearch.toLowerCase()));
  const filteredFiles = files.filter(f => f.fileName.toLowerCase().includes(fileSearch.toLowerCase()));

  const previewUrl = tab === 0 ? selectedFile?.url : urlInput.trim() || null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/products_management')} sx={{ mb: 2, color: 'text.secondary' }}>
        К товарам
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">Фотографии/видео товара</Typography>
          <Typography color="text.secondary">Товар #{productId} · {photos.length} фото/видео</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Обновить">
            <IconButton onClick={fetchPhotos} sx={{ color: 'text.secondary' }}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={openDialog}
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            Добавить фото/видео
          </Button>
        </Box>
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Таблица фото */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              {['ID', 'Превью', 'URL / Путь', 'Главное', 'Действия'].map(h => (
                <TableCell key={h} align={h === 'Действия' ? 'right' : 'left'}
                  sx={{ color: 'text.primary', fontWeight: 'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : photos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <Typography gutterBottom>Нет фотографий/видео</Typography>
                  <Typography variant="body2">Нажмите «Добавить фото/видео»</Typography>
                </TableCell>
              </TableRow>
            ) : photos.map(photo => (
              <TableRow key={photo.photosProductId} hover>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>#{photo.photosProductId}</TableCell>


                <TableCell>
                  {photo.mediaType=="video" ? (
                    <video src={photo.urlPhoto} style={{width:64, height:64, objectFit:'cover', borderRadius:4, background:"#000"}}/>)  
                  :(
                    <Box component="img" src={photo.urlPhoto} alt="фото"
                      sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                      onError={(e: any) => { e.target.src = '/placeholder-product.png'; }} />
                    )}
                </TableCell>

                
                <TableCell>
                  <Typography variant="body2" color="text.secondary"
                    sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.mediaType==="video" ? '🎬' : '🖼️'} {photo.urlPhoto}
                  </Typography>
                </TableCell>

                <TableCell>
                  {photo.mainPhoto ? (
                    <Chip label="Главное" color="primary" size="small" icon={<Star fontSize="small" />} />
                  ) : (
                    <Tooltip title="Сделать главным">
                      <IconButton size="small" onClick={() => handleSetMain(photo)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                        <StarBorder fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => { setPhotoToDelete(photo); setDeleteDialogOpen(true); }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Диалог добавления ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}>
        <DialogTitle sx={{ color: 'text.primary', pb: 0 }}>Добавить фото/видео</DialogTitle>

        <Box sx={{ px: 3, pt: 1 }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setFormError(''); }}>
            <Tab icon={<Folder fontSize="small" />} iconPosition="start" label="Из папки public" />
            <Tab icon={<LinkIcon fontSize="small" />} iconPosition="start" label="По URL" />
          </Tabs>
        </Box>

        <DialogContent sx={{ pt: 2, minHeight: 380 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          {/* Вкладка: браузер файлов */}
          {tab === 0 && (
            <Box sx={{ display: 'flex', gap: 2, height: 340 }}>

              {/* Левая панель — папки */}
              <Box sx={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField size="small" placeholder="Поиск папки..." value={folderSearch}
                  onChange={e => setFolderSearch(e.target.value)} autoComplete="off"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'divider' } } }} />
                <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderColor: 'divider' }}>
                  {filteredFolders.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                      Папки не найдены
                    </Typography>
                  ) : filteredFolders.map(folder => (
                    <ListItemButton key={folder} selected={selectedFolder === folder}
                      onClick={() => handleSelectFolder(folder)}
                      sx={{ py: 0.75, '&.Mui-selected': { bgcolor: 'action.selected' } }}>
                      <Folder sx={{ fontSize: 18, mr: 1, color: selectedFolder === folder ? 'primary.main' : 'text.disabled' }} />
                      <ListItemText primary={folder} primaryTypographyProps={{ variant: 'body2', noWrap: true }} />
                      <KeyboardArrowRight sx={{ fontSize: 16, color: 'text.disabled' }} />
                    </ListItemButton>
                  ))}
                </Paper>
              </Box>

              {/* Правая панель — файлы */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField size="small" placeholder="Поиск файла..." value={fileSearch}
                  onChange={e => setFileSearch(e.target.value)} autoComplete="off"
                  disabled={!selectedFolder}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'divider' } } }} />

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
                        <Box key={file.fileName} onClick={() => setSelectedFile(file)}
                          sx={{
                            cursor: 'pointer', borderRadius: 1.5, overflow: 'hidden',
                            border: '2px solid',
                            borderColor: selectedFile?.url === file.url ? 'primary.main' : 'transparent',
                            bgcolor: selectedFile?.url === file.url ? 'action.selected' : 'action.hover',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'primary.light' },
                          }}>
                          <Box component="img" src={file.url} alt={file.fileName}
                            sx={{ width: '100%', aspectRatio: '1', objectFit: 'contain',
                              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }} />
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: 'block', px: 0.5, pb: 0.5, textAlign: 'center',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>
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
          )}

          {/* Вкладка: URL */}
          {tab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="URL фотографии/видео" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                fullWidth autoComplete="off" placeholder="https://example.com/photo.jpg"
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'divider' } } }} />
              {urlInput && (
                <Box component="img" src={urlInput} alt="превью"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }} />
              )}
            </Box>
          )}

          {/* Превью выбранного + переключатель "главное" */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            {previewUrl && (
              <Box component="img" src={previewUrl} alt="preview"
                sx={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                onError={(e: any) => { e.target.style.display = 'none'; }} />
            )}
            <FormControlLabel
              control={<Switch checked={isMain} onChange={e => setIsMain(e.target.checked)} />}
              label="Сделать главным фото"
              sx={{ color: 'text.primary' }} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Отмена</Button>
          <Button variant="contained" onClick={handleAdd} disabled={formLoading || (!selectedFile && !urlInput.trim())}>
            {formLoading ? <CircularProgress size={20} /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Диалог удаления ───────────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setPhotoToDelete(null); }}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}>
        <DialogTitle sx={{ color: 'text.primary' }}>Удалить фото/видео?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Это действие необратимо.
            {photoToDelete?.mainPhoto && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                ⚠️ Это главное фото товара
              </Box>
            )}
          </Typography>
          {photoToDelete?.urlPhoto && (
            <Box component="img" src={photoToDelete.urlPhoto} alt="preview"
              sx={{ mt: 2, maxWidth: '100%', maxHeight: 100, objectFit: 'contain', borderRadius: 1 }}
              onError={(e: any) => { e.target.style.display = 'none'; }} />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDeleteDialogOpen(false); setPhotoToDelete(null); }} sx={{ color: 'text.secondary' }}>
            Отмена
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductPhotosPage;
