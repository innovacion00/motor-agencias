import { atom } from 'nanostores';

// Definimos un estado global para el token JWT
export const authTokenStore = atom(localStorage.getItem('authToken'));

// Función para actualizar el token en la Nano Store y en localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);  // Guardamos el token en localStorage
    authTokenStore.set(token);  // Actualizamos la Nano Store
  } else {
    // Si no hay token, redirigir al login
    localStorage.removeItem('authToken'); // Limpiamos el token en localStorage
    authTokenStore.set(null); // Limpiamos el token en la Nano Store
    window.location.href = '/'; // Redirigimos al login
  }
};

// Función para obtener el token actual
export const getAuthToken = () => {
  const token = authTokenStore.get();
  if (!token) {
    window.location.href = '/'; // Redirigir al login si no hay token
  }
  return token;
};