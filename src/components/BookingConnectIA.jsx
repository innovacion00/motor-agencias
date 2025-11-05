import { useEffect, useState } from "react";

export default function BookingConnectIA({ agencyName = "{Nombre_agencia}" }) {
	const [isDark, setIsDark] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
		if (savedTheme === "dark") {
			document.documentElement.setAttribute("data-theme", "dark");
			setIsDark(true);
		}
	}, []);

	function toggleTheme() {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		if (newIsDark) {
			document.documentElement.setAttribute("data-theme", "dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.removeAttribute("data-theme");
			localStorage.setItem("theme", "light");
		}
	}

	return (
		<div className="bcia-page">
			<button className="theme-toggle" onClick={toggleTheme}>
				<span id="theme-icon">{isDark ? "☀️" : "🌙"}</span> {isDark ? "Modo Claro" : "Modo Oscuro"}
			</button>

			<div className="container">
				<h2>
					Hola {agencyName}, de parte de Geh Suites ¿En que podemos ayudarte hoy?
				</h2>
				<div className="input-box">
					<input
						type="text"
						placeholder="{Enviar un mensaje a BookingConnectIA}"
						maxLength={5000}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<span className="mic-icon" aria-label="Micrófono">🎤</span>
				</div>
				<div className="button-group">
					<button>{"{prompt-recomend-planes}"}</button>
					<button>{"{prompt-recomend-hoteles_location}"}</button>
					<button>{"{prompt-armarpaquetes (tours/traslado)}"}</button>
					<button>{"{prompt-info-hoteles}"}</button>
					<button>{"{prompt-info-planes}"}</button>
					<button>{"{prompt-sorprendeme}"}</button>
					<button>{"{prompt-traslados}"}</button>
				</div>
			</div>
		</div>
	);
}


