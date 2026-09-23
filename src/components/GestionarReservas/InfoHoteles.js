import { getHotelByNombre, HOTELES } from '../../data/hotelesConfig';

export const hoteles = (hotel) => {
  const h = getHotelByNombre(hotel);
  if (!h) return { error: true, msg: "No se encontró el tipo de habitación" };
  return { imgHotel: h.imgGestionar, ubicacion: h.ubicacionGestionar };
};

export const habitaciones = Object.fromEntries(
  Object.values(HOTELES).flatMap(h =>
    Object.entries(h.habitaciones || {}).map(([roomId, data]) => [roomId, data])
  )
);
