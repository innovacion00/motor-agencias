import { useEffect } from "react";
import { abrirEncuestaSatisfaccion } from "./EncuestaSatisfaccion";
import {
  consumirEncuestaPostLogin,
  debeMostrarEncuesta,
} from "../utils/encuestaUsuario";

const EncuestaAutoTrigger = () => {
  useEffect(() => {
    const postLogin = consumirEncuestaPostLogin();
    if (!postLogin || !debeMostrarEncuesta()) return;

    const timer = window.setTimeout(() => {
      abrirEncuestaSatisfaccion();
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
};

export default EncuestaAutoTrigger;
