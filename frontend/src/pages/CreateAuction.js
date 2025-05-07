import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Container, Paper, Typography, TextField, Button, Grid, MenuItem, CircularProgress } from '@mui/material';
import { createAuction } from '../redux/slices/auctionSlice';
import ImageUpload from '../components/ImageUpload';
import api from '../services/api';

const categories = ['ELECTRONICS', 'FASHION', 'HOME', 'SPORTS', 'OTHER'];
const conditions = ['NEW', 'USED', 'REFURBISHED'];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  startingPrice: Yup.number().required('Starting price is required').positive('Starting price must be positive'),
  minimumBidIncrement: Yup.number().required('Minimum bid increment is required').positive('Minimum bid increment must be positive'),
  startTime: Yup.date().required('Start time is required').min(new Date(), 'Start time must be in the future'),
  endTime: Yup.date().required('End time is required').min(Yup.ref('startTime'), 'End time must be after start time'),
  category: Yup.string().required('Category is required'),
  condition: Yup.string().required('Condition is required'),
});

function formatDateLocal(date) {
  // Đảm bảo date là object Date
  if (!(date instanceof Date)) date = new Date(date);
  // Lấy từng thành phần
  const pad = (n) => n.toString().padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

function CreateAuction() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auction);
  const [images, setImages] = useState([]);

  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Chuyển đổi startTime, endTime sang ISO string
    const auctionData = {
      ...values,
      startTime: formatDateLocal(values.startTime),
      endTime: formatDateLocal(values.endTime),
    };
    delete auctionData.sellerId;

    // Thêm trường auction
    formData.append('auction', JSON.stringify(auctionData));

    // Kiểm tra và thêm ảnh
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    images.forEach((image, idx) => {
      console.log(image, image.type, image.name);
      if (!(image instanceof File)) {
        console.error(`Image at index ${idx} is not a File object`, image);
        return;
      }
      if (!allowedTypes.includes(image.type)) {
        alert(`File ${image.name} không phải là ảnh hợp lệ (jpg, jpeg, png)!`);
        return;
      }
      formData.append('images', image);
      console.log(`Appended image: ${image.name}, type: ${image.type}, size: ${image.size}`);
    });

    // Gửi request (dùng redux-thunk hoặc axios trực tiếp)
    const result = await api.post('/auctions', formData);
    if (!result.error) {
      navigate('/auctions');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Auction
        </Typography>

        <Formik
          initialValues={{
            title: '',
            description: '',
            startingPrice: '',
            minimumBidIncrement: '',
            startTime: '',
            endTime: '',
            category: '',
            condition: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="title"
                    label="Title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="startingPrice"
                    label="Starting Price"
                    value={values.startingPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.startingPrice && Boolean(errors.startingPrice)}
                    helperText={touched.startingPrice && errors.startingPrice}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="minimumBidIncrement"
                    label="Minimum Bid Increment"
                    value={values.minimumBidIncrement}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.minimumBidIncrement && Boolean(errors.minimumBidIncrement)}
                    helperText={touched.minimumBidIncrement && errors.minimumBidIncrement}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    name="startTime"
                    label="Start Time"
                    value={values.startTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.startTime && Boolean(errors.startTime)}
                    helperText={touched.startTime && errors.startTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    name="endTime"
                    label="End Time"
                    value={values.endTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.endTime && Boolean(errors.endTime)}
                    helperText={touched.endTime && errors.endTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="category"
                    label="Category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="condition"
                    label="Condition"
                    value={values.condition}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.condition && Boolean(errors.condition)}
                    helperText={touched.condition && errors.condition}
                  >
                    {conditions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Upload Images
                  </Typography>
                  <ImageUpload images={images} onImagesChange={setImages} maxFiles={5} />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Auction'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

export default CreateAuction;
