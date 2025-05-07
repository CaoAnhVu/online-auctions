import api from './api';

class AuthService {
  async login(username, password) {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token, newPassword) {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async verifyEmail(token) {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  }

  async googleLogin() {
    const googleAuthUrl = `${process.env.REACT_APP_API_URL}/api/auth/google`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const popup = window.open(googleAuthUrl, 'Google Login', `width=${width},height=${height},left=${left},top=${top}`);

    return new Promise((resolve, reject) => {
      window.addEventListener('message', (event) => {
        if (event.origin !== process.env.REACT_APP_API_URL) return;

        if (event.data.token) {
          localStorage.setItem('token', event.data.token);
          localStorage.setItem('user', JSON.stringify(event.data.user));
          popup.close();
          resolve(event.data);
        }

        if (event.data.error) {
          popup.close();
          reject(event.data.error);
        }
      });
    });
  }

  async facebookLogin() {
    const facebookAuthUrl = `${process.env.REACT_APP_API_URL}/api/auth/facebook`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const popup = window.open(facebookAuthUrl, 'Facebook Login', `width=${width},height=${height},left=${left},top=${top}`);

    return new Promise((resolve, reject) => {
      window.addEventListener('message', (event) => {
        if (event.origin !== process.env.REACT_APP_API_URL) return;

        if (event.data.token) {
          localStorage.setItem('token', event.data.token);
          localStorage.setItem('user', JSON.stringify(event.data.user));
          popup.close();
          resolve(event.data);
        }

        if (event.data.error) {
          popup.close();
          reject(event.data.error);
        }
      });
    });
  }

  async setup2FA() {
    const response = await api.post('/api/auth/2fa/setup');
    return response.data;
  }

  async verify2FA(code) {
    const response = await api.post('/api/auth/2fa/verify', { code });
    return response.data;
  }

  async disable2FA(code) {
    const response = await api.post('/api/auth/2fa/disable', { code });
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
