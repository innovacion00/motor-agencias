import Swal from "sweetalert2";

/** Cierra modales Swal y elimina contenedores/clases que bloquean clicks tras View Transitions. */
export function cleanupSweetAlert() {
  if (typeof document === "undefined") return;

  try {
    Swal.close();
  } catch {
    /* ignore */
  }

  document.body.classList.remove("swal2-shown", "swal2-height-auto");
  document.documentElement.classList.remove("swal2-shown", "swal2-height-auto");
  document.body.style.removeProperty("padding-right");
  document.body.style.removeProperty("overflow");

  document.querySelectorAll(".swal2-container").forEach((node) => node.remove());
}
