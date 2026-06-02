import Swal from "sweetalert2";
import "../../public/styles/Footer.css";
import styles from "./EncuestaSatisfaccion.module.css";
import {
  debeMostrarEncuesta,
  enviarEncuestaApi,
  enviarEncuestaBitrix,
  marcarEncuestaCompletadaLocal,
} from "../utils/encuestaUsuario";

const PREGUNTAS = [
  {
    id: "experiencia",
    titulo: "Experiencia de uso de la plataforma",
    texto:
      "¿Qué tan satisfecho(a) está con su experiencia general al utilizar BookingConnects?",
  },
  {
    id: "capacitaciones",
    titulo: "Calidad de las capacitaciones",
    texto:
      "¿Cómo calificaría la calidad y utilidad de las capacitaciones recibidas para el uso de BookingConnects?",
  },
  {
    id: "reservas",
    titulo: "Facilidad para realizar reservas",
    texto:
      "¿Qué tan fácil le resulta realizar y gestionar reservas a través de BookingConnects?",
  },
];

const STAR_VALUES = [1, 2, 3, 4, 5];

const NIVELES_ESTRELLAS = {
  1: "Muy insatisfecho",
  2: "Insatisfecho",
  3: "Neutral",
  4: "Satisfecho",
  5: "Muy satisfecho",
};

const PLACEHOLDER_RATING = "Seleccione una calificación";

function buildStarsMarkup() {
  return STAR_VALUES.map(
    (value) =>
      `<button type="button" class="${styles.starBtn} ${styles.starOutline}" data-star="${value}" aria-label="${value} - ${NIVELES_ESTRELLAS[value]}">star</button>`
  ).join("");
}

function buildSurveyMarkup() {
  const questionsHtml = PREGUNTAS.map(
    (q) => `
    <section class="${styles.question}">
      <div class="${styles.questionHeader}">
        <h2 class="${styles.questionTitle}">${q.titulo}</h2>
        <p class="${styles.questionText}">${q.texto}</p>
      </div>
      <div class="${styles.ratingBlock}">
        <div class="${styles.stars}" data-rating-group="${q.id}">
          ${buildStarsMarkup()}
        </div>
        <p class="${styles.ratingLabel}" data-rating-label="${q.id}">${PLACEHOLDER_RATING}</p>
      </div>
    </section>`
  ).join("");

  return `
    <div class="${styles.modal}" id="encuesta-modal">
      <div class="${styles.modalHeader}">
        <h1 class="${styles.modalTitle}">Tu opinión nos importa</h1>
        <button type="button" class="${styles.closeBtn}" data-encuesta-close aria-label="Cerrar">
          <span class="${styles.materialIcon}">close</span>
        </button>
      </div>
      <div class="${styles.modalBody}">
        ${questionsHtml}
        <section class="${styles.commentsSection}">
          <label class="${styles.commentsLabel}" for="encuesta-comentarios">Comentarios adicionales (opcional)</label>
          <textarea
            id="encuesta-comentarios"
            class="${styles.textarea}"
            placeholder="Cuéntanos más sobre tu experiencia..."
          ></textarea>
        </section>
      </div>
      <div class="${styles.modalFooter}">
        <button type="button" class="${styles.submitBtn}" data-encuesta-submit>
          Enviar encuesta
        </button>
      </div>
    </div>
  `;
}

function setSubmitLoading(submitBtn, loading) {
  if (!submitBtn) return;

  submitBtn.disabled = loading;
  submitBtn.classList.toggle(styles.submitBtnLoading, loading);

  if (loading) {
    submitBtn.innerHTML = `<span class="${styles.submitSpinner}" aria-hidden="true"></span><span>Enviando...</span>`;
    return;
  }

  submitBtn.textContent = "Enviar encuesta";
}

function setRating(container, rating) {
  const stars = container.querySelectorAll("[data-star]");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove(styles.starOutline);
      star.classList.add(styles.starFilled);
      star.style.fontVariationSettings = "'FILL' 1";
    } else {
      star.classList.add(styles.starOutline);
      star.classList.remove(styles.starFilled);
      star.style.fontVariationSettings = "'FILL' 0";
    }
  });

  const groupId = container.getAttribute("data-rating-group");
  const label = container.parentElement?.querySelector(
    `[data-rating-label="${groupId}"]`
  );
  if (label) {
    label.textContent =
      rating > 0 ? NIVELES_ESTRELLAS[rating] : PLACEHOLDER_RATING;
    label.classList.toggle(styles.ratingLabelActive, rating > 0);
  }
}

export function abrirEncuestaSatisfaccion() {
  if (!debeMostrarEncuesta()) return;

  const ratings = {
    experiencia: 0,
    capacitaciones: 0,
    reservas: 0,
  };

  Swal.fire({
    title: "",
    html: buildSurveyMarkup(),
    showConfirmButton: false,
    showCloseButton: false,
    allowOutsideClick: true,
    width: "28rem",
    padding: 0,
    backdrop: "rgba(28, 27, 27, 0.4)",
    customClass: {
      popup: "encuesta-popup",
      htmlContainer: "encuesta-html",
      container: "encuesta-container",
    },
    didOpen: (popup) => {
      const root = popup.querySelector("#encuesta-modal");
      if (!root) return;

      root.querySelector("[data-encuesta-close]")?.addEventListener("click", () => {
        Swal.close();
      });

      PREGUNTAS.forEach(({ id }) => {
        const group = root.querySelector(`[data-rating-group="${id}"]`);
        if (!group) return;

        group.querySelectorAll("[data-star]").forEach((starBtn) => {
          starBtn.addEventListener("click", () => {
            const value = Number(starBtn.getAttribute("data-star"));
            ratings[id] = value;
            setRating(group, value);
          });
        });
      });

      const submitBtn = root.querySelector("[data-encuesta-submit]");
      const closeBtn = root.querySelector("[data-encuesta-close]");

      submitBtn?.addEventListener("click", async () => {
        if (submitBtn.disabled) return;

        const incompletas = PREGUNTAS.some(({ id }) => ratings[id] === 0);
        if (incompletas) {
          await Swal.fire({
            icon: "warning",
            title: "Encuesta incompleta",
            text: "Por favor califique las tres preguntas antes de enviar.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#0058bc",
          });
          return;
        }

        setSubmitLoading(submitBtn, true);
        if (closeBtn) closeBtn.disabled = true;

        const comentarios =
          root.querySelector("#encuesta-comentarios")?.value?.trim() || "";

        const surveyPayload = {
          experiencia: ratings.experiencia,
          capacitaciones: ratings.capacitaciones,
          reservas: ratings.reservas,
          comentarios,
        };

        try {
          const encuestaResponse = await enviarEncuestaApi();

          if (!encuestaResponse.ok) {
            throw new Error(`Error ${encuestaResponse.status}`);
          }

          await enviarEncuestaBitrix(surveyPayload);

          marcarEncuestaCompletadaLocal();
          Swal.close();

          await Swal.fire({
            icon: "success",
            title: "¡Gracias!",
            text: "Su opinión nos ayuda a mejorar Booking Connect.",
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#0058bc",
          });
        } catch (error) {
          console.error("Error al enviar encuesta:", error);
          await Swal.fire({
            icon: "error",
            title: "No se pudo enviar",
            text: "Ocurrió un problema al enviar su encuesta. Por favor, inténtelo más tarde.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#0058bc",
          });
        } finally {
          setSubmitLoading(submitBtn, false);
          if (closeBtn) closeBtn.disabled = false;
        }
      });
    },
  });
}

const EncuestaSatisfaccion = () => (
  <button
    type="button"
    className="video-button encuesta-footer-button"
    onClick={abrirEncuestaSatisfaccion}
  >
    Encuesta de satisfacción
  </button>
);

export default EncuestaSatisfaccion;
