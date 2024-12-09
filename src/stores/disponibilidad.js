import {
    atom
} from "nanostores";
import Swal from "sweetalert2";

// Crear una store para almacenar la disponibilidad
export const disponibilidad = atom([]);

// Store para almacenar las noches
export const nightsStore = atom(0);

export const getdisponibility = async (objetohotel) => {
const objetoprueba = JSON.stringify({
    checkingDate: objetohotel.checkin,
    ciudad: objetohotel.city,
    nights: objetohotel.nights,
    layout: objetohotel.layout,
})    
console.log(objetoprueba)
    
try {
        const url =
            "http://206.189.199.124:3000/agencias/v1/reservas/disponibilidad/671169878217aafa29ec2388";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", },
            body: objetoprueba,
        });
        console.log(response)
        if (response.ok) {
            const data = await response.json();

            // Guardar los datos en la store
            disponibilidad.set(data);

            localStorage.setItem("data",JSON.stringify(data))



            // Notificación de éxito
            // Swal.fire({
            //     icon: "success",
            //     title: "Búsqueda exitosa",
            //     text: "Los datos de disponibilidad se han obtenido correctamente.",
            // });

            console.log("Disponibilidad obtenida:", disponibilidad.get());
        } else {
            throw new Error("Error al consultar la API");
        }
    } catch (error) {
        // Manejo de errores con SweetAlert
        Swal.fire({
            icon: "error",
            title: "Error en la búsqueda",
            text: "No se pudo obtener la disponibilidad. Por favor, verifica los datos ingresados o intenta nuevamente más tarde.",
        });
        console.error("Error al obtener disponibilidad:", error);
    }
};