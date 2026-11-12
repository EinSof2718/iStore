import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Divider,
  Link,
  Stack,
  Paper,
  Chip,
  Grid,
  Rating,
  Tabs,
  Tab,
  Breadcrumbs,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  Collapse
} from '@mui/material';
import {
  LocalShipping,
  Verified,
  CreditCard,
  Support,
  Security,
  ShoppingCart,
  Add,
  Remove,
  Star,
  StarBorder,
  Send,
  Delete,
  PlayArrow,
  AttachFile,
  VideoFile,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';


interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  discountPrice?: number;
  description: string;
  fullDescription: string;
  category: string;
  images: string[];
  color: string;
  storageOptions: number;
  specifications: Record<string, string>;
  cntStars: number;
  reviewsCount: number;
  isNew: boolean;
  isBestseller: boolean;
  inStock: boolean;
  warranty: number;
  delivery: string[];
  features: string[];
}

interface ProductResponse {
  productId: number;
  name: string;
  brand?: string;
  model?: string;
  price: number;
  discountPrice?: number;
  description: string;
  fullDescription?: string;
  category: string;
  imageUrl?: string;
  color?: string;
  storageOptions?: number;
  cntStars?: number;
  isNew?: boolean;
  inStock?: boolean;
  reviewsCount?: number;
  isBestseller?: boolean;
  warranty?: number;
  delivery?: string[];
  features?: string[];
  specifications: string;
}

interface ReviewPhoto {
  photosReviewId: number;
  urlPhoto: string;
  mediaType: 'image' | 'video';
}

interface Review {
  reviewId: number;
  productId: number;
  userId: string;
  userName?: string;
  cntStars: number;
  description: string;
  createdDate: string;
  photos?: ReviewPhoto[];
}

interface MediaItem {
  photosProductId: number;
  productId: number;
  urlPhoto: string;
  mediaType: 'image' | 'video';
  previewUrl?: string;
  mainPhoto: boolean;
}

interface ReplyNode {
  replyId: number;
  reviewId: number;
  userId: string;
  userName: string;
  text: string;
  createDate: string;
  isManager: boolean;
  parentReplyId: number | null;
  children: ReplyNode[];
  depth: number;
}



const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr); } catch { return null; }
};

const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?.Id || '';
};



const buildReplyTree = (
  replies: any[],
  parentId: number | null = null,
  depth: number = 0
): ReplyNode[] => {
  return replies
    .filter(r => (r.parentReplyId ?? null) === parentId)
    .map(r => ({
      ...r,
      depth,
      children: buildReplyTree(replies, r.replyId, depth + 1),
    }));
};



interface ReplyItemProps {
  reply: ReplyNode;
  currentUserId: string;
  isManagerUser: boolean;
  onReply: (parentReplyId: number) => void;
  onDelete: (replyId: number) => void;
  openReplyForm: number | null;
  nestedReplyText: string;
  onNestedReplyTextChange: (t: string) => void;
  onSubmitNested: (parentReplyId: number) => void;
  submittingNested: boolean;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  currentUserId,
  isManagerUser,
  onReply,
  onDelete,
  openReplyForm,
  nestedReplyText,
  onNestedReplyTextChange,
  onSubmitNested,
  submittingNested,
}) => {
  const canDelete = reply.userId === currentUserId || isManagerUser;
  const maxDepth = 4;
  const paddingLeft = Math.min(reply.depth, maxDepth) * 2;

  return (
    <Box sx={{ pl: paddingLeft }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Avatar sx={{
          width: 28, height: 28, flexShrink: 0,
          bgcolor: reply.isManager ? 'primary.main' : 'action.hover',
          color: reply.isManager ? 'primary.contrastText' : 'text.secondary',
          fontSize: 12,
        }}>
          {(reply.userName || 'U')[0].toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Шапка ответа: имя + бейдж + дата */}
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {reply.userName}
            </Typography>
            {reply.isManager && (
              <Chip
                label="Команда iStore"
                size="small"
                sx={{ height: 18, fontSize: 10, bgcolor: 'primary.main', color: '#fff' }}
              />
            )}
            <Typography variant="caption" color="text.disabled">
              {formatDate(reply.createDate)}
            </Typography>
          </Stack>

          {/* Текст ответа */}
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.25, whiteSpace: 'pre-line' }}>
            {reply.text}
          </Typography>

          {/* Кнопки Ответить / Удалить */}
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Button
              size="small"
              onClick={() => onReply(reply.replyId)}
              sx={{ fontSize: 11, textTransform: 'none', color: 'text.secondary', minWidth: 0, p: 0.5 }}
            >
              Ответить
            </Button>
            {canDelete && (
              <Button
                size="small"
                onClick={() => onDelete(reply.replyId)}
                sx={{ fontSize: 11, textTransform: 'none', color: 'error.main', minWidth: 0, p: 0.5 }}
              >
                Удалить
              </Button>
            )}
          </Stack>

          {/* Форма ответа на этот ответ */}
          {openReplyForm === reply.replyId && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                size="small"
                multiline
                maxRows={3}
                autoFocus
                placeholder={`Ответить ${reply.userName}...`}
                value={nestedReplyText}
                onChange={e => onNestedReplyTextChange(e.target.value)}
                inputProps={{ maxLength: 2000 }}
              />
              <IconButton
                color="primary"
                size="small"
                onClick={() => onSubmitNested(reply.replyId)}
                disabled={!nestedReplyText.trim() || submittingNested}
              >
                {submittingNested ? <CircularProgress size={18} /> : <Send fontSize="small" />}
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Рекурсия: вложенные ответы */}
      {reply.children.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {reply.children.map(child => (
            <ReplyItem
              key={child.replyId}
              reply={child}
              currentUserId={currentUserId}
              isManagerUser={isManagerUser}
              onReply={onReply}
              onDelete={onDelete}
              openReplyForm={openReplyForm}
              nestedReplyText={nestedReplyText}
              onNestedReplyTextChange={onNestedReplyTextChange}
              onSubmitNested={onSubmitNested}
              submittingNested={submittingNested}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};


const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Медиа товара
  const [productMedia, setProductMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState(0);

  // Товар
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countProduct, setCountProduct] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Отзывы
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewDialogeOpen, setReviewDialogeOpen] = useState(false);
  const [newReview, setNewReview] = useState({ cntStars: 5, description: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewDeleteDialogeOpen, setReviewDeleteDialogeOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleteReviewLoading, setDeleteReviewLoading] = useState(false);

  // Уведомления
  const [notification, setNotification] = useState<{open: boolean;message: string;severity: 'success' | 'error' | 'info'; }>({ open: false, message: '', severity: 'info' });
    
  // Похожие товары
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  // Файлы отзыва
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const reviewFileRef = useRef<HTMLInputElement>(null);

  // ─── Ответы ────────────────────────────────────────────────
  const [repliesByReview, setRepliesByReview] = useState<Record<number, any[]>>({});
  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  const [replyTextByReview, setReplyTextByReview] = useState<Record<number, string>>({});
  const [replyLoadingByReview, setReplyLoadingByReview] = useState<Record<number, boolean>>({});
  const [submittingReplyByReview, setSubmittingReplyByReview] = useState<Record<number, boolean>>({});

  // ─── Ответы на ответы ──────────────────────────────────────
  const [replyToReplyId, setReplyToReplyId] = useState<number | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState('');
  const [submittingNested, setSubmittingNested] = useState(false);

  const currentUser = getCurrentUser();
  const currentUserId = getCurrentUserId();
  const isManagerUser = !!currentUser?.roles?.some((r: string) =>
    ['Admin', 'Manager', 'Moderator'].includes(r)
  );



  const loadProductMedia = async (productId: string | number) => {
    try {
      const response = await fetch(`/api/PhotosProducts/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: MediaItem[] = data.map((p: any) => {
            const rawUrl = p.urlPhoto || p.UrlPhoto || '';
            const absUrl = rawUrl.startsWith('http')
              ? rawUrl
              : `https://localhost:7165${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;

            const rawPreview = p.previewUrl || p.PreviewUrl;
            const absPreview = rawPreview
              ? (rawPreview.startsWith('http')
                  ? rawPreview
                  : `https://localhost:7165${rawPreview.startsWith('/') ? rawPreview : `/${rawPreview}`}`)
              : undefined;

            return {
              photosProductId: p.photosProductId || p.PhotosProductId,
              productId: p.productId || p.ProductId,
              urlPhoto: absUrl,
              mediaType: (p.mediaType || p.MediaType || 'image') as 'image' | 'video',
              previewUrl: absPreview,
              mainPhoto: p.mainPhoto || p.MainPhoto || false,
            };
          });

          normalized.sort((a, b) => (b.mainPhoto ? 1 : 0) - (a.mainPhoto ? 1 : 0));
          setProductMedia(normalized);
          setSelectedMedia(0);
          return;
        }
      }
      setProductMedia([]);
    } catch {
      setProductMedia([]);
    }
  };



  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) return;
        const productResponse = await fetch(`/api/products/${id}`);
        if (!productResponse.ok) throw new Error(`Ошибка загрузки продукта: ${productResponse.status}`);
        const productData: ProductResponse = await productResponse.json();

        const specificationsData: Record<string, string> = {};
        try {
          const specificationsResponse = await fetch(`/api/SpecificationsProducts/product/${id}`);
          if (specificationsResponse.ok) {
            const specsData = await specificationsResponse.json();
            if (Array.isArray(specsData) && specsData.length > 0) {
              specsData.forEach((spec: any) => {
                const key = spec.specificationsKey || spec.specKey || '';
                const value = spec.specificationsValue || spec.specValue || '';
                if (key) specificationsData[key] = value;
              });
            }
          }
        } catch { /* fallback */ }

        const productObj: Product = {
          id: productData.productId,
          name: productData.name || 'Без названия',
          brand: productData.brand || productData.name?.split(' ')[0] || 'Не указан',
          model: productData.model || productData.name?.split(' ').slice(1).join(' ') || 'Не указана',
          price: productData.price || 0,
          discountPrice: productData.discountPrice,
          description: productData.description || '',
          fullDescription: productData.fullDescription || productData.specifications || '',
          category: (productData.category as any)?.name || 'Без категории',
          images: [],
          color: productData.color || 'Не указан',
          storageOptions: productData.storageOptions || 0,
          specifications: specificationsData,
          cntStars: productData.cntStars || 0,
          reviewsCount: productData.reviewsCount || 0,
          isNew: productData.isNew || false,
          isBestseller: productData.isBestseller || false,
          inStock: productData.inStock ?? true,
          warranty: productData.warranty || 12,
          delivery: productData.delivery || ['Самовывоз', 'Курьерская доставка'],
          features: productData.features || [],
        };
        setProduct(productObj);
        await loadProductMedia(id);

        // Похожие товары
        try {
          const similarRes = await fetch(`/api/Products/${id}/similar`);
          if (similarRes.ok) {
            const data = await similarRes.json();
            setSimilarProducts(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error("Ошибка загрузки похожих:", err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);


  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/Reviews/product/${id}`);
      if (!response.ok) return;

      const data = await response.json();
      const reviewsArray: Review[] = (Array.isArray(data) ? data : []).map((r: any) => ({
        reviewId: r.reviewId,
        productId: r.productId,
        userId: r.userId,
        userName: r.userName,
        cntStars: r.rating || r.Rating || 0,
        description: r.description,
        createdDate: r.createdDate,
        photos: Array.isArray(r.photos) ? r.photos : [],
      }));
      setReviews(reviewsArray);

      try {
        const repliesRes = await fetch(`/api/ReviewReplys/product/${id}`);
        if (repliesRes.ok) {
          const allReplies = await repliesRes.json();
          const repliesMap: Record<number, any[]> = {};
          reviewsArray.forEach(r => { repliesMap[r.reviewId] = []; });

          (Array.isArray(allReplies) ? allReplies : []).forEach((reply: any) => {
            if (!repliesMap[reply.reviewId]) repliesMap[reply.reviewId] = [];
            repliesMap[reply.reviewId].push(reply);
          });

          setRepliesByReview(repliesMap);

          const openMap: Record<number, boolean> = {};
          reviewsArray.forEach(r => {
            openMap[r.reviewId] = (repliesMap[r.reviewId]?.length || 0) > 0;
          });
          setOpenReplies(openMap);
        }
      } catch (err) {
        console.error('Ошибка загрузки ответов:', err);
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 2) fetchReviews();
  }, [tabValue, id]);



  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));

  const handleCountProductChange = (type: 'increase' | 'decrease') => {
    setCountProduct(prev => {
      if (type === 'increase' && prev < 10) return prev + 1;
      if (type === 'decrease' && prev > 1) return prev - 1;
      return prev;
    });
  };

  const handleReviewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const extensions = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const valid = files.filter(f => extensions.includes(f.type));
    setReviewFiles(prev => [...prev, ...valid]);
  };

  // Корзина
  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      const basketData = {
        UserId: currentUserId,
        ProductId: product.id,
        CountProduct: countProduct,
        addedDate: new Date().toISOString(),
      };
      const addResponse = await fetch('/api/Baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basketData),
      });
      if (addResponse.ok) {
        setNotification({ open: true, message: 'Товар добавлен в корзину', severity: 'success' });
      } else {
        const errorText = await addResponse.text();
        throw new Error(`Ошибка добавления: ${errorText}`);
      }
      setCountProduct(1);
    } catch (error) {
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Не удалось добавить',
        severity: 'error',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Отправка отзыва
  const handleSubmitReview = async () => {
    if (!id || !newReview.description.trim()) {
      setNotification({ open: true, message: 'Заполните текст отзыва', severity: 'info' });
      return;
    }

    setSubmittingReview(true);
    try {
      const userId = currentUser?.id || currentUser?.Id || '';
      const userName = currentUser?.fullName || 'Пользователь';

      const response = await fetch('/api/Reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(id),
          userId,
          userName,
          cntStars: newReview.cntStars,
          description: newReview.description.trim(),
        }),
      });

      if (response.ok) {
        const saved = await response.json();

        // Загружаем фото
        if (reviewFiles.length > 0) {
          await Promise.all(reviewFiles.map(async file => {
            const formData = new FormData();
            formData.append('file', file);
            await fetch(`/api/PhotosReview/upload?reviewId=${saved.reviewId}`, {
              method: 'POST', credentials: 'include', body: formData,
            });
          }));
        }

        setReviewFiles([]);
        setNotification({ open: true, message: 'Отзыв отправлен на модерацию!', severity: 'success' });
        setReviewDialogeOpen(false);
        setNewReview({ cntStars: 5, description: '' });
        fetchReviews();
      } else {
        const errorText = await response.text();
        setNotification({ open: true, message: errorText || 'Не удалось', severity: 'error' });
      }
    } catch {
      setNotification({ open: true, message: 'Не удалось отправить отзыв', severity: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Удаление отзыва
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    setDeleteReviewLoading(true);
    try {
      const response = await fetch(`/api/Reviews/${reviewToDelete.reviewId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка');
      setNotification({ open: true, message: 'Отзыв удалён', severity: 'success' });
      fetchReviews();
    } catch {
      setNotification({ open: true, message: 'Не удалось удалить отзыв', severity: 'error' });
    } finally {
      setDeleteReviewLoading(false);
      setReviewDeleteDialogeOpen(false);
      setReviewToDelete(null);
    }
  };

  const canDeleteReview = (review: Review): boolean => {
    if (!currentUser) return false;
    if (currentUser.isManager) return true;
    if (currentUser.roles && Array.isArray(currentUser.roles) &&
        (currentUser.roles.includes('Admin') || currentUser.roles.includes('Manager'))) return true;
    return review.userId === currentUser.id || review.userId === currentUser.Id;
  };


  const fetchReplies = async (reviewId: number) => {
    setReplyLoadingByReview(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`/api/ReviewReplys/review/${reviewId}`);
      if (res.ok) {
        const data = await res.json();
        setRepliesByReview(prev => ({ ...prev, [reviewId]: Array.isArray(data) ? data : [] }));
      }
    } catch (error) {
      console.error("Ошибка загрузки ответов: ", error);
    } finally {
      setReplyLoadingByReview(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleToggleReplies = (reviewId: number) => {
    const isOpen = openReplies[reviewId];
    if (!isOpen && !repliesByReview[reviewId]) {
      fetchReplies(reviewId);
    }
    setOpenReplies(prev => ({ ...prev, [reviewId]: !isOpen }));
  };


  const handleSubmitReply = async (reviewId: number, parentReplyId: number | null = null) => {
    const text = parentReplyId
      ? nestedReplyText.trim()
      : replyTextByReview[reviewId]?.trim();

    if (!text) return;

    const userId = currentUser?.id || currentUser?.Id || '';
    const userName = currentUser?.fullName || 'Пользователь';

    if (!userId) {
      setNotification({ open: true, message: 'Войдите, чтобы ответить', severity: 'info' });
      return;
    }

    if (parentReplyId) setSubmittingNested(true);
    else setSubmittingReplyByReview(prev => ({ ...prev, [reviewId]: true }));

    try {
      const body: any = { reviewId, userId, userName, text };
      if (parentReplyId) body.parentReplyId = parentReplyId;

      const res = await fetch('/api/ReviewReplys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newReply = await res.json();
        setRepliesByReview(prev => ({
          ...prev,
          [reviewId]: [...(prev[reviewId] || []), newReply],
        }));

        if (parentReplyId) {
          setNestedReplyText('');
          setReplyToReplyId(null);
        } else {
          setReplyTextByReview(prev => ({ ...prev, [reviewId]: '' }));
        }

        setOpenReplies(prev => ({ ...prev, [reviewId]: true }));
      } else {
        const error = await res.text();
        setNotification({ open: true, message: error || 'Не удалось', severity: 'error' });
      }
    } catch {
      setNotification({ open: true, message: 'Ошибка соединения', severity: 'error' });
    } finally {
      if (parentReplyId) setSubmittingNested(false);
      else setSubmittingReplyByReview(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReply = async (reviewId: number, replyId: number) => {
    try {
      const res = await fetch(`/api/ReviewReplys/${replyId}?userId=${currentUserId}`, {method: "DELETE",credentials: 'include', });
      if (res.ok) {
        setRepliesByReview(prev => ({...prev,[reviewId]: (prev[reviewId] || []).filter(r => r.replyId !== replyId), }));
      }
    } catch (error) {
      console.error('Ошибка удаления ответа: ', error);
    }
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Товар не найден'}</Alert>
        <Button variant="contained" onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </Container>
    );
  }

  const currentMedia = productMedia[selectedMedia];

  return (
    <Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Хлебные крошки */}
      <Container maxWidth="lg" sx={{ py: { xs: 1.5, md: 2 }, px: { xs: 2, sm: 3 } }}>
        <Breadcrumbs sx={{ mb: { xs: 1.5, md: 2 }, color: 'text.secondary' }}>
          <Link component={RouterLink} to="/" color="inherit">Главная</Link>
          <Link component={RouterLink} to="/catalog" color="inherit">Каталог</Link>
          <Typography color="text.primary" sx={{
            maxWidth: { xs: '120px', sm: '200px' },
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {product.name}
          </Typography>
        </Breadcrumbs>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Основная информация */}
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Галерея */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: 'relative' }}>
              <Paper sx={{
                width: '100%', height: { xs: 260, sm: 340, md: 500 },
                borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover',
                mb: { xs: 1.5, md: 2 }, position: 'relative',
              }}>
                {currentMedia?.mediaType === 'video' ? (
                  <>
                    <video
                      key="product-main-video"
                      src={currentMedia.urlPhoto}
                      controls playsInline preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', display: 'block' }}                    />
                    <Chip
                      icon={<PlayArrow sx={{ fontSize: 16 }} />}
                      label="Видео" size="small"
                      sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 700, pointerEvents: 'none', zIndex: 2 }}
                    />
                  </>
                ) : (
                  <img
                    src={currentMedia?.urlPhoto || '/placeholder-product.png'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
                    onClick={() => window.open(currentMedia.urlPhoto, '_blank')}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-product.png'; }}
                  />
                )}
              </Paper>

              {productMedia.length > 1 && (
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                  {productMedia.map((media, index) => (
                    <Box
                      key={`media-${index}`}
                      onClick={() => setSelectedMedia(index)}
                      sx={{
                        position: 'relative', width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 },
                        borderRadius: 1, overflow: 'hidden', cursor: 'pointer',
                        border: selectedMedia === index ? '2px solid' : '1px solid',
                        borderColor: selectedMedia === index ? 'primary.main' : 'divider',
                        opacity: selectedMedia === index ? 1 : 0.7, flexShrink: 0,
                      }}
                    >
                      {media.mediaType === 'video' ? (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', pointerEvents: 'none' }}>
                          <PlayArrow sx={{ fontSize: 28 }} />
                        </Box>
                      ) : (
                        <img src={media.urlPhoto} alt={`${product.name} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* Информация */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography
                variant="h3" component="h1" fontWeight="bold" gutterBottom color="text.primary"
                sx={{ wordBreak: 'break-word', fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }, lineHeight: 1.2 }}
              >
                {product.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {product.brand} {product.model && `• ${product.model}`}
              </Typography>

              {/* Цена */}
              <Box sx={{ mb: { xs: 2, md: 3 } }}>
                {product.discountPrice ? (
                  <>
                    <Typography variant="h4" color="error" fontWeight="bold">{formatPrice(product.discountPrice)}</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{formatPrice(product.price)}</Typography>
                    <Chip label={`Экономия ${formatPrice(product.price - product.discountPrice)}`} color="success" size="small" sx={{ mt: 1 }} />
                  </>
                ) : (
                  <Typography variant="h4" fontWeight="bold">{formatPrice(product.price)}</Typography>
                )}
              </Box>

              {/* Количество + кнопка */}
              <Box sx={{ mb: { xs: 3, md: 4 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' },
                    border: { xs: '1px solid', sm: 'none' }, borderColor: 'divider',
                    borderRadius: { xs: 1, sm: 0 }, py: { xs: 0.5, sm: 0 }, width: { xs: '100%', sm: 'auto' },
                  }}>
                    <IconButton onClick={() => handleCountProductChange('decrease')} disabled={countProduct <= 1} size="small"><Remove /></IconButton>
                    <Typography sx={{ mx: 2, minWidth: 40, textAlign: 'center', fontWeight: 600 }}>{countProduct}</Typography>
                    <IconButton onClick={() => handleCountProductChange('increase')} disabled={countProduct >= 10} size="small"><Add /></IconButton>
                  </Box>
                  <Button
                    variant="contained" size="large" fullWidth
                    startIcon={isAddingToCart ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                    disabled={!product.inStock || isAddingToCart}
                    onClick={handleAddToCart}
                    sx={{ height: { xs: 48, md: 56 } }}
                  >
                    {product.inStock ? (isAddingToCart ? 'Добавление...' : 'Добавить в корзину') : 'Нет в наличии'}
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Verified sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">Гарантия {product.warranty} месяцев</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">{product.delivery.join(' • ')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">Оплата картой, наличными, рассрочка</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Табы */}
        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                minWidth: { xs: 'auto', md: 120 },
                px: { xs: 1.5, md: 2 },
                textTransform: 'none',
              },
              '& .Mui-selected': { color: 'primary.main', fontWeight: 600 },
              '& .MuiTabs-flexContainer': {
                justifyContent: { xs: 'flex-start', md: 'center' },
              },
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': { opacity: 0.3 },
              },
            }}
          >
            <Tab label="Характеристики" />
            <Tab label="Описание" />
            <Tab label="Отзывы" />
            <Tab label="Доставка и оплата" />
          </Tabs>

          <Box sx={{ py: { xs: 2, md: 3 } }}>
            {/* Характеристики */}
            {tabValue === 0 && (
              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">Характеристики</Typography>
                <Divider sx={{ mb: 2 }} />
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <Typography key={`spec-${key}`} paragraph textAlign="left"><strong>{key}:</strong> {value}</Typography>
                  ))
                ) : (
                  <Alert severity="info">Характеристики не указаны</Alert>
                )}
              </Paper>
            )}

            {/* Описание */}
            {tabValue === 1 && (
              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">Подробное описание</Typography>
                <Divider sx={{ mb: 2 }} />
                {product.fullDescription ? (
                  <Typography paragraph sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }} textAlign="left">{product.fullDescription}</Typography>
                ) : (
                  <Alert severity="info">Описание не указано</Alert>
                )}
              </Paper>
            )}

            {/* Отзывы */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 0 }, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Отзывы покупателей {reviews.length > 0 && `(${reviews.length})`}
                  </Typography>
                  <Button
                    variant="contained" startIcon={<Star />} size="small"
                    onClick={() => {
                      if (!localStorage.getItem('user')) {
                        setNotification({ open: true, message: 'Войдите, чтобы оставить отзыв', severity: 'info' });
                        return;
                      }
                      setReviewDialogeOpen(true);
                    }}
                  >
                    Написать отзыв
                  </Button>
                </Box>

                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : reviews.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <StarBorder sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>Отзывов пока нет</Typography>
                    <Typography variant="body2" color="text.disabled">Будьте первым!</Typography>
                  </Paper>
                ) : (
                  <Stack spacing={{ xs: 1.5, md: 2 }}>
                    {reviews.map((review) => (
                      <Paper
                        key={review.reviewId}
                        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, position: 'relative', border: '1px solid', borderColor: 'divider' }}
                      >
                        {/* Удалить отзыв */}
                        {canDeleteReview(review) && (
                          <IconButton
                            size="small" color="error"
                            onClick={() => { setReviewToDelete(review); setReviewDeleteDialogeOpen(true); }}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}

                        {/* Шапка */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ minWidth: 0, pr: 4 }}>
                            <Typography variant="subtitle1" fontWeight="medium" noWrap>{review.userName || 'Пользователь'}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.cntStars} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">{formatDate(review.createdDate)}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Текст */}
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{review.description}</Typography>

                        {/* Фото/видео отзыва */}
                        {review.photos && review.photos.length > 0 && (
                          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                            {review.photos.map(photo => {
                              const url = photo.urlPhoto.startsWith('http') ? photo.urlPhoto : `https://localhost:7165${photo.urlPhoto}`;
                              return (
                                <Box
                                  key={photo.photosReviewId}
                                  sx={{ position: 'relative', aspectRatio: '1', borderRadius: 1.5, overflow: 'hidden', bgcolor: '#000', cursor: 'pointer' }}
                                  onClick={() => window.open(url, '_blank')}
                                >
                                  {photo.mediaType === 'video' ? (
                                    <>
                                      <video src={url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', pointerEvents: 'none' }}>
                                        <PlayArrow sx={{ fontSize: 32 }} />
                                      </Box>
                                    </>
                                  ) : (
                                    <img src={url} alt="Фото отзыва" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        )}

                        {/* Кнопка ответов */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                          <Button
                            size="small"
                            startIcon={openReplies[review.reviewId] ? <ExpandLess /> : <ExpandMore />}
                            onClick={() => handleToggleReplies(review.reviewId)}
                            sx={{ color: 'text.secondary', fontSize: 12, textTransform: 'none' }}
                          >
                            Ответы ({repliesByReview[review.reviewId]?.length || 0})
                          </Button>
                        </Stack>

                        {/* Блок ответов */}
                        <Collapse in={openReplies[review.reviewId] === true}>
                          <Box sx={{ mt: 1.5 }}>
                            {/* Форма нового ответа на отзыв */}
                            {currentUser && (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12, flexShrink: 0 }}>
                                  {(currentUser.fullName || 'U')[0].toUpperCase()}
                                </Avatar>
                                <TextField
                                  fullWidth size="small" multiline maxRows={4}
                                  placeholder="Написать ответ..."
                                  value={replyTextByReview[review.reviewId] || ''}
                                  onChange={e => setReplyTextByReview(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                                  inputProps={{ maxLength: 2000 }}
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSubmitReply(review.reviewId)}
                                  disabled={!replyTextByReview[review.reviewId]?.trim() || submittingReplyByReview[review.reviewId]}
                                  size="small"
                                >
                                  {submittingReplyByReview[review.reviewId]
                                    ? <CircularProgress size={18} />
                                    : <Send fontSize="small" />}
                                </IconButton>
                              </Box>
                            )}

                            {/* Дерево ответов */}
                            {replyLoadingByReview[review.reviewId] ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={20} />
                              </Box>
                            ) : (repliesByReview[review.reviewId]?.length || 0) > 0 ? (
                              <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                <Stack spacing={1.5}>
                                  {buildReplyTree(repliesByReview[review.reviewId]).map(rootReply => (
                                    <ReplyItem
                                      key={rootReply.replyId}
                                      reply={rootReply}
                                      currentUserId={currentUserId}
                                      isManagerUser={isManagerUser}
                                      onReply={(parentId) => {
                                        setReplyToReplyId(prev => prev === parentId ? null : parentId);
                                        setNestedReplyText('');
                                      }}
                                      onDelete={(replyId) => handleDeleteReply(review.reviewId, replyId)}
                                      openReplyForm={replyToReplyId}
                                      nestedReplyText={nestedReplyText}
                                      onNestedReplyTextChange={setNestedReplyText}
                                      onSubmitNested={(parentId) => handleSubmitReply(review.reviewId, parentId)}
                                      submittingNested={submittingNested}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.disabled" sx={{ pl: 2 }}>
                                Пока нет ответов
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {/* Диалог отзыва */}
                <Dialog open={reviewDialogeOpen} onClose={() => setReviewDialogeOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Написать отзыв</DialogTitle>
                  <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">Ваша оценка</Typography>
                        <Rating
                          value={newReview.cntStars}
                          onChange={(_, v) => setNewReview(prev => ({ ...prev, cntStars: v || 5 }))}
                          size="large"
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Фото/видео</Typography>
                        <input
                          ref={reviewFileRef} type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                          multiple style={{ display: 'none' }}
                          onChange={handleReviewFiles}
                        />
                        <Button
                          size="small" variant="outlined" startIcon={<AttachFile />}
                          onClick={() => reviewFileRef.current?.click()}
                          disabled={reviewFiles.length >= 5}
                          sx={{ mb: 1.5 }}
                        >
                          Прикрепить файл
                        </Button>

                        {reviewFiles.length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {reviewFiles.map((file, i) => (
                              <Box key={i} sx={{ position: 'relative' }}>
                                {file.type.startsWith('video') ? (
                                  <Box sx={{ width: 72, height: 72, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
                                    <VideoFile sx={{ color: 'text.disabled' }} />
                                  </Box>
                                ) : (
                                  <Box component="img" src={URL.createObjectURL(file)} sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                                )}
                                <IconButton
                                  size="small"
                                  onClick={() => setReviewFiles(prev => prev.filter((_, j) => j !== i))}
                                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', width: 18, height: 18 }}
                                >
                                  <Close sx={{ fontSize: 12 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      <TextField
                        fullWidth label="Ваш отзыв" multiline rows={4}
                        value={newReview.description}
                        onChange={e => setNewReview(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Поделитесь вашим опытом..."
                        inputProps={{ maxLength: 1000 }}
                        helperText={`${newReview.description.length}/1000`}
                        size="small"
                      />
                    </Stack>
                  </DialogContent>
                  <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setReviewDialogeOpen(false)} color="inherit">Отмена</Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitReview}
                      disabled={!newReview.description.trim() || submittingReview}
                      startIcon={submittingReview ? <CircularProgress size={18} /> : <Send />}
                    >
                      Отправить
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {/* Доставка и оплата */}
            {tabValue === 3 && (
              <Stack spacing={2}>
                <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">Доставка</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocalShipping sx={{ mr: 2, color: 'primary.main', mt: 0.25 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">Курьерская доставка</Typography>
                        <Typography variant="body2" color="text.secondary">На следующий день при заказе до 18:00</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocalShipping sx={{ mr: 2, color: 'primary.main', mt: 0.25 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">Самовывоз</Typography>
                        <Typography variant="body2" color="text.secondary">Бесплатно из любого магазина</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">Оплата</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>Банковской картой онлайн или при получении</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Security sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>Наличными курьеру или в пункте выдачи</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Box>
        </Box>

        {/* Преимущества магазина */}
        <Box sx={{ mt: { xs: 4, md: 6 }, p: { xs: 2, md: 3 }, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[
              { icon: <Security />, title: 'Гарантия качества', desc: 'Все товары сертифицированы' },
              { icon: <LocalShipping />, title: 'Быстрая доставка', desc: 'По всей России' },
              { icon: <Support />, title: 'Поддержка 24/7', desc: 'Всегда готовы помочь' },
              { icon: <CreditCard />, title: 'Легкий возврат', desc: 'В течение 14 дней' },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, color: 'primary.main', display: 'flex' }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Диалог удаления отзыва */}
        <Dialog open={reviewDeleteDialogeOpen} onClose={() => setReviewDeleteDialogeOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Удалить отзыв?</DialogTitle>
          <DialogContent>
            <Typography>Вы уверены, что хотите удалить этот отзыв?</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setReviewDeleteDialogeOpen(false)}>Отмена</Button>
            <Button variant="contained" color="error" onClick={handleDeleteReview} disabled={deleteReviewLoading}>
              {deleteReviewLoading ? <CircularProgress size={20} /> : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Похожие товары */}
        {similarProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Похожие товары</Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {similarProducts.map((p: any) => (
                <Card
                  key={p.productId}
                  component={RouterLink}
                  to={`/products/${p.productId}`}
                  sx={{ minWidth: 200, flexShrink: 0, textDecoration: 'none', borderRadius: 2 }}
                >
                  <Box sx={{ height: 160, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={p.photos?.split(',')[0] ? `https://localhost:7165${p.photos.split(',')[0].trim()}` : '/placeholder-product.png'}
                      alt={p.name}
                      style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                    />
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">{formatPrice(p.price)}</Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductPage;