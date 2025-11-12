import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';
import "./BookingConnectIA.css";

const STORAGE_KEY_CONVERSATIONS = "bookingConnectIA.conversations";
const STORAGE_KEY_ACTIVE_ID = "bookingConnectIA.activeId";

function generateId() {
	return "c_" + Math.random().toString(36).slice(2, 10);
}

function loadConversations() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveConversations(conversations) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
	} catch {
		/* ignore */
	}
}

function loadActiveId() {
	if (typeof window === "undefined") return "";
	try {
		return window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || "";
	} catch {
		return "";
	}
}

function saveActiveId(id) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
	} catch {
		/* ignore */
	}
}

export default function BookingConnectIA({ agencyName = "{Nombre_agencia}" }) {
	const [message, setMessage] = useState("");
	const [welcomePrompt, setWelcomePrompt] = useState("");
	const [conversations, setConversations] = useState(() => loadConversations());
	const [activeId, setActiveId] = useState(() => loadActiveId());
	const [isChatStarted, setIsChatStarted] = useState(false);
	const [isResponding, setIsResponding] = useState(false);
	const textareaRef = useRef(null);
	const welcomeTextareaRef = useRef(null);
	const messagesEndRef = useRef(null);
	const [agencyDisplayName, setAgencyDisplayName] = useState(agencyName);
	const prompts = [
		"{prompt-recomend-hoteles_location}",
		"{prompt-recomend-planes}",
		"{prompt-armarpaquetes (tours/traslado)}",
		"{prompt-info-hoteles}",
		"{prompt-info-planes}",
		"{prompt-sorprendeme}",
		"{prompt-traslados}",
	];

	const fetchWithToken = async (url, options = {}) => {
		let token = Cookies.get('accessToken');
		
		const headers = {
			...options.headers,
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		};
		
		let response = await fetch(url, {
			...options,
			headers,
		});

		if (response.status === 401) {
			const newToken = await refreshToken();
			if (newToken) {
				headers['Authorization'] = `Bearer ${newToken}`;
				response = await fetch(url, {
					...options,
					headers,
				});
			}
		}
		return response;
	};

	const activeConversation = useMemo(
		() => conversations.find((conv) => conv.id === activeId) || null,
		[conversations, activeId]
	);

	useEffect(() => {
		try {
			const raw = localStorage.getItem("datosUsuario");
			if (raw) {
				const parsed = JSON.parse(raw);
				const name = parsed?.agencia?.fullName;
				if (typeof name === "string" && name.trim().length > 0) {
					setAgencyDisplayName(name);
				}
			}
		} catch (_) {
			// ignorar errores de parseo/acceso
		}
	}, []);

	useEffect(() => {
		saveConversations(conversations);
	}, [conversations]);

	useEffect(() => {
		saveActiveId(activeId);
	}, [activeId]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [activeConversation, isResponding]);

	useEffect(() => {
		const exists = conversations.some((conv) => conv.id === activeId);
		if (!exists) {
			handleNewChat();
		} else {
			setIsChatStarted((activeConversation?.messages.length || 0) > 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function autoResize(ref) {
		const el = ref.current;
		if (!el) return;
		el.style.height = "0px";
		const next = Math.min(el.scrollHeight, 200);
		el.style.height = `${next}px`;
	}

	function handleNewChat() {
		const id = generateId();
		const newConversation = {
			id,
			title: "Nuevo chat",
			messages: [],
		};
		setConversations((prev) => [newConversation, ...prev]);
		setActiveId(id);
		setIsChatStarted(false);
		setWelcomePrompt("");
		setMessage("");
		setIsResponding(false);
		autoResize(welcomeTextareaRef);
		autoResize(textareaRef);
	}

	function updateActiveConversation(updater) {
		setConversations((prev) =>
			prev.map((conv) => {
				if (conv.id !== activeId) return conv;
				return updater(conv);
			})
		);
	}

	function sendMessage(content, fromWelcome = false) {
		const trimmed = content.trim();
		if (!trimmed) return;

		const userMessage = { role: "user", content: trimmed };

		updateActiveConversation((conv) => {
			const title =
				conv.messages.length === 0 ? trimmed.slice(0, 40) || "Nuevo chat" : conv.title;
			return {
				...conv,
				title,
				messages: [...conv.messages, userMessage],
			};
		});

		if (fromWelcome) {
			setIsChatStarted(true);
			setWelcomePrompt("");
		} else {
			setMessage("");
			autoResize(textareaRef);
		}

		sendMessageToAPI(trimmed);
	}

	async function sendMessageToAPI(userContent) {
		setIsResponding(true);
		
		try {
			// URL del endpoint
			const apiUrl = "http://143.198.98.188:4000/api/v1/llm/chat";
			
			// Preparar el cuerpo de la petición
			const requestBody = {
				message: userContent,
			};

			// Hacer la petición al endpoint
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ 
					message: `Error: ${response.status} ${response.statusText}` 
				}));
				throw new Error(errorData.message || `Error: ${response.statusText}`);
			}

			const data = await response.json();
			
			// Verificar que la respuesta tenga el formato esperado
			if (!data.success || !data.data || !data.data.response) {
				throw new Error(data.message || "Respuesta del servidor en formato incorrecto");
			}
			
			// Extraer el mensaje de respuesta
			const responseMessage = data.data.response;
			
			// Agregar respuesta del asistente a la conversación
			const assistantMessage = { 
				role: "assistant", 
				content: responseMessage
			};
			
			updateActiveConversation((conv) => ({
				...conv,
				messages: [...conv.messages, assistantMessage],
			}));
			
		} catch (error) {
			console.error('Error al enviar mensaje al API:', error);
			
			// Mostrar mensaje de error al usuario
			const errorMessage = { 
				role: "assistant", 
				content: `Lo siento, hubo un error al procesar tu mensaje: ${error.message}. Por favor intenta de nuevo.` 
			};
			
			updateActiveConversation((conv) => ({
				...conv,
				messages: [...conv.messages, errorMessage],
			}));
		} finally {
			setIsResponding(false);
		}
	}

	function handleWelcomeChange(e) {
		setWelcomePrompt(e.target.value);
		autoResize(welcomeTextareaRef);
	}

	function handleComposerChange(e) {
		setMessage(e.target.value);
		autoResize(textareaRef);
	}

	function onWelcomeKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(welcomePrompt, true);
		}
	}

	function onComposerKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(message, false);
		}
	}

	function handlePromptClick(prompt) {
		if (!isChatStarted) {
			sendMessage(prompt, true);
			return;
		}
		sendMessage(prompt, false);
	}

	function activateConversation(id) {
		setActiveId(id);
		const conv = conversations.find((item) => item.id === id);
		setIsChatStarted((conv?.messages.length || 0) > 0);
		setMessage("");
		setWelcomePrompt("");
		setIsResponding(false);
		autoResize(welcomeTextareaRef);
		autoResize(textareaRef);
	}

	function handleDeleteConversation(id, evt) {
		evt.stopPropagation();
		setConversations((prev) => prev.filter((conv) => conv.id !== id));
		if (id === activeId) {
			const [next] = conversations.filter((conv) => conv.id !== id);
			if (next) {
				setActiveId(next.id);
				setIsChatStarted(next.messages.length > 0);
			} else {
				handleNewChat();
			}
		}
	}

	return (
		<div className="bcia-page">
			<div className="chat-root">
				<aside className="sidebar" aria-label="Barra lateral">
					<div className="sidebar-header">
						<button 
							className="icon-btn" 
							aria-label="Información"
							data-tooltip-id="tooltip-booking-connect-info"
							data-tooltip-content="BookingConnectsIA es la nueva herramienta de inteligencia artificial para agencias. Te brinda información sobre disponibilidad y planes, permite reservar, cotizar y cancelar reservas de BookingConnect."
							data-tooltip-place="right"
						>
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
					<div className="menu-item" onClick={handleNewChat}>
						<svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
							<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
						</svg>
						<span>Biblioteca</span>
					</div>
					<div className="history-section">
						<p className="history-title">Historial</p>
						{conversations.length === 0 && <p className="history-empty">Sin chats aún</p>}
						<div className="history-list">
							{conversations.map((conv) => (
								<button
									key={conv.id}
									className={`history-item${conv.id === activeId ? " is-active" : ""}`}
									onClick={() => activateConversation(conv.id)}
								>
									<span className="history-item-title">{conv.title}</span>
									<button
										className="history-item-delete"
										aria-label="Eliminar chat"
										onClick={(evt) => handleDeleteConversation(conv.id, evt)}
										title="Eliminar chat"
									>
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</button>
							))}
						</div>
					</div>
				</aside>

				<main className={`main-content${isChatStarted ? " has-chat" : ""}`}>
					{!isChatStarted ? (
						<div className="container">
							<h2>
								Hola {agencyDisplayName}, de parte de Geh Suites ¿En que podemos ayudarte hoy?
							</h2>
							<div className="input-box">
								<textarea
									ref={welcomeTextareaRef}
									placeholder="Escribe un mensaje a BookingConnectsIA"
									maxLength={5000}
									value={welcomePrompt}
									onChange={handleWelcomeChange}
									onKeyDown={onWelcomeKeyDown}
									rows={1}
								/>
								<span className="mic-icon" aria-label="Micrófono">
									🎤
								</span>
							</div>
							<div className="welcome-hint">Enter para enviar • Shift+Enter para salto de línea</div>
							<div className="button-group">
								{prompts.map((prompt) => (
									<button key={prompt} onClick={() => handlePromptClick(prompt)}>
										{prompt}
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="chat-surface">
							<header className="chat-header">
								<h2>Chat con BookingConnectIA</h2>
								<p className="chat-subtitle">
									Conversando como <strong>{agencyDisplayName}</strong>
								</p>
							</header>
							<div className="chat-messages">
								{activeConversation && activeConversation.messages.length === 0 && (
									<div className="chat-empty">No hay mensajes aún.</div>
								)}
								{activeConversation &&
									activeConversation.messages.map((msg, idx) => (
										<div key={idx} className={`chat-bubble chat-bubble--${msg.role}`}>
											<div className="chat-bubble-content">{msg.content}</div>
										</div>
									))}
								{isResponding && (
									<div className="chat-bubble chat-bubble--assistant">
										<div className="chat-typing">
											<span className="dot" />
											<span className="dot" />
											<span className="dot" />
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
							<div className="chat-composer">
								<textarea
									ref={textareaRef}
									placeholder="Escribe un mensaje..."
									maxLength={5000}
									value={message}
									onChange={handleComposerChange}
									onKeyDown={onComposerKeyDown}
									rows={1}
									disabled={isResponding}
								/>
								<button
									className="chat-send"
									onClick={() => sendMessage(message, false)}
									disabled={!message.trim() || isResponding}
								>
									Enviar
								</button>
							</div>
						</div>
					)}
				</main>
			</div>
			<Tooltip 
				id="tooltip-booking-connect-info"
				className="custom-tooltip"
			/>
		</div>
	);
}


