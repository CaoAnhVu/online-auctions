import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Fade, Stack, Grid, Card, CardMedia, CardContent, TextField, InputAdornment, IconButton, Skeleton } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedAuctions } from '../redux/slices/auctionSlice';
import thumbnail from '../assets/images/thumbnail.png';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { featuredAuctions = [], loading = false } = useSelector((state) => state.auction) || {};

  useEffect(() => {
    dispatch(fetchFeaturedAuctions());
  }, [dispatch]);

  // Format time left
  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Đã kết thúc';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return 'Sắp kết thúc';
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  return (
    <Fade in timeout={700}>
      <Box sx={{ minHeight: '100vh', maxWidth: '2xl' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            py: { xs: 8, md: 10 },
            mb: 8,
            borderRadius: 6,
            boxShadow: 6,
            maxWidth: 'xl',
            mx: 'auto',
            px: { xs: 2, md: 6 },
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" gutterBottom fontWeight={700} sx={{ fontSize: { xs: 32, md: 48 } }}>
                  Đấu Giá Trực Tuyến
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, fontSize: { xs: 18, md: 24 } }}>
                  Nền tảng đấu giá hiện đại, minh bạch và an toàn.
                  <br />
                  Tham gia mua bán, đấu giá sản phẩm mọi lúc, mọi nơi.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      fontWeight: 600,
                      fontSize: 18,
                      px: 4,
                    }}
                  >
                    Đăng ký ngay
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'grey.100',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                      fontWeight: 600,
                      fontSize: 18,
                      px: 4,
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={thumbnail}
                  alt="Auction Illustration"
                  sx={{
                    width: { xs: '80%', md: '90%' },
                    maxWidth: 480,
                    borderRadius: 6,
                    boxShadow: 4,
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Search Section */}
        <Container maxWidth="md" sx={{ mb: 6 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm sản phẩm đấu giá..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button variant="contained" color="primary">
                    Tìm kiếm
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                boxShadow: 2,
              },
            }}
          />
        </Container>

        {/* Stats Section */}
        <Container maxWidth="lg" sx={{ mb: 6 }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                }}
              >
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" gutterBottom fontWeight={700}>
                  10,000+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Người dùng đang hoạt động
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                }}
              >
                <GavelIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" gutterBottom fontWeight={700}>
                  5,000+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cuộc đấu giá thành công
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                }}
              >
                <MonetizationOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" gutterBottom fontWeight={700}>
                  50 tỷ+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Giá trị giao dịch
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Featured Auctions Section */}
        <Container maxWidth="xl" sx={{ mb: 8, pt: 4, pb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ mb: 4, textAlign: 'center', letterSpacing: 1 }}>
            Đấu Giá Nổi Bật
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {loading ? (
              Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : featuredAuctions.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  Chưa có đấu giá nổi bật.
                </Typography>
              </Grid>
            ) : (
              featuredAuctions.map((auction) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    <CardMedia component="img" height="200" image={auction.images?.[0]?.url || '../assets/images/no_image.png'} alt={auction.title} />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {auction.title}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <MonetizationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {formatPrice(auction.currentPrice)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {auction.bidCount} lượt đặt giá
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <span role="img" aria-label="views">
                            👁️
                          </span>{' '}
                          {auction.viewCount || 0} lượt xem
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color={new Date(auction.endTime) < new Date() ? 'error' : 'warning.main'} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimerIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {formatTimeLeft(auction.endTime)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/auctions')} sx={{ fontWeight: 600 }}>
              Xem tất cả đấu giá
            </Button>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default HomePage;
