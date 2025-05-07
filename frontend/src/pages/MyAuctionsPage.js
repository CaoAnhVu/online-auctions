import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Chip, Stack } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import defaultAuctionImg from '../assets/images/no_image.png';
import api from '../services/api';

function MyAuctionsPage() {
  const [myAuctions, setMyAuctions] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    api
      .get('/auctions/mine', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyAuctions(res.data));
  }, [token]);

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <GavelIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4">My Auctions</Typography>
      </Box>
      <Grid container spacing={3}>
        {myAuctions.map((auction) => {
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    End Time: {auction.endTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created At: {auction.createdAt ? new Date(auction.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                    {auction.description}
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
                  <Button variant="outlined" size="small" href={`/auctions/${auction.id}`}>
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default MyAuctionsPage;
