import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { addNotification, getNotifications } from '../redux/slices/notificationSlice';
import { auctionUpdated } from '../redux/slices/auctionSlice';
import { getUserPayments } from '../redux/slices/paymentSlice';
import store from '../redux/store';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.client?.connected) return;

    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('[WebSocket Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    this.client.onConnect = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;

      // Resubscribe to all topics after reconnection
      this.subscriptions.forEach((_, topic) => {
        this.subscribeToTopic(topic);
      });

      // Automatically subscribe to user-specific notifications
      const user = store.getState().auth.user;
      if (user && user.username) {
        this.subscribeToUserNotifications(user.username);

        // Đăng ký kênh thông báo thanh toán
        this.subscribeToUserPayments(user.username);

        // Đăng ký kênh thông báo đấu giá
        this.subscribeToUserAuctions(user.username);
      }

      // Cập nhật thông báo khi kết nối thành công
      store.dispatch(getNotifications());
      store.dispatch(getUserPayments());
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame);
    };

    this.client.onWebSocketClose = () => {
      console.log('[WebSocket] Connection closed');
      this.reconnectAttempts++;

      // Nếu quá số lần thử kết nối lại, ngừng thử
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnect attempts reached');
      }
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions.clear();
    }
  }

  subscribeToTopic(topic) {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Not connected, cannot subscribe to:', topic);
      return;
    }

    if (this.subscriptions.has(topic)) {
      console.log('[WebSocket] Already subscribed to:', topic);
      return;
    }

    try {
      const subscription = this.client.subscribe(topic, (message) => {
        console.log('[WebSocket] Received message on topic:', topic);
        console.log('[WebSocket] Message body:', message.body);

        try {
          const update = JSON.parse(message.body);
          console.log('[WebSocket] Parsed update:', update);

          // Handle different types of messages based on topic
          if (topic.includes('/queue/notifications')) {
            console.log('[WebSocket] Received notification update:', update);

            // Dispatch the notification to Redux store - thông báo mới nhất sẽ được đánh dấu là mới
            store.dispatch(addNotification(update));

            // Cập nhật lại danh sách thông báo để đảm bảo badge count được cập nhật
            setTimeout(() => {
              store.dispatch(getNotifications());
            }, 500);

            // Show desktop notification if enabled
            if (update.title || update.message) {
              this.showDesktopNotification({
                title: update.title || 'New Notification',
                message: update.message || '',
              });
            }
          } else if (topic.includes('/queue/payments')) {
            console.log('[WebSocket] Received payment update:', update);
            // Refresh payments when payment updates are received
            store.dispatch(getUserPayments());
          } else if (topic.includes('/topic/auctions/')) {
            console.log('[WebSocket] Received auction update:', update);
            // Dispatch auction update to Redux store
            store.dispatch(auctionUpdated(update));

            // Nếu là cập nhật đấu giá, cập nhật thông báo
            if (update.type === 'BID') {
              setTimeout(() => {
                store.dispatch(getNotifications());
                store.dispatch(getUserPayments());
              }, 500);
            }
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      this.subscriptions.set(topic, subscription);
      console.log('[WebSocket] Subscribed to:', topic);
    } catch (error) {
      console.error('[WebSocket] Error subscribing to topic:', topic, error);
    }
  }

  unsubscribeFromTopic(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log('[WebSocket] Unsubscribed from:', topic);
    }
  }

  subscribeToAuction(auctionId) {
    const topic = `/topic/auctions/${auctionId}`;
    this.subscribeToTopic(topic);
  }

  unsubscribeFromAuction(auctionId) {
    const topic = `/topic/auctions/${auctionId}`;
    this.unsubscribeFromTopic(topic);
  }

  subscribeToUserNotifications(username) {
    const topic = `/user/${username}/queue/notifications`;
    this.subscribeToTopic(topic);
  }

  subscribeToUserPayments(username) {
    const topic = `/user/${username}/queue/payments`;
    this.subscribeToTopic(topic);
  }

  subscribeToUserAuctions(username) {
    const topic = `/user/${username}/queue/auctions`;
    this.subscribeToTopic(topic);
  }

  async showDesktopNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: './logo192.png',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
        });
      }
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;
