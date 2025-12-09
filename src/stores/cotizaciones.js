import { atom } from "nanostores";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { refreshToken } from "./authtoken";

// Atom para almacenar los datos de la cotización
export const cotizacionData = atom(null);

export const cotizaciones = async ({id}) => {
try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      window.location.href = '/login';
      return null;
    }
    const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${accessToken}` );

const requestOptions = {
  method: "GET",
  headers: myHeaders,
};
const url = import.meta.env.PUBLIC_API_URL;
const response = await fetch(`${url}/agencias/v1/cotizaciones/${id}`, requestOptions)

if (response.ok) {
    const data = await response.json();
    console.log(data);
    cotizacionData.set(data);
    return data;
  } else {
    throw new Error("Error al consultar la API");
  }
  
} catch (error) {
    console.error('Error al obtener las cotizaciones:', error);
    return null;
}
}