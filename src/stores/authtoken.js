import { atom } from "nanostores";
import Cookies from "js-cookie";

export const tokenglobal = atom("13");

export const validarToken = async () => {
  const token = Cookies.get("token");

  if (!token || token == 'undefined') {
    window.location.href = "/login";
  }
};
