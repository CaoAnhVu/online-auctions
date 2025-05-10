import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Badge,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Menu,
  MenuItem,
  Grid,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout, getCurrentUser } from '../redux/slices/authSlice';
import { getNotifications } from '../redux/slices/notificationSlice';
import { getUserPayments } from '../redux/slices/paymentSlice';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GavelIcon from '@mui/icons-material/Gavel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { styled } from '@mui/material/styles';
import useTheme from '@mui/material/styles/useTheme';
import logo from '../assets/images/thumbnail.png';
import LoadingSpinner from '../components/LoadingSpinner';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import websocketService from '../services/websocket';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderRadius: '0 0 16px 16px',
  margin: 0,
  width: '100%',
  left: 0,
  right: 0,
  top: 0,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(8px)',
  background: 'rgba(25, 118, 210, 0.85)',
  position: 'sticky',
  zIndex: theme.zIndex.appBar,
}));

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  const { payments } = useSelector((state) => state.payment);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState(null);

  React.useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
    // Kết nối websocket khi có token
    if (token) {
      websocketService.connect(token);
    }
  }, [token, user, dispatch]);

  React.useEffect(() => {
    if (user && user.username && !user.roles?.includes('ROLE_ADMIN') && location.pathname !== '/login') {
      dispatch(getNotifications());
      dispatch(getUserPayments());
    }
  }, [dispatch, user, location.pathname]);

  // Tính tổng số thông báo chưa đọc
  const unreadGeneral = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;
  const unreadPayments = payments?.filter((p) => p.status === 'PENDING' && !p.notified).length || 0;
  const unreadNotifications = unreadGeneral + unreadPayments;

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Auctions', icon: <GavelIcon />, path: '/auctions' },
    { text: 'Create Auction', icon: <AddCircleOutlineIcon />, path: '/create-auction' },
    { text: 'My Auctions', icon: <ListAltIcon />, path: '/my-auctions' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'My Bids', icon: <GavelIcon />, path: '/my-bids' },
    { text: 'Payment History', icon: <HistoryIcon />, path: '/payment/history' },
  ];

  const renderMenuButtons = () =>
    menuItems.map((item) => (
      <Button
        key={item.text}
        color="inherit"
        startIcon={
          item.badge ? (
            <Badge badgeContent={item.badge} color="error">
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )
        }
        onClick={() => navigate(item.path)}
        sx={{ fontWeight: 600, borderRadius: 2, bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent', mx: 0.5 }}
      >
        {item.text}
      </Button>
    ));

  const renderDrawerMenu = () => (
    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: 250, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src={logo} alt="logo" style={{ width: 60, height: 60 }} />
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                setDrawerOpen(false);
                navigate(item.path);
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  if (token && !user) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)', overflowX: 'hidden' }}>
      <StyledAppBar position="sticky" elevation={6}>
        <Toolbar sx={{ minHeight: 72 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src={logo} alt="logo" style={{ width: 44, height: 44, marginRight: 12 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              Online Auctions
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {!isMobile && user && (
            <Fade in timeout={400}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {renderMenuButtons().filter((btn) => !btn.key || btn.key !== 'Profile')}
                {/* Notification tổng hợp */}
                <IconButton color="inherit" onClick={handleNotifClick} sx={{ position: 'relative' }}>
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                {/* Menu notification */}
                <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifClose} PaperProps={{ sx: { width: 350, maxHeight: 500 } }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">Notifications</Typography>
                  </Box>
                  {/* Thông báo hệ thống */}
                  {notifications?.length === 0 && payments?.length === 0 ? (
                    <MenuItem>
                      <Typography variant="body2" color="text.secondary">
                        No notifications
                      </Typography>
                    </MenuItem>
                  ) : (
                    <>
                      {notifications?.map((notification) => (
                        <MenuItem key={notification.id} onClick={handleNotifClose} sx={{ alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" fontWeight={notification.read ? 400 : 700}>
                              {notification.title || 'Notification'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                      {/* Thông báo thanh toán */}
                      {payments?.map((payment) => (
                        <MenuItem key={payment.orderCode} onClick={handleNotifClose} sx={{ alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" fontWeight={payment.status === 'PENDING' && !payment.notified ? 700 : 400}>
                              Payment: {payment.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Order {payment.orderCode} - {payment.amount?.toLocaleString()} VND
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(payment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                      <Divider />
                      <MenuItem
                        onClick={() => {
                          handleNotifClose();
                          navigate('/notifications');
                        }}
                        sx={{ justifyContent: 'center', fontWeight: 600 }}
                      >
                        View all notifications
                      </MenuItem>
                    </>
                  )}
                </Menu>
                {/* End notification tổng hợp */}
                <Button color="inherit" sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none', mx: 0.5 }} onClick={() => navigate('/profile')}>
                  Hi, {user.username}
                </Button>
                <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={handleLogout} sx={{ fontWeight: 600, borderRadius: 2, ml: 1 }}>
                  Logout
                </Button>
              </Box>
            </Fade>
          )}
        </Toolbar>
      </StyledAppBar>
      {isMobile && renderDrawerMenu()}
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Fade in timeout={500}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 6,
          bgcolor: 'background.paper',
          boxShadow: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <img src={logo} alt="logo" style={{ width: 40, height: 40, marginRight: 12 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Online Auctions
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: { xs: 'center', sm: 'left' } }}>
                  Nền tảng đấu giá trực tuyến hiện đại, minh bạch và an toàn. Tham gia mua bán, đấu giá sản phẩm mọi lúc, mọi nơi.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary" size="small">
                    <FacebookIcon />
                  </IconButton>
                  <IconButton color="primary" size="small">
                    <TwitterIcon />
                  </IconButton>
                  <IconButton color="primary" size="small">
                    <InstagramIcon />
                  </IconButton>
                  <IconButton color="primary" size="small">
                    <LinkedInIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: { xs: 'center', sm: 'left' } }}>
                Liên kết nhanh
              </Typography>
              <List dense sx={{ p: 0 }}>
                {['Về chúng tôi', 'Điều khoản sử dụng', 'Chính sách bảo mật', 'FAQ', 'Liên hệ'].map((text) => (
                  <ListItem key={text} sx={{ p: 0, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <ListItemText
                      primary={text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Categories */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: { xs: 'center', sm: 'flex-start' } }}>
                Danh mục
              </Typography>
              <List dense sx={{ p: 0 }}>
                {['Điện thoại', 'Laptop', 'Đồng hồ', 'Phụ kiện', 'Khác'].map((text) => (
                  <ListItem key={text} sx={{ p: 0, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <ListItemText
                      primary={text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: { xs: 'center', sm: 'flex-start' } }}>
                Liên hệ
              </Typography>
              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ p: 0, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationOnIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="123 Đường ABC, Quận XYZ, TP.HCM" sx={{ '& .MuiListItemText-primary': { color: 'text.secondary' } }} />
                </ListItem>
                <ListItem sx={{ p: 0, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="(84) 123-456-789" sx={{ '& .MuiListItemText-primary': { color: 'text.secondary' } }} />
                </ListItem>
                <ListItem sx={{ p: 0, mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="support@onlineauctions.com" sx={{ '& .MuiListItemText-primary': { color: 'text.secondary' } }} />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              © {new Date().getFullYear()} Online Auctions. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Điều khoản sử dụng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Chính sách bảo mật
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Cookie Policy
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;
