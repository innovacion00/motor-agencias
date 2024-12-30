import Cookies from "js-cookie";
import { parse } from 'cookie'
import {
    atom
} from "nanostores";
export const linkPago = atom({})
export const generarLinkPago = async (id) => {
    console.log(id)
    try {
        const userFromCookie = Cookies.get("token");
        const parsedUser = userFromCookie ? JSON.parse(userFromCookie) : null;
        console.log(parsedUser)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${parsedUser}`);

        const raw = JSON.stringify({
            reservaId: id
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
        };

        const response = await fetch("https://gehsuitesapps.com/agencias/v1/reservas/generate-link", requestOptions)

        if (response.ok) {
            const data = await response.json();
            // console.log(data.linkInfo)
            linkPago.set(data.linkInfo)
            return data.linkInfo
        } else {
            console.log('error al generar link')
        }

    } catch (error) {
        console.log('erro en la peticion', error)
    }

}

