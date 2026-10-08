// Backend server configuration
// Supports production Render backend and local development fallback
const defaultBackend = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : 'https://hearaid-twinai-tnu1.onrender.com';

const serverBase = process.env.REACT_APP_API_URL || defaultBackend;

export const baseURL = 'https://hearaid-api.herokuapp.com/hearaid';
export const communityURL = `${serverBase.replace(/\/$/, '')}/api`;
export const socketURL = serverBase || (typeof window !== 'undefined' ? window.location.origin : '');