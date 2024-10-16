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

// Función para actualizar la store global de búsqueda
export const updateSearchStore = (newValues) => {
  // Validamos que newValues sea un objeto válido
  if (typeof newValues === 'object' && newValues !== null) {
    // Actualizamos la store con los nuevos valores
    searchStore.set({ 
      ...searchStore.get(),   // Mantenemos los valores actuales
      ...newValues            // Sobrescribimos con los valores nuevos
    });
  } else {
    console.error('Los valores proporcionados no son válidos para actualizar la store.');
  }
};