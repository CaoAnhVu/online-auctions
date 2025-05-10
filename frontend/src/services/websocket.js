import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { addNotification } from '../redux/slices/notificationSlice';
import { auctionUpdated } from '../redux/slices/auctionSlice';
import store from '../redux/store';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  connect() {
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
    });

    this.client.onConnect = () => {
      console.log('[WebSocket] Connected');
      // Resubscribe to all topics after reconnection
      this.subscriptions.forEach((_, topic) => {
        this.subscribeToTopic(topic);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame);
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
          console.log('[WebSocket] Received auction update:', update);

          // Always dispatch to Redux store to ensure all tabs get the update
          store.dispatch(auctionUpdated(update));
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
