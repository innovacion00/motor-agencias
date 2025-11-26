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

// Función para obtener imágenes de hoteles por nombre
function getHotelImagesByName(hotelName) {
	// Normalizar el nombre del hotel (minúsculas, sin espacios extra)
	const normalized = hotelName.toLowerCase().trim();
	
	// Mapeo de nombres de hoteles a sus imágenes
	const hotelImagesMap = {
		'azuan': {
			main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
			secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244634659.jpg?k=becae71ed93bcf69535c2704fb02e0d97a3e078e017b9356a7a3fcc6d60ca4ee&o=&hp=1",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/1azuan360621.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244639436.jpg?k=6053b3890a7824a3f1a2e30cf862520be80de97644162b30a3e0097d920efafd&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/100688940.jpg?k=6feeec694af1e9a1ce62b699b7360999ec64c17ceb04536c99d43b5820585258&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/100688038.jpg?k=54490e2560d63e691c5d1cf6b009af33d7931f19ef58f69cfbadcc1d7d7b9e2e&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244639401.jpg?k=5a15a41671ee0d3ee3adeca39f4fecc9e11da47a48cb3f9f8840645872114a43&o=&hp=1",
		},
		'aixo': {
			main: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/aixo9640.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/aixo8287.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243822217.jpg?k=d6df4249a82e1b056bc2f4a8c4a577bafda2ab323fe80e3687e9c4bab55a9a2e&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243822196.jpg?k=b0cf6c2c7473c6904939307e198dbc450595fa7b31276a526636601f50d7cd0b&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/277764369.jpg?k=fd77fa5491ffe7d4798985d53bd83a6d678cf7912730a95da78d224f43e9db91&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/245913368.jpg?k=c797277d02ed79ad1e762412e74b9cc289de13e7def62739f012f36bd8b28574&o=&hp=1",
		},
		'abi': {
			main: "https://www.gehsuites.com/multimedia/galerias/galeriaabi17741.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/galeriaabi16972.jpg",
			secondary2: "https://www.gehsuites.com/images/fachada_hotel_abi.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103583.jpg?k=071126037d20bcbfc858d66c26de1815baf6998a56b3f81b73fd8f7eae6dbff7&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103563.jpg?k=c576cf614094adb97aac6fb5efaf9824d0e82cc4475335da439307f9b988c998&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103653.jpg?k=5d5ac95d4cfffcbb34279c6bfceff8f9e83d7ff91667ef35e8b18a2e66b3b810&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103653.jpg?k=5d5ac95d4cfffcbb34279c6bfceff8f9e83d7ff91667ef35e8b18a2e66b3b810&o=&hp=1",
		},
		'boquilla': {
			main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada_boquilla.jpg",
			secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada2_boquilla.jpg",
			secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/desayuno_boquilla.jpg",
			extra1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/doble1_boquilla.jpg",
			extra2:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/cuadruple1_boquilla.jpg",
			extra3:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/cuadruple2_boquilla.jpg",
			extra4:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/familiar_boquilla.jpg",
		},
		'marina': {
			main: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/marinasuites6710.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/marinasuites3856.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243552213.jpg?k=6ae2287058f976690f09ec48b1ea9f1b44deb127fc846bc6e9c976e80c3cdece&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243542610.jpg?k=2cf75ad03a472256d6b2e402fd8d462ce679052a32d0df13c6e7dac56c3d1136&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243543715.jpg?k=7a47cd6af5f8971556ec91581b60c011e0544430470ef73311dd1663eb7dae96&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/243543709.jpg?k=4e2e40743d7fb17a4ea1e2935d754059afb8f5720967603bd3da5c394dcae6a0&o=&hp=1",
		},
		'avexi': {
			main: "https://www.gehsuites.com/multimedia/galerias/avexi5917.jpg",
			secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/foodStanAvexi.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/avexi7863.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687850.jpg?k=9778545d180eb45a8c1efc9be1dcc6096307cbc29f54c3d085a91c5d5ac25509&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/217859458.jpg?k=c7440344e3b869059d93d860a7965a1fda3f7f127378dbfbee10dc2568e2ab62&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687880.jpg?k=372da40f421cb18e3158e3cee258a55df68da3916f5ca7b345f4e62b84cd943d&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/217859510.jpg?k=f71e3a9d6edaa9123e44d3af987237f09f2a2fc4541f71ee208c2c3f52efc100&o=&hp=1",
		},
		'bocagrande': {
			main: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena4469.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena2953.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena14676.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/278270762.jpg?k=cfe9e10545681c6490650e349d45ab6c7dea125d24801658e92055501b28e1e1&o=&hp=1",
			extra2:"https://bocagrande-cartagena-de-indias-hotel.hotelmix.es/data/Photos/1920x1080/7442/744293/744293593/Hotel-Bocagrande-By-Geh-Suites-Cartagena-Exterior.JPEG",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/278270636.webp?k=7ed4455bdce59da1c0465ff2bd51c425b437c3f8f4562246ed26f0b869175ba9&o=",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/278270615.jpg?k=496ffd5ad15ff3a2e0bc2c336cd6f4844af888bb637abe5a5e875b545f339f05&o=&hp=1",
		},
		'rodadero': {
			main: "https://www.gehsuites.com/images/fachada_rodadero_1.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/2rodadero23293.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/galeriarodadero9278.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439332.webp?k=be9946ab62f0398843255b2a33a1145d955860e341f24ab15e3ce246d3ebbc40&o=",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439308.webp?k=e119dab3708ce15ad454b328bebaf8b67c0badac44f046676d5e9bc4035d26da&o=",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439333.webp?k=867e3a6be58a64ccc40ab9484fd8ce06f78e67024f6b842c9d86554d345f5e58&o=",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439330.webp?k=8f3d063550a4618c4990bd8a749429a7403c921a57039861d3ed71526fe854eb&o=",
		},
		'axis': {
			main: "https://www.gehsuites.com/images/YULDAMA-2.jpg",
			secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Lobbyaxis.jpeg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/galeria2295.jpg",
			extra1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Doble-axis.jpeg",
			extra2:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-axis2.jpeg",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/109098049.jpg?k=d28963d3d5f71aa4e6fcc2e3864341d453c8d5bd2aeb8875caaf92d9e9b6c63a&o=",
			extra4:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Familiar-axis.jpeg",
		},
		'sansiraka': {
			main: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
			secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/535990853.jpg?k=15f0dd4cc6a6e4d3eb35cae6b196c8bab43f3734514a24a24f5f29415e8575ce&o=&hp=1",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/galeria7908.jpg",
			extra1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Doble-sansiraka.jpeg",
			extra2:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-sansiraka.jpeg",
			extra3:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacon-cuaruple-sansiraka2.jpeg",
			extra4:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Ba%C3%B1o-sansiraka.jpeg",
		},
		'windsor': {
			main: "https://www.gehsuites.com/multimedia/galerias/5HotelWindsorHouse704.jpg",
			secondary1: "https://www.gehsuites.com/multimedia/galerias/16HotelWindsorHouse427.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/20HotelWindsorHouse922.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/471543571.webp?k=54017a86c0d7226bac8c223cd1a3795097ad3a70ce8a7a58ae229466dc0a7e9a&o=",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/471544101.webp?k=6c3fb4b167056b664463cf80e3069a292560771651fe2884be3744be45c88bf3&o=",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/471545854.webp?k=52ce0d7e3c23fd6cea937dde4b0c3057f369ace5b7bb91b030caa7d9066d6c3d&o=",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/16238049.webp?k=0f372de15850d81efd52caff66eb7f9f1bb343b272a74a4c183f158b9424b9e1&o=",
		},
		'madisson': {
			main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison10238.jpg",
			secondary1: "https://www.gehsuites.com/images/fachada-madison.jpg",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/madison10238.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334226.webp?k=a004d558a7caac5707bdc849283abfeb2ecd6d58cf26240134d7f05eb8dec747&o=",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334105.webp?k=a47582ec901b5eb62ceb7f54c35513f4be2dcb643c1afb614de836d9d4e13d58&o=",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334103.webp?k=2ab38772d7efc02a82af9ecdbb30fe80e426884ba1921673816001a052fcef5f&o=",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334236.webp?k=45c0d1d467b2948766f9498bd96ad31c23d6d07bd4bc56c868c1c350867191d2&o=",
		},
		'chipinque': {
			main:"https://i1.sndcdn.com/artworks-8gMsHpp2Z0JVsOIA-PibhGA-t500x500.png",
			secondary1:"https://i1.sndcdn.com/artworks-8gMsHpp2Z0JVsOIA-PibhGA-t500x500.png",
			secondary2:"https://i1.sndcdn.com/artworks-8gMsHpp2Z0JVsOIA-PibhGA-t500x500.png",
			
		}	
		};

	// Buscar coincidencias parciales en el nombre
	for (const [key, images] of Object.entries(hotelImagesMap)) {
		if (normalized.includes(key)) {
			return images;
		}
	}
	
	return null;
}

// Función para detectar hoteles mencionados en el texto
function detectHotelsInText(text) {
	// Mapeo de patrones de búsqueda a nombres canónicos de hoteles
	const hotelPatterns = [
		{ patterns: ['Hotel Azuan Suites', 'Hotel Azuan', 'Azuan Suites', 'Azuan'], canonical: 'Azuan Suites' },
		{ patterns: ['Hotel Aixo Suites', 'Hotel Aixo', 'Aixo Suites', 'Aixo'], canonical: 'Aixo Suites' },
		{ patterns: ['Hotel Abi Inn', 'Hotel Abi', 'Abi Inn', 'Abi'], canonical: 'Abi Inn' },
		{ patterns: ['Hotel Boquilla Suites', 'Hotel Boquilla', 'Boquilla Suites', 'Boquilla'], canonical: 'Boquilla Suites' },
		{ patterns: ['Hotel Marina Suites', 'Hotel Marina', 'Marina Suites', 'Marina'], canonical: 'Marina Suites' },
		{ patterns: ['Hotel Avexi Suites', 'Hotel Avexi', 'Avexi Suites', 'Avexi'], canonical: 'Avexi Suites' },
		{ patterns: ['Hotel Bocagrande Suites', 'Hotel Bocagrande', 'Bocagrande Suites', 'Bocagrande'], canonical: 'Bocagrande Suites' },
		{ patterns: ['Hotel Rodadero', 'Rodadero'], canonical: 'Hotel Rodadero' },
		{ patterns: ['Hotel Axis', 'Axis'], canonical: 'Hotel Axis' },
		{ patterns: ['Hotel Sansiraka', 'Sansiraka'], canonical: 'Hotel Sansiraka' },
		{ patterns: ['Hotel Windsor', 'Windsor'], canonical: 'Hotel Windsor' },
		{ patterns: ['Hotel Madisson', 'Madisson'], canonical: 'Hotel Madisson' },
		{patterns:  ['Cerraron chipinque', 'Chipinque', 'chipinque'], canonical: 'Cerraron chipinque'}
	];

	const detectedHotels = [];
	const foundHotelKeys = new Set();
	
	for (const hotel of hotelPatterns) {
		// Buscar si alguno de los patrones coincide en el texto
		for (const pattern of hotel.patterns) {
			const regex = new RegExp(`\\b${pattern.replace(/\s+/g, '\\s+')}\\b`, 'gi');
			if (regex.test(text)) {
				// Usar el nombre canónico como clave para evitar duplicados
				const hotelKey = hotel.canonical.toLowerCase();
				if (!foundHotelKeys.has(hotelKey)) {
					foundHotelKeys.add(hotelKey);
					const images = getHotelImagesByName(hotel.canonical);
					if (images) {
						detectedHotels.push({
							name: hotel.canonical,
							patterns: hotel.patterns,
							images: images
						});
					}
				}
				break; // Si encontramos un patrón, no necesitamos buscar los demás
			}
		}
	}
	
	return detectedHotels;
}

// Componente para renderizar mensajes con imágenes de hoteles
function ChatMessageContent({ content, role, onImageClick }) {
	// Solo procesar diseño enriquecido para el asistente
	if (role !== 'assistant') {
		return <div className="chat-bubble-content">{content}</div>;
	}

	const detectedHotels = detectHotelsInText(content).map((hotel) => ({
		...hotel,
		imageList: Object.values(hotel.images).filter(Boolean),
	}));
	const hasHotels = detectedHotels.length > 0;
	const lines = content.split('\n');

	const formatMarkdownLine = (line) =>
		line
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/__(.*?)__/g, '<strong>$1</strong>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/^\s*[-*]\s+/g, '• ')
			.replace(/#+\s*(.*)/g, '<strong>$1</strong>');

	return (
		<div className={`chat-bubble-content ${hasHotels ? 'chat-bubble-content--with-hotels' : ''}`}>
			<div className="chat-text-column">
				{lines.map((line, idx) => (
					<div
						key={`line-${idx}`}
						className="chat-message-text"
						dangerouslySetInnerHTML={{
							__html: formatMarkdownLine(line) || '<br />'
						}}
					/>
				))}
			</div>

			{hasHotels && (
				<div className="hotel-info-column">
					{detectedHotels.map((hotel, idx) => (
						<div key={`hotel-${idx}`} className="hotel-info-card">
							<div className="hotel-info-header">
								<span className="hotel-info-title">{hotel.name}</span>
								<button
									type="button"
									className="hotel-info-badge"
									onClick={() => onImageClick?.(hotel.name, hotel.imageList, 0)}
									aria-label={`Ver detalles e imágenes de ${hotel.name}`}
								>
									Detalles
								</button>
							</div>
							<div className="hotel-info-images">
								<img
									src={hotel.images.main}
									alt={`${hotel.name} - Imagen principal`}
									className="hotel-image hotel-image-main"
									onClick={() => onImageClick?.(hotel.name, hotel.imageList, 0)}
									onError={(e) => {
										e.target.style.display = 'none';
									}}
								/>
								<div className="hotel-info-thumbs">
									<img
										src={hotel.images.secondary1}
										alt={`${hotel.name} - Imagen 2`}
										className="hotel-image hotel-image-secondary"
										onClick={() => onImageClick?.(hotel.name, hotel.imageList, 1)}
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
									<img
										src={hotel.images.secondary2}
										alt={`${hotel.name} - Imagen 3`}
										className="hotel-image hotel-image-secondary"
										onClick={() => onImageClick?.(hotel.name, hotel.imageList, 2)}
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function BookingConnectIA({ agencyName = "{Nombre_agencia}" }) {
	const [message, setMessage] = useState("");
	const [welcomePrompt, setWelcomePrompt] = useState("");
	const [conversations, setConversations] = useState(() => loadConversations());
	const [activeId, setActiveId] = useState(() => loadActiveId());
	const [isChatStarted, setIsChatStarted] = useState(false);
	const [isResponding, setIsResponding] = useState(false);
	const [galleryModal, setGalleryModal] = useState({
		open: false,
		hotelName: "",
		images: [],
		activeIndex: 0,
	});
	const textareaRef = useRef(null);
	const welcomeTextareaRef = useRef(null);
	const messagesEndRef = useRef(null);
	const [agencyDisplayName, setAgencyDisplayName] = useState(agencyName);
	const prompts = [
		"{prompt-recomend-hoteles_location}",
		"{prompt-recomend-planes}",
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
		const intervalMs = 60 * 60 * 1000; // 1 hora
		const intervalId = setInterval(() => {
			if (typeof window !== "undefined") {
				window.location.reload();
			}
		}, intervalMs);
		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		if (!galleryModal.open) return;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				closeGalleryModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [galleryModal.open]);

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

	function openGalleryModal(hotelName, imagesArray = [], startIndex = 0) {
		const galleryImages = imagesArray.filter(Boolean);
		if (galleryImages.length === 0) return;
		const safeIndex = Number.isFinite(startIndex) && startIndex >= 0 && startIndex < galleryImages.length ? startIndex : 0;
		setGalleryModal({
			open: true,
			hotelName,
			images: galleryImages,
			activeIndex: safeIndex,
		});
	}

	function closeGalleryModal() {
		setGalleryModal((prev) => ({ ...prev, open: false }));
	}

	function goToPrevImage() {
		setGalleryModal((prev) => ({
			...prev,
			activeIndex: (prev.activeIndex - 1 + prev.images.length) % prev.images.length,
		}));
	}

	function goToNextImage() {
		setGalleryModal((prev) => ({
			...prev,
			activeIndex: (prev.activeIndex + 1) % prev.images.length,
		}));
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

		sendMessageToAPI(trimmed, activeId);
	}

	async function sendMessageToAPI(userContent, conversationId) {
		setIsResponding(true);
		
		try {
			// URL del endpoint
			const apiUrl = "https://bookingconnectia.gehsuitesapps.com/api/v1/llm/chat";
			
			// Preparar el cuerpo de la petición
			const requestBody = {
				message: userContent,
				conversationId: conversationId || generateId(),
			};

			// Hacer la petición al endpoint con autenticación
			const response = await fetchWithToken(apiUrl, {
				method: 'POST',
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
								<h2>Chat con LucIA</h2>
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
											<ChatMessageContent
												content={msg.content}
												role={msg.role}
												onImageClick={openGalleryModal}
											/>
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
			{galleryModal.open && (
				<div className="hotel-gallery-modal" role="dialog" aria-modal="true" aria-label={`Galería ${galleryModal.hotelName}`}>
					<div className="hotel-gallery-backdrop" onClick={closeGalleryModal} />
					<div className="hotel-gallery-content">
						<button className="hotel-gallery-close" onClick={closeGalleryModal} aria-label="Cerrar galería">
							×
						</button>
						<h3 className="hotel-gallery-title">{galleryModal.hotelName}</h3>
						<div className="hotel-gallery-image-wrapper">
							<button className="gallery-nav-btn" onClick={goToPrevImage} aria-label="Imagen anterior">
								‹
							</button>
							<img
								src={galleryModal.images[galleryModal.activeIndex]}
								alt={`${galleryModal.hotelName} - Imagen ${galleryModal.activeIndex + 1}`}
							/>
							<button className="gallery-nav-btn" onClick={goToNextImage} aria-label="Imagen siguiente">
								›
							</button>
						</div>
						<div className="hotel-gallery-thumbs">
							{galleryModal.images.map((img, idx) => (
								<button
									key={idx}
									className={`gallery-thumb ${idx === galleryModal.activeIndex ? "is-active" : ""}`}
									onClick={() =>
										setGalleryModal((prev) => ({
											...prev,
											activeIndex: idx,
										}))
									}
									aria-label={`Ver imagen ${idx + 1}`}
								>
									<img src={img} alt={`${galleryModal.hotelName} miniatura ${idx + 1}`} />
								</button>
							))}
						</div>
					</div>
				</div>
			)}
			<Tooltip 
				id="tooltip-booking-connect-info"
				className="custom-tooltip"
			/>
		</div>
	);
}


