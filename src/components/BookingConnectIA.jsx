import { useState } from "react";

export default function BookingConnectIA({ agencyName = "{Nombre_agencia}" }) {
	const [message, setMessage] = useState("");

	return (
		<div className="bcia-page">
			<div className="chat-root">
				<aside className="sidebar" aria-label="Barra lateral">
					<div className="sidebar-header">
						<button className="icon-btn" aria-label="Información">
							<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
							</svg>
						</button>
						<button className="icon-btn" aria-label="Menú">
							<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
							</svg>
						</button>
					</div>
					<div className="menu-item">
						<svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
						</svg>
						<span>Nuevo chat</span>
					</div>
					<div className="menu-item">
						<svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
						</svg>
						<span>Buscar chats</span>
					</div>
					<div className="menu-item">
						<svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
						</svg>
						<span>Biblioteca</span>
					</div>
				</aside>

				<main className="main-content">
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
				</main>
			</div>
		</div>
	);
}


