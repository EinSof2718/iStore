import { useNavigate } from 'react-router-dom';
import {Container, Box, Typography, Button, Stack, Paper,} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

const NotFoundPage =()=>
{
    const navigate = useNavigate();

    return(
        <Box sx={{minHeght:"100vh", display:"flex", alignItems:'center', justifyContent:'center', bgcolor:"background.default", py:4, position:"relative", overflow:"hidden"}}>
            <Box sx={{position: 'absolute', inset: 0, backgroundImage: `liner-gradient(rgba(108,99,255,0.05), 1px, transparent 1px), liner-gradient(90deg, rgba(108,99,255,0.05), 1px, transparent 1px)`, backgroundSize:'40px 40px', positionEvents:'none'}}/>
            <Container maxWidth = "md" sx={{position:'relative', zIndex: 1}}>
                <Box sx={{textAlign:'center'}}>
                    <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y:0}} transition={{duration:0.6}}>
                        <Box sx={{display:'inline-block', position:'relative', mb:3}}>
                                <Box sx={{fontSize: { xs: 100, md: 140 }, animation: 'bounce 2s ease-in-out infinite', 
                                    '@keyframes bounce': {'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },'50%': { transform: 'translateY(-15px) rotate(-5deg)' },},
                                    filter: 'drop-shadow(0 10px 30px rgba(108,99,255,0.3))',}}
                                >👻</Box> 

                            <motion.div animate={{rotate:[0,15,-15,0], scale:[1,1.1,1]}} transition={{duration:3, repeat: Infinity, repeatType:'reverse'}} style={{position:'absolute', bottom:10, right:-10, fontSize:40}}>🔍</motion.div>
                        </Box>
                    </motion.div>

                    <Typography variant="h1" sx={{fontSize:{xs:'5rem', md:'8rem'}, fontWeight:900, lineHeignt:1, color:'text.primary', letterSpacing:'-0.05em', mb:1, textShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>404</Typography>

                    <Paper elevation={0} sx={{p:3,mb:4, borderRadius:4, bgcolor:'action.hover', maxWidth:500, mx:'auto'}}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{fontSize:{xs:'1.1rem', md:'1.25rem'}}}>Упс! Страница не найдена или не существует</Typography>
                    </Paper>

                    <Stack direction={{xs:'column', sm:'row'}} spacing={2} justifyContent="center">
                        <Button variant='contained' size="large" startIcon={<Home />} onClick={()=>navigate('/')} sx={{px:4, py:1.5, borderRadius:3, fontWeight:700, textTransform:'none', fontSize:'1rem'}}>На главную</Button>
                        <Button variant='outlined' size="large" startIcon={<ArrowBack />} onClick={()=>navigate('/catalog')} sx={{px:4, py:1.5, borderRadius:3, fontWeight:600, textTransform:'none', fontSize:'1rem'}}>В каталог</Button>
                    </Stack>

                    <Typography variant="caption" color='text.disabled' sx={{display:'block', mt:4}}>Код ошибки: 404 · Ресурс не найден</Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default NotFoundPage;