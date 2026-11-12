import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, InputAdornment, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material';
import {
  ArrowBack, Add, Edit, Delete, Search, Refresh, Close,
} from '@mui/icons-material';

interface ParentCategory
{
    parentCategoryId: number;
    name:string;
    children: Category[];
}

interface Category
{
    categoryId: number;
    name:string;
    brandId:number;
    parentCategoryId: number;
    parentCategory: ParentCategory;
}

interface Brand
{
    brandId: number;
    name:string;
}



const TABS = ['parent', 'children'] as const;
type TabType = typeof TABS[number];

const CategoriesManagementPage = () => 
{
    const navigate = useNavigate();

    const[activeTab, setActiveTab] = useState<TabType>('parent');
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState("");
    const[success, setSuccess] = useState("");
    const[search, setSearch] = useState("");

    const[parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const[childrenCategories, setChildrenCategories] = useState<Category[]>([]);
    const[brands, setBrands] = useState<Brand[]>([]);

    const[dialogOpen, setDialogOpen] = useState(false);
    const[dialogMode, setDialogMode] = useState<'create' | 'edit'>("create");
    const[editingItem, setEditingItem] = useState<any>(null);
    const[formName, setFormName] = useState('');
    const[formBrand, setFormBrand] = useState('');
    const [formParentId, setFormParentId] = useState<string>('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');


    const[deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const[itemToDelete, setItemToDelete] = useState<any>(null);
    const[deleteLoading, setDeleteLoading] = useState(false);


    const fetchParentsCategories = async() =>{
        try
        {
            const response = await fetch("/api/Categories/parents");
            if(response.ok)
            {
                const data = await response.json()
                console.log('Родительские категории:', data);
                setParentCategories(Array.isArray(data) ? data : []);
            } 
        }
        catch
        {
            console.error('Ошибка загрузки родительских категорий');
        }
    }

    const fetchChildrenCategories = async() =>{
        try
        {
            const response = await fetch("/api/Categories");
            if(response.ok) 
            {
                const data = await response.json();
                console.log('Категории с сервера:', data);
                setChildrenCategories(Array.isArray(data) ? data : []); 
            }
        }
        catch
        {
            console.error('Ошибка загрузки категорий');
        }
    }


    const fetchBrands = async() => {
        try
        {
            const response = await fetch("/api/Brands");
            if(response.ok) setBrands(await response.json());
        }
        catch
        {
            console.error('Ошибка загрузки брендов');
        }
    }

    const loadData = async()=>
    {
        setLoading(true);
        await Promise.all([fetchParentsCategories(), fetchChildrenCategories(), fetchBrands()]);
        setLoading(false);
    };

    useEffect(()=>{
        loadData();
    }, []);

    const openCreateParentCategory = () =>{
        setDialogMode("create");
        setEditingItem(null);
        setFormName("");
        setFormParentId("");
        setFormError("");
        setDialogOpen(true);
    }

    const openEditParentCategory = (parent:ParentCategory) =>{
        setDialogMode("edit");
        setEditingItem(parent);
        setFormName(parent.name);
        setFormParentId("");
        setFormError("");
        setDialogOpen(true);
    }

    const openCreateChildrenCategory = () =>{
        setDialogMode("create");
        setEditingItem(null);
        setFormName("");
        setFormParentId("");
        setFormError("");
        setDialogOpen(true);
    }


    const openEditChildrenCategory = (children:Category) =>{
        setDialogMode("edit");
        setEditingItem(children);
        setFormName(children.name);
        setFormBrand(String(children.brandId || ''));
        setFormParentId(String(children.parentCategoryId));
        setFormError("");
        setDialogOpen(true);
    }


    const handleSave = async () =>
    {
        setFormLoading(true);
        setFormError("");

        try
        {
            if(activeTab==="parent")
            {
                const body = {Name:formName, Products: [], ParentCategory: null};
                const url = dialogMode ==="create" ? '/api/ParentCategories' : `/api/ParentCategories/${editingItem.parentCategoryId}`
                const method  = dialogMode==="create" ? "POST" : "PUT";
                
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dialogMode === 'edit' ? { ...body, ParentCategoryId: editingItem.parentCategoryId } : body),
                });

                if(!response.ok) 
                {
                    console.error('Ответ сервера:', await response.text());
                    throw new Error("Ошибка сохранения");
                }
            }
            else
            {
                const body = {
                    Name:formName,
                    BrandId:Number(formBrand),
                    ParentCategoryId:Number(formParentId),
                    Products: []
                };

                const url = dialogMode ==="create" ? '/api/Categories' : `/api/Categories/${editingItem.categoryId}`
                const method  = dialogMode==="create" ? "POST" : "PUT";

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dialogMode === 'edit' ? { ...body, CategoryId: editingItem.CategoryId } : body),
                });

                if(!response.ok) 
                {
                    console.error('Ответ сервера:', await response.text());
                    throw new Error("Ошибка сохранения");
                }
            }


            setSuccess(activeTab==="parent" ? 'Родительская категория сохранена' : 'Категория сохранена');
            setDialogOpen(false);
            loadData();
        }
        catch(e:any)
        {
            setFormError(e.message);
        }
        finally
        {
            setFormLoading(false);
        }
    }




    const confirmDelete = async(item:any)=>
    {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    }

    const handleDelete = async()=>
    {
        if(!itemToDelete) return;
        setDeleteLoading(true);

        try
        {
            const isParent = activeTab==="parent";
            const id = isParent ? itemToDelete.parentCategoryId : itemToDelete.categoryId;
            const url = isParent ? `/api/ParentCategories/${id}` : `/api/Categories/${id}`;
            const response = await fetch(url, {method: "DELETE"});
            if(!response.ok) throw new Error("Ошибка удаления");
            setSuccess(isParent ? 'Родительская категория удалена' : 'Категория удалена');
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
        catch(e:any)
        {
            setError(e.message);
        }
        finally
        {
            setDeleteLoading(false);
        }
    };


    const filteredParents = parentCategories.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
    
    const filteredChildren = childrenCategories.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))

    
    return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 2 }}>Назад</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Управление категориями</Typography>
        <Button variant="contained" startIcon={<Add />}
          onClick={activeTab === 'parent' ? openCreateParentCategory : openCreateChildrenCategory}
          color='primary'>
          Добавить {activeTab === 'parent' ? 'род. категорию' : 'категорию'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Вкладки */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab value="parent" label={`Родительские категории (${parentCategories.length})`} />
        <Tab value="children" label={`Категории (${childrenCategories.length})`} />
      </Tabs>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField size="small" placeholder="Поиск..." value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton></InputAdornment> : null,
          }}
        />
        <Tooltip title="Обновить"><IconButton onClick={loadData}><Refresh /></IconButton></Tooltip>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Название</b></TableCell>
              {activeTab === 'children' && <TableCell><b>Род. категория</b></TableCell>}
              <TableCell align="right"><b>Действия</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={activeTab === 'children' ? 4 : 3} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
            ) : activeTab === 'parent' ? (
              filteredParents.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>Нет родительских категорий</TableCell></TableRow>
              ) : filteredParents.map(pc => (
                <TableRow key={pc.parentCategoryId} hover>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>#{pc.parentCategoryId}</TableCell>
                  <TableCell>
                    <Chip label={pc.name} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать"><IconButton size="small" onClick={() => openEditParentCategory(pc)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Удалить"><IconButton size="small" color="error" onClick={() => confirmDelete(pc)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredChildren.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>Нет категорий</TableCell></TableRow>
              ) : filteredChildren.map(c => (
                <TableRow key={c.categoryId} hover>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>#{c.categoryId}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    {parentCategories.find(p => p.parentCategoryId === c.parentCategoryId)?.name || '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать"><IconButton size="small" onClick={() => openEditChildrenCategory(c)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Удалить"><IconButton size="small" color="error" onClick={() => confirmDelete(c)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Создать' : 'Редактировать'} {activeTab === 'parent' ? 'род. категорию' : 'категорию'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField label="Название" value={formName}
            onChange={e => setFormName(e.target.value)} fullWidth />

          {activeTab === 'children' && (
          <>
            <FormControl fullWidth>
              <InputLabel>Родительская категория</InputLabel>
              <Select value={formParentId} label="Родительская категория"
                onChange={e => setFormParentId(e.target.value)}>
                <MenuItem value="">— Не выбрана —</MenuItem>
                {parentCategories.map(pc => (
                  <MenuItem key={pc.parentCategoryId} value={pc.parentCategoryId}>{pc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Бренд</InputLabel>
              <Select value={formBrand} label="Брэнд"
                onChange={e => setFormBrand(e.target.value)}>
                <MenuItem value="">— Не выбран —</MenuItem>
                {brands.map(b => (
                  <MenuItem key={b.brandId} value={b.brandId}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            </>
          )}
        </DialogContent>


        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={formLoading || !formName.trim()} color='primary'>
            {formLoading ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Удалить категорию?</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить <b>{itemToDelete?.name}</b>?</Typography>
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

export default CategoriesManagementPage