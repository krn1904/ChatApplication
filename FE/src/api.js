import config from './config'

class API {
    constructor(baseUrl) {
      this.baseUrl = config.BaseURL + config.port;
    }
  
    async sendRequest(url, method, data = {}) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        const responseData = await response.json();
        return responseData;
      } catch (error) {
        console.error('API Request Error:', error);
        throw new Error('An error occurred during the API request.');
      }
    }
  
    async createUser(email, password, name) {
      try {
        const data = await this.sendRequest('/createUser', 'POST', { email, password, name });
        return data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('An error occurred while creating the user.');
      }
    }
  }
  
  const api = new API();
  
  export default api;
  