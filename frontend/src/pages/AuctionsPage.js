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
  CardMedia,
  CardActions,
  Chip,
  Pagination,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchAuctions } from '../redux/slices/auctionSlice';
import { format } from 'date-fns';
import defaultAuctionImg from '../assets/images/no_image.png';

function parseDate(date) {
  if (!date) return null;
  if (typeof date === 'string') return new Date(date);
  if (Array.isArray(date)) {
    // [year, month, day, hour, minute, ...]
    // Lưu ý: Tháng trong JS Date là 0-based!
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  return new Date(date);
}

function truncate(str, n) {
  if (str && str.length > n) {
    return str.slice(0, n - 1) + '...';
  }
  return str;
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
                  <MenuItem value="endTime">End Time</MenuItem>
                  <MenuItem value="currentPrice">Current Price</MenuItem>
                  <MenuItem value="createdAt">Created Date</MenuItem>
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
                    <Card>
                      <CardMedia component="img" height="200" image={imgSrc} alt={auction.title} />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {truncate(auction.title, 40)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {truncate(auction.description, 80)}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {auction.currentPrice.toLocaleString()} VND
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          End Time: {auction.endTime && !isNaN(parseDate(auction.endTime)) ? format(parseDate(auction.endTime), 'PPpp') : 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip label={auction.status} color={getStatusColor(auction.status)} size="small" />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/auctions/${auction.id}`)}>
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
