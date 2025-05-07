import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import { getUserBids } from '../redux/slices/bidSlice';

function MyBidsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bids, loading } = useSelector((state) => state.bid);

  useEffect(() => {
    dispatch(getUserBids());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ENDED':
        return 'error';
      case 'PENDING_PAYMENT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewAuction = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  const handleMakePayment = (orderCode) => {
    navigate(`/payment/${orderCode}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <GavelIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4">My Bids</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Auction</TableCell>
              <TableCell>My Bid</TableCell>
              <TableCell>Current Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids?.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell>
                  <Typography variant="body2">{bid.auction.title}</Typography>
                </TableCell>
                <TableCell>{bid.amount.toLocaleString()} VND</TableCell>
                <TableCell>{bid.auction.currentPrice.toLocaleString()} VND</TableCell>
                <TableCell>
                  <Chip label={bid.auction.status} color={getStatusColor(bid.auction.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(bid.auction.endTime).toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => handleViewAuction(bid.auction.id)}>
                      View
                    </Button>
                    {bid.auction.status === 'ENDED' && bid.isWinning && !bid.paymentOrder && (
                      <Button variant="contained" size="small" color="primary" onClick={() => handleMakePayment(bid.orderCode)}>
                        Pay Now
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default MyBidsPage;
