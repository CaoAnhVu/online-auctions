import React from 'react';
import { Container, Typography, Box, Button, Fade, Stack } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <Fade in timeout={700}>
      <Container maxWidth="md" sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 3,
            p: { xs: 3, md: 6 },
            textAlign: 'center',
            mt: 8,
          }}
        >
          <GavelIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Online Auction System
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Đấu giá trực tuyến hiện đại, minh bạch và an toàn.
            <br />
            Tham gia mua bán, đấu giá sản phẩm mọi lúc, mọi nơi.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')} sx={{ fontWeight: 600 }}>
              Đăng ký ngay
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
              Đăng nhập
            </Button>
          </Stack>
        </Box>
      </Container>
    </Fade>
  );
};

export default HomePage;
