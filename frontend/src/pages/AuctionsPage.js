import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Pagination,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchAuctions } from '../redux/slices/auctionSlice';
import defaultAuctionImg from '../assets/images/no_image.png';

// Hàm định dạng ngày tháng
function formatDate(dateString) {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

function AuctionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auctions, loading, error, totalPages } = useSelector((state) => state.auction);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    status: '',
    sortBy: 'endTime',
    sortOrder: 'asc',
  });

  useEffect(() => {
    dispatch(fetchAuctions({ page: page - 1, ...searchParams }));
  }, [dispatch, page, searchParams]);

  useEffect(() => {
    if (auctions && auctions.length > 0) {
      console.log('First auction data:', auctions[0]);
      console.log('Created At:', auctions[0].createdAt);
      console.log('End Time:', auctions[0].endTime);
    }
  }, [auctions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchAuctions({ page: 0, ...searchParams }));
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      sortBy: 'endTime',
      sortOrder: 'asc',
    });
    setPage(1);
    dispatch(fetchAuctions({ page: 0 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ENDED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  console.log('auctions:', auctions);
  console.log('loading:', loading, 'error:', error);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Auctions
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={searchParams.category} label="Category" onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ELECTRONICS">Electronics</MenuItem>
                  <MenuItem value="FASHION">Fashion</MenuItem>
                  <MenuItem value="HOME">Home</MenuItem>
                  <MenuItem value="SPORTS">Sports</MenuItem>
                  <MenuItem value="VEHICLES">Vehicles</MenuItem>
                  <MenuItem value="COLLECTIBLES">Collectibles</MenuItem>
                  <MenuItem value="ART">Art</MenuItem>
                  <MenuItem value="BOOKS">Books</MenuItem>
                  <MenuItem value="TOYS">Toys</MenuItem>
                  <MenuItem value="MUSIC">Music</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth label="Min Price" type="number" value={searchParams.minPrice} onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth label="Max Price" type="number" value={searchParams.maxPrice} onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={searchParams.status} label="Status" onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="ENDED">Ended</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={searchParams.sortBy} label="Sort By" onChange={(e) => setSearchParams({ ...searchParams, sortBy: e.target.value })}>
                  <MenuItem value="startTime">Start Time</MenuItem>
                  <MenuItem value="endTime">End Time</MenuItem>
                  <MenuItem value="currentPrice">Current Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort Order</InputLabel>
                <Select value={searchParams.sortOrder} label="Sort Order" onChange={(e) => setSearchParams({ ...searchParams, sortOrder: e.target.value })}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button type="submit" variant="contained" fullWidth>
                Search
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {auctions?.map((auction) => {
                let imgSrc = defaultAuctionImg;
                if (auction.images && auction.images.length > 0) {
                  const firstImg = auction.images[0];
                  imgSrc = firstImg.imageUrl || firstImg.url || defaultAuctionImg;
                  if (imgSrc && !imgSrc.startsWith('http')) {
                    imgSrc = 'http://localhost:8080' + imgSrc;
                  }
                }
                return (
                  <Grid item xs={12} sm={6} md={4} key={auction.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ width: '100%', height: 180, overflow: 'hidden', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                        <img src={imgSrc} alt={auction.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Chip label={auction.status} color={getStatusColor(auction.status)} size="small" />
                        </Stack>
                        <Typography variant="h6" gutterBottom noWrap>
                          {auction.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Current Price:
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {auction.currentPrice.toLocaleString()} VND
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                          {auction.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Start Time: {formatDate(auction.startTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          End Time: {formatDate(auction.endTime)}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            👁️ {auction.viewCount || 0} views
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🏷️ {auction.bids ? auction.bids.length : 0} bids
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Seller: {auction.seller?.username || 'N/A'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ mt: 'auto' }}>
                        <Button variant="outlined" size="small" onClick={() => navigate(`/auctions/${auction.id}`)}>
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}

export default AuctionsPage;
