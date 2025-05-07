import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

function PriceHistoryChart({ bids }) {
  const data =
    bids?.map((bid) => ({
      time: new Date(bid.createdAt).getTime(),
      amount: bid.amount,
      bidder: bid.bidder && bid.bidder.username ? bid.bidder.username : bid.user && bid.user.username ? bid.user.username : `User #${bid.bidderId}`,
    })) || [];

  const formatXAxis = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatYAxis = (value) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">Time: {format(new Date(label), 'HH:mm:ss')}</Typography>
          <Typography variant="body2" color="primary">
            Amount: {payload[0].value.toLocaleString()} VND
          </Typography>
          <Typography variant="body2">Bidder: {payload[0].payload.bidder}</Typography>
        </Paper>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No bids yet
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Price History
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={formatXAxis} type="number" domain={['dataMin', 'dataMax']} />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default PriceHistoryChart;
