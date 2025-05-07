import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

function CountdownTimer({ endTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(differenceInSeconds(new Date(endTime), new Date()));

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd?.();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = differenceInSeconds(new Date(endTime), new Date());
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, timeLeft, onEnd]);

  if (timeLeft <= 0) {
    return (
      <Typography variant="body2" color="error">
        Auction ended
      </Typography>
    );
  }

  const duration = intervalToDuration({ start: 0, end: timeLeft * 1000 });
  const { days, hours, minutes, seconds } = duration;

  return (
    <Box>
      <Typography variant="body2" color={timeLeft < 3600 ? 'error' : 'primary'}>
        Time left: {days > 0 && `${days}d `}
        {hours > 0 && `${hours}h `}
        {minutes > 0 && `${minutes}m `}
        {`${seconds}s`}
      </Typography>
    </Box>
  );
}

export default CountdownTimer;
