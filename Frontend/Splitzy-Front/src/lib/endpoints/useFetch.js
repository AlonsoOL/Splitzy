const getAuthToken = () => {
    return localStorage.getItem('accessToken') || '';
  };
  
  async function FETCH_REQUEST(url, method, obj = null) {
    try {
      const token = getAuthToken();
  
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      };
  
      if (obj) {
        config.body = JSON.stringify(obj);
      }
  
      const response = await fetch(url, config);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la solicitud.');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
  export const FETCH_GET = (url) => FETCH_REQUEST(url, 'GET');
  export const FETCH_POST = (url, obj) => FETCH_REQUEST(url, 'POST', obj);
  export const FETCH_PUT = (url, obj) => FETCH_REQUEST(url, 'PUT', obj);
  export const FETCH_DELETE = (url, obj) => FETCH_REQUEST(url, 'DELETE', obj);
  