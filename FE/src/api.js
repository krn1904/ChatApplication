import config from './config'

class API {
    constructor() {
      this.baseUrl = config.BASE_URL + config.API_BASE;
    }
  
    async sendRequest(url, method, data = {}) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: method !== 'GET' ? JSON.stringify(data) : undefined,
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
      } catch (error) {
        console.error('API Request Error:', error);
        throw error;
      }
    }
  
    async createUser(email, password, name) {
      try {
        const data = await this.sendRequest('/users/register', 'POST', { email, password, name });
        return data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

    async loginUser(email, password) {
      try {
        const data = await this.sendRequest('/users/login', 'POST', { email, password });
        return data;
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    }

    async getAllUsers() {
      try {
        const data = await this.sendRequest('/users/all', 'GET');
        return data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }

    async getMessages(roomId) {
      try {
        const data = await this.sendRequest(`/messages/${roomId}`, 'GET');
        return data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    }
  }
  
  const api = new API();
  
  export default api;
  