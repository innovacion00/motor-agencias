// src/stores/searchStore.js
import { atom } from 'nanostores';

// Store global para el estado de búsqueda
export const searchState = atom({
  destination: '',
  dateRange: {
    startDate: new Date(),
    endDate: new Date(),
  },
  adults: 1,
  children: 0,
  rooms: 1,
  childrenAges: []
});

// Funciones para actualizar la store
export const setDestination = (destination) => {
  searchState.set({
    ...searchState.get(),
    destination
  });
};

export const setDateRange = (startDate, endDate) => {
  searchState.set({
    ...searchState.get(),
    dateRange: { startDate, endDate }
  });
};

export const setAdults = (adults) => {
  searchState.set({
    ...searchState.get(),
    adults
  });
};

export const setChildren = (children, childrenAges = []) => {
  searchState.set({
    ...searchState.get(),
    children,
    childrenAges
  });
};

export const setRooms = (rooms) => {
  searchState.set({
    ...searchState.get(),
    rooms
  });
};

export const setChildrenAges = (childrenAges) => {
  searchState.set({
    ...searchState.get(),
    childrenAges
  });
};
