import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchAuctionById, placeBid, deleteAuction } from '../redux/slices/auctionSlice';
import { format } from 'date-fns';
import CountdownTimer from '../components/CountdownTimer';
import PriceHistoryChart from '../components/PriceHistoryChart';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import websocketService from '../services/websocket';

const API_BASE_URL = 'http://localhost:8080';

// Helper: convert array [yyyy,MM,dd,HH,mm] hoặc string thành Date hoặc null
function parseDateTime(dt) {
  if (!dt) return null;
  if (Array.isArray(dt) && dt.length >= 5) {
    // Lưu ý: tháng trong JS là 0-based
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4]);
  }
  const d = new Date(dt);
  return isNaN(d) ? null : d;
}

function AuctionDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentAuction, loading, error } = useSelector((state) => state.auction);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [bidAmount, setBidAmount] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lastBidId, setLastBidId] = useState(null);

  console.log('AuctionDetailPage render', currentAuction);

  useEffect(() => {
    dispatch(fetchAuctionById(id));
  }, [dispatch, id]);

  // Subscribe websocket vào auctionId khi vào trang, unsubscribe khi rời trang
  useEffect(() => {
    let interval;
    function trySubscribe() {
      if (websocketService.client?.connected) {
        websocketService.subscribeToAuction(id);
        console.log('[AuctionDetailPage] Subscribed to auction:', id);
      } else {
        interval = setInterval(() => {
          if (websocketService.client?.connected) {
            websocketService.subscribeToAuction(id);
            console.log('[AuctionDetailPage] Subscribed to auction:', id);
            clearInterval(interval);
          }
        }, 500);
      }
    }
    trySubscribe();
    return () => {
      if (interval) clearInterval(interval);
      websocketService.unsubscribeFromAuction(id);
      console.log('[AuctionDetailPage] Unsubscribed from auction:', id);
    };
  }, [id]);

  // Theo dõi bid mới realtime để hiện toast
  useEffect(() => {
    if (currentAuction && currentAuction.bids && currentAuction.bids.length > 0) {
      const bids = currentAuction.bids;
      const latestBid = bids[bids.length - 1];
      const prevBid = bids.length > 1 ? bids[bids.length - 2] : null;

      // Log kiểm tra
      console.log('== Bid Debug ==');
      console.log('latestBid:', latestBid);
      console.log('prevBid:', prevBid);
      console.log('currentUser:', user);

      if (lastBidId && latestBid.id !== lastBidId) {
        // Người vừa đặt giá không nhận toast
        if (latestBid.bidderId === user?.id) {
          toast.success('Bid placed successfully!');
        } else if (prevBid && prevBid.bidderId === user?.id) {
          toast.warn('Bạn vừa bị vượt giá!');
        } else {
          toast.info(`Có người vừa đặt giá mới: ${latestBid.amount.toLocaleString()} VND!`);
        }
      }
      setLastBidId(latestBid.id);
    }
  }, [currentAuction, user, lastBidId]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || bidAmount <= currentAuction.currentPrice) {
      alert('Bid amount must be higher than current price');
      return;
    }
    try {
      await dispatch(placeBid({ auctionId: Number(id), amount: Number(bidAmount) }));
      setBidAmount('');
      // Không cần gọi fetchAuctionById vì WebSocket sẽ tự động cập nhật
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
    }
  };

  const handleAuctionEnd = () => {
    dispatch(fetchAuctionById(id));
  };

  const handleDeleteAuction = async () => {
    await dispatch(deleteAuction(id));
    setDeleteDialogOpen(false);
    navigate('/my-auctions');
  };

  const isAuctionEnded = currentAuction?.endTime && new Date(currentAuction.endTime) <= new Date();
  const isSellerUser = currentAuction?.seller?.id === user?.id;
  const minimumBid = currentAuction?.currentPrice + (currentAuction?.minimumBidIncrement || 0);
  console.log('currentPrice:', currentAuction?.currentPrice, 'minIncrement:', currentAuction?.minimumBidIncrement, 'minimumBid:', minimumBid);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentAuction) {
    return null;
  }

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column - Images and Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" gutterBottom>
                {currentAuction.title}
              </Typography>
              {isSellerUser && (
                <Box>
                  <Tooltip title="Edit Auction">
                    <IconButton onClick={() => navigate(`/edit-auction/${id}`)} color="primary" sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Auction">
                    <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Chip label={currentAuction.status} color={getStatusColor(currentAuction.status)} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Category: {currentAuction.category}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Condition: {currentAuction.condition}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                End Time: {parseDateTime(currentAuction.endTime) ? format(parseDateTime(currentAuction.endTime), 'PPpp') : 'N/A'}
              </Typography>
              {currentAuction.status === 'ACTIVE' && <CountdownTimer endTime={currentAuction.endTime} onEnd={handleAuctionEnd} />}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {currentAuction.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <Grid container spacing={2}>
              {currentAuction.images?.map((image, index) => {
                let imgSrc = '';
                if (image.imageUrl) {
                  imgSrc = image.imageUrl.startsWith('http') ? image.imageUrl : API_BASE_URL + image.imageUrl;
                } else if (image.url) {
                  imgSrc = image.url.startsWith('http') ? image.url : API_BASE_URL + image.url;
                }
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardMedia component="img" height="200" image={imgSrc} alt={`Auction image ${index + 1}`} sx={{ objectFit: 'cover' }} />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Price History
            </Typography>
            <PriceHistoryChart bids={currentAuction.bids} />
          </Paper>
        </Grid>

        {/* Right Column - Bidding Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Current Price
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {currentAuction.currentPrice.toLocaleString()} VND
            </Typography>

            {currentAuction.status === 'ACTIVE' && isAuthenticated && !isSellerUser && !isAuctionEnded && (
              <Box component="form" onSubmit={handlePlaceBid} sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Minimum bid: {minimumBid.toLocaleString()} VND
                </Typography>
                <TextField
                  key={currentAuction.currentPrice}
                  fullWidth
                  label="Your Bid (VND)"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  inputProps={{ min: minimumBid, step: '0.01' }}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ height: 48 }}>
                  {loading ? <CircularProgress size={24} /> : 'Place Bid'}
                </Button>
              </Box>
            )}

            {isAuctionEnded && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This auction has ended
                {currentAuction.winner && currentAuction.winner.username ? ` - Winner: ${currentAuction.winner.username}` : ' - Chưa có người thắng'}
              </Alert>
            )}

            {!isAuthenticated && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please login to place a bid
              </Alert>
            )}

            {isSellerUser && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You cannot bid on your own auction
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Bidding History
            </Typography>
            <List>
              {currentAuction.bids?.map((bid) => (
                <ListItem key={bid.id}>
                  <ListItemText
                    primary={`${bid.amount.toLocaleString()} VND`}
                    secondary={(bid.username ? bid.username : `User #${bid.bidderId}`) + ' - ' + (parseDateTime(bid.bidTime) ? format(parseDateTime(bid.bidTime), 'PPpp') : 'N/A')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Auction</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this auction? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAuction} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AuctionDetailPage;
