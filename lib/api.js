export const fetcher = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const res = await fetch(url, {
      ...options,
      headers,
    });
  
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
  
    return res.json();
  };