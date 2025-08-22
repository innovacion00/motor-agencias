import {
    atom
} from "nanostores";
import Swal from "sweetalert2";

// Crear una store para almacenar la disponibilidad
export const disponibilidad = atom([]);

// Store para almacenar las noches
export const nightsStore = atom(0);
const URL = 'https://gehsuitesapps.com/'
// const URL = 'https://gehsuitesapps.com/agencias/v1/reservas/671fbd6125d14fb460f617c2'
export const getdisponibility = async (objetohotel) => {
    const objetoprueba = JSON.stringify({
        checkingDate: objetohotel.checkin,
        ciudad: objetohotel.city,
        nights: objetohotel.nights,
        layout: objetohotel.layout,
    })
    console.log(objetoprueba)

    const token = localStorage.getItem("authToken");



    try {

        const url =
            `${URL}agencias/v1/reservas/disponibilidad`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: objetoprueba,
        });
        console.log(response)
        if (response.ok) {
            const data = await response.json();

            // Guardar los datos en la store
            disponibilidad.set(data);

            localStorage.setItem("data", JSON.stringify(data))



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
            text: "No se pudo obtener la disponibilidad. Por favor, intenta nuevamente más tarde.",
        });
        console.error("Error al obtener disponibilidad:", error);
    }
};

export const reservasNano = atom([])
export const getReservas = async (token, datosUsuario) => {
    const rol = () => {

        if (datosUsuario.includes("super-admin")) {
            return `${URL}agencias/v1/reservas`
        } else if (datosUsuario.includes("admin")) {
            return `${URL}agencias/v1/reservas/reservas-by-agencia`
        } else {
            return `${URL}agencias/v1/reservas/reservas-by-user`
        }
    }
    //console.log(rol())

    const urlrol = rol()
    //console.log(urlrol)

    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
        };
        const response = await fetch(urlrol, requestOptions)

        if (response.ok) {
            const data = await response.json()
            if (data.reservas) {
                reservasNano.set(data.reservas)
            } else {
                reservasNano.set(data)
            }
            // console.log(data)
            return data
        } else {
            console.log('error al obtener los datos de la reserva')
        }


    } catch (error) {
        console.log('erro en la peticion:', error)
    }

}