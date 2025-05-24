import Cookies from 'js-cookie';

export const setAuthCookie = (token: string) => {
  // Set cookie with 1 day expiry
  Cookies.set('auth_token', token, { 
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const getAuthCookie = () => {
  return Cookies.get('auth_token');
};

export const removeAuthCookie = () => {
  Cookies.remove('auth_token');
}; 