import { Client } from '@stomp/stompjs';
import { addNotification } from '../redux/slices/notificationSlice';
import { updateAuction } from '../redux/slices/auctionSlice';
import store from '../redux/store';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  connect(token) {
    this.client = new Client({
      brokerURL: `ws://${window.location.host}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      // Subscribe to personal notifications
      this.subscribeToNotifications();
      // Subscribe to auction updates
      this.subscribeToAuctionUpdates();
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket Error:', frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscriptions.clear();
  }

  subscribeToNotifications() {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe('/user/queue/notifications', (message) => {
      const notification = JSON.parse(message.body);
      store.dispatch(addNotification(notification));

      // Show desktop notification if permission granted
      this.showDesktopNotification(notification);
    });

    this.subscriptions.set('notifications', subscription);
  }

  subscribeToAuctionUpdates() {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe('/topic/auctions', (message) => {
      const update = JSON.parse(message.body);
      store.dispatch(updateAuction(update));
    });

    this.subscriptions.set('auctions', subscription);
  }

  subscribeToAuction(auctionId) {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(`/topic/auctions/${auctionId}`, (message) => {
      const update = JSON.parse(message.body);
      store.dispatch(updateAuction(update));
    });

    this.subscriptions.set(`auction-${auctionId}`, subscription);
  }

  unsubscribeFromAuction(auctionId) {
    const subscription = this.subscriptions.get(`auction-${auctionId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`auction-${auctionId}`);
    }
  }

  async showDesktopNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
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

export const websocketService = new WebSocketService();
export default websocketService;
