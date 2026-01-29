import config from './config'

class API {
    constructor(baseUrl) {
      this.baseUrl = config.BackendHTTP;
    }
  
    async sendRequest(url, method, data = {}) {
      try {
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
          }
        };

        if (method !== 'GET') {
          options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.baseUrl}${url}`, options);
  
        const responseData = await response.json();
        
        if (!response.ok) {
          // Create error with status code for proper error handling
          const error = new Error(responseData.error || 'Request failed');
          error.status = response.status;
          error.response = responseData;
          throw error;
        }
        
        return responseData;
      } catch (error) {
        throw error;
      }
    }
  
    async register(username, email, password, name) {
      return await this.sendRequest('/api/auth/register', 'POST', { 
        username, 
        email, 
        password, 
        name 
      });
    }

    async login(username, password) {
      return await this.sendRequest('/api/auth/login', 'POST', { 
        username, 
        password 
      });
    }

    async getAllUsers() {
      return await this.sendRequest('/api/users', 'GET');
    }
  }
  
  const api = new API();
  
  export default api;
  