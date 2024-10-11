import { atom } from 'nanostores';

// Definimos los estados globales para la búsqueda
export const searchStore = atom({
  dateRange: {
    startDate: new Date(),
    endDate: new Date(),
  },
  adults: 1,
  children: 0,
  rooms: 1,
  childrenAges: [],
});

// Funciones para actualizar la store global
export const updateSearchStore = (newValues) => {
  searchStore.set({ ...searchStore.get(), ...newValues   });
};