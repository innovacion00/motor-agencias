import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';
import { toursData } from '../stores/InfoTours';
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
			main: "https://media-cdn.tripadvisor.com/media/photo-s/0f/d0/76/fd/recepcion.jpg",
			secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244634659.jpg?k=becae71ed93bcf69535c2704fb02e0d97a3e078e017b9356a7a3fcc6d60ca4ee&o=&hp=1",
			secondary2: "https://www.gehsuites.com/multimedia/galerias/1azuan360621.jpg",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244639436.jpg?k=6053b3890a7824a3f1a2e30cf862520be80de97644162b30a3e0097d920efafd&o=&hp=1",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/100688940.jpg?k=6feeec694af1e9a1ce62b699b7360999ec64c17ceb04536c99d43b5820585258&o=&hp=1",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/100688038.jpg?k=54490e2560d63e691c5d1cf6b009af33d7931f19ef58f69cfbadcc1d7d7b9e2e&o=&hp=1",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/244639401.jpg?k=5a15a41671ee0d3ee3adeca39f4fecc9e11da47a48cb3f9f8840645872114a43&o=&hp=1",
		},
		'aixo': {
			main: "https://images.trvl-media.com/lodging/22000000/21350000/21343600/21343503/e5e1ec59.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			secondary1: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/91/3c/59/hotel-aixo-suites.jpg?w=900&h=500&s=1",
			secondary2: "https://content.r9cdn.net/rimg/himg/b8/ae/29/expedia_group-3592701-148568847-621007.jpg?width=1200&height=630&crop=true",
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
			main: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f3/74/0f/hotel-marina-suites.jpg?w=900&h=500&s=1",
			secondary1: "https://images.trvl-media.com/lodging/9000000/8180000/8176000/8175916/5a828576.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			secondary2: "https://images.trvl-media.com/lodging/9000000/8180000/8176000/8175916/90226ae6.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
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
			main: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/84/50/7a/caption.jpg?w=500&h=400&s=1",
			secondary1: "https://rodadero-plaza-santa-marta.hotelinsantamarta.com/data/Images/OriginalPhoto/14062/1406283/1406283392/image-santa-marta-magdalena-hotel-rodadero-inn-by-geh-suites-6.JPEG",
			secondary2: "https://images.trvl-media.com/lodging/93000000/92340000/92332000/92331947/08cdfef1.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			extra1:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439332.webp?k=be9946ab62f0398843255b2a33a1145d955860e341f24ab15e3ce246d3ebbc40&o=",
			extra2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439308.webp?k=e119dab3708ce15ad454b328bebaf8b67c0badac44f046676d5e9bc4035d26da&o=",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439333.webp?k=867e3a6be58a64ccc40ab9484fd8ce06f78e67024f6b842c9d86554d345f5e58&o=",
			extra4:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439330.webp?k=8f3d063550a4618c4990bd8a749429a7403c921a57039861d3ed71526fe854eb&o=",
		},
		'axis': {
			main: "https://images.trvl-media.com/lodging/110000000/109790000/109789900/109789860/9770b3b0.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Lobbyaxis.jpeg",
			secondary2: "https://images.trvl-media.com/lodging/110000000/109790000/109789900/109789860/f7ca1d32.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			extra1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Doble-axis.jpeg",
			extra2:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-axis2.jpeg",
			extra3:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/109098049.jpg?k=d28963d3d5f71aa4e6fcc2e3864341d453c8d5bd2aeb8875caaf92d9e9b6c63a&o=",
			extra4:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Familiar-axis.jpeg",
		},
		'sansiraka': {
			main: "https://www.gehsuites.com/recursos/imagenes/hotels/hotel-sansiraka.jpg",
			secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/535990853.jpg?k=15f0dd4cc6a6e4d3eb35cae6b196c8bab43f3734514a24a24f5f29415e8575ce&o=&hp=1",
			secondary2: "https://images.trvl-media.com/lodging/12000000/11580000/11573100/11573048/45f4876b.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			extra1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Doble-sansiraka.jpeg",
			extra2:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-sansiraka.jpeg",
			extra3:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacon-cuaruple-sansiraka2.jpeg",
			extra4:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/Ba%C3%B1o-sansiraka.jpeg",
		},
		'windsor': {
			main: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471546979.jpg?k=d8af789ce5ae7619f846087d236503aad8ca8fe7cc4117382827afc4ab346b83&o=",
			secondary1: "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/9ead703d.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			secondary2: "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/w5093h2997x0y85-e99f7444.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
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
		'salguero': {
			main:"hhttps://space-img.sfo3.digitaloceanspaces.com/Agencias/lobby_salguero.jpg",
			secondary1:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/piscina_salguero.jpg",
			secondary2:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/760635528.jpg?k=eae7d2b151be1dd3e530c9adf256f197cd2380ff8cc8b8236f2197955f1a5681&o=",
			
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
		{patterns:  ['Hotel Playa Salguero', 'Salguero', 'salguero'], canonical: 'Playa salguero Hotel'}
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

// Función para obtener imágenes de tours por número
function getTourImagesByNumber(tourNumber) {
	const tour = toursData.find(t => t.id === tourNumber);
	if (!tour || !tour.images) return null;
	
	return {
		main: tour.images.main || null,
		secondary1: tour.images.side1 || null,
		secondary2: tour.images.side2 || null,
	};
}

// Función para detectar tours mencionados en el texto
function detectToursInText(text) {
	const detectedTours = [];
	const foundTourNumbers = new Set();
	
	// Buscar patrones como "Tour 1", "Tour 2", etc. hasta "Tour 14"
	for (let i = 1; i <= 14; i++) {
		if (foundTourNumbers.has(i)) continue; // Evitar duplicados
		
		const patterns = [
			`Tour ${i}`,
			`tour ${i}`,
			`TOUR ${i}`,
		];
		
		for (const pattern of patterns) {
			const regex = new RegExp(`\\b${pattern.replace(/\s+/g, '\\s+')}\\b`, 'gi');
			if (regex.test(text)) {
				const images = getTourImagesByNumber(i);
				if (images) {
					foundTourNumbers.add(i);
					const tour = toursData.find(t => t.id === i);
					detectedTours.push({
						number: i,
						name: tour?.title || `Tour ${i}`,
						images: images
					});
				}
				break; // Si encontramos el tour, no necesitamos buscar más patrones
			}
		}
	}
	
	return detectedTours;
}

// Contenido enriquecido solo para mensajes del asistente
function AssistantMessageContent({ content, onImageClick }) {
	const [openOptions, setOpenOptions] = useState({});

	const detectedHotels = detectHotelsInText(content).map((hotel) => ({
		...hotel,
		imageList: Object.values(hotel.images).filter(Boolean),
	}));
	const detectedTours = detectToursInText(content).map((tour) => ({
		...tour,
		imageList: Object.values(tour.images).filter(Boolean),
	}));
	const hasHotels = detectedHotels.length > 0;
	const hasTours = detectedTours.length > 0;
	const hasContent = hasHotels || hasTours;
	const lines = content.split('\n');
	
	// Frases que activan el botón "Ir a mis reservas"
	const reservaPhrases = [
		'reserva creada',
		'reserva completada',
		'reservada exitosa',
		'reserva exitosa',
		'reserva realizada',
		'reserva confirmada',
		'reserva procesada',
		'reserva finalizada'

	];
	
	// Frases que activan el botón "Ir a mis cotizaciones"
	const cotizacionPhrases = [
		'acceso a la cotización',
		'link de la cotización',
		'link de la cotizacion',
		'acceso a la cotizacion'
	];
	
	// Detectar si el contenido contiene alguna de las frases de reserva
	const hasReservaCreada = reservaPhrases.some(phrase => {
		// Crear una expresión regular flexible que permita espacios variables
		const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
		return regex.test(content);
	});

	// Detectar si el contenido contiene alguna de las frases de cotización
	const hasCotizacionCreada = cotizacionPhrases.some(phrase => {
		// Crear una expresión regular flexible que permita espacios variables
		const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
		return regex.test(content);
	});

	const toggleOption = (optionKey) => {
		setOpenOptions((prev) => ({
			...prev,
			[optionKey]: !prev[optionKey],
		}));
	};

	// Cualquier línea que comience con "1)", "2)", etc. será tratada como opción colapsable
	const optionHeaderRegex = /^\s*(\d+)\)\s*/i;

	// Agrupar líneas en bloques normales y bloques de "Opción X)"
	const parsedBlocks = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const headerMatch = line.match(optionHeaderRegex);

		if (headerMatch) {
			const optionNumber = headerMatch[1];
			const details = [];
			let j = i + 1;

			while (j < lines.length) {
				const nextLine = lines[j];
				// Si encontramos otra opción, detenemos el bloque actual
				if (optionHeaderRegex.test(nextLine)) {
					break;
				}
				// Cortar el bloque al primer salto de línea en blanco,
				// pero lo incluimos para mantener el espaciado
				if (nextLine.trim() === '') {
					details.push(nextLine);
					j++;
					break;
				}
				details.push(nextLine);
				j++;
			}

			parsedBlocks.push({
				type: 'option',
				optionKey: optionNumber,
				header: line,
				details,
			});

			i = j - 1; // Ajustar índice principal
		} else {
			parsedBlocks.push({
				type: 'line',
				line,
			});
		}
	}

	const formatMarkdownLine = (line) =>
		line
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/__(.*?)__/g, '<strong>$1</strong>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/^\s*[-*]\s+/g, '• ')
			.replace(/#+\s*(.*)/g, '<strong>$1</strong>');

	return (
		<div className={`chat-bubble-content ${hasContent ? 'chat-bubble-content--with-hotels' : ''}`}>
			<div className="chat-text-column">
				{parsedBlocks.map((block, idx) => {
					if (block.type === 'line') {
						return (
							<div
								key={`line-${idx}`}
								className="chat-message-text"
								dangerouslySetInnerHTML={{
									__html: formatMarkdownLine(block.line) || '<br />'
								}}
							/>
						);
					}

					const isOpen = !!openOptions[block.optionKey];

					return (
						<div
							key={`option-${idx}`}
							className="chat-option-block"
							style={{ marginBottom: '4px' }}
						>
							<button
								type="button"
								onClick={() => toggleOption(block.optionKey)}
								className="chat-option-header"
								style={{
									background: 'transparent',
									border: 'none',
									padding: 0,
									margin: 0,
									color: 'inherit',
									textAlign: 'left',
									cursor: 'pointer',
									font: 'inherit',
									display: 'inline-flex',
									alignItems: 'center',
								}}
							>
								<span
									className="chat-message-text"
									dangerouslySetInnerHTML={{
										__html: formatMarkdownLine(block.header) || '&nbsp;'
									}}
								/>
								<span
									className="chat-option-toggle-indicator"
									style={{ marginLeft: '8px', fontWeight: 600 }}
								>
									{isOpen ? '−' : '+'}
								</span>
							</button>
							{isOpen && (
								<div
									className="chat-option-details"
									style={{ marginTop: '4px', paddingLeft: '8px' }}
								>
									{block.details.map((detailLine, detailIdx) => (
										<div
											key={`option-${idx}-detail-${detailIdx}`}
											className="chat-message-text"
											dangerouslySetInnerHTML={{
												__html: formatMarkdownLine(detailLine) || '<br />'
											}}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
				{hasReservaCreada && (
					<div style={{ marginTop: '16px' }}>
						<a 
							href="/misreservas" 
							className="reserva-button"
							style={{
								display: 'inline-block',
								padding: '10px 20px',
								backgroundColor: '#1c3d5a',
								color: '#ffffff',
								textDecoration: 'none',
								borderRadius: '12px',
								fontWeight: '600',
								fontSize: '14px',
								transition: 'all 0.2s ease',
								cursor: 'pointer'
							}}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#264b74';
								e.target.style.transform = 'translateY(-1px)';
								e.target.style.boxShadow = '0 4px 12px rgba(28, 61, 90, 0.3)';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = '#1c3d5a';
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = 'none';
							}}
						>
							Ir a mis reservas
						</a>
					</div>
				)}
				{hasCotizacionCreada && (
					<div style={{ marginTop: '16px' }}>
						<a 
							href="/cotizaciones" 
							className="cotizacion-button"
							style={{
								display: 'inline-block',
								padding: '10px 20px',
								backgroundColor: '#1c3d5a',
								color: '#ffffff',
								textDecoration: 'none',
								borderRadius: '12px',
								fontWeight: '600',
								fontSize: '14px',
								transition: 'all 0.2s ease',
								cursor: 'pointer'
							}}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#264b74';
								e.target.style.transform = 'translateY(-1px)';
								e.target.style.boxShadow = '0 4px 12px rgba(28, 61, 90, 0.3)';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = '#1c3d5a';
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = 'none';
							}}
						>
							Ver mis cotizaciones 
						</a>
					</div>
				)}
			</div>

			{hasContent && (
				<div className="hotel-info-column">
					{/* Mostrar hoteles */}
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
					
					{/* Mostrar tours */}
					{detectedTours.map((tour, idx) => (
						<div key={`tour-${idx}`} className="hotel-info-card">
							<div className="hotel-info-header">
								<span className="hotel-info-title">{tour.name}</span>
								<button
									type="button"
									className="hotel-info-badge"
									onClick={() => onImageClick?.(tour.name, tour.imageList, 0)}
									aria-label={`Ver detalles e imágenes de ${tour.name}`}
								>
									Detalles
								</button>
							</div>
							<div className="hotel-info-images">
								<img
									src={tour.images.main}
									alt={`${tour.name} - Imagen principal`}
									className="hotel-image hotel-image-main"
									onClick={() => onImageClick?.(tour.name, tour.imageList, 0)}
									onError={(e) => {
										e.target.style.display = 'none';
									}}
								/>
								<div className="hotel-info-thumbs">
									<img
										src={tour.images.secondary1}
										alt={`${tour.name} - Imagen 2`}
										className="hotel-image hotel-image-secondary"
										onClick={() => onImageClick?.(tour.name, tour.imageList, 1)}
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
									<img
										src={tour.images.secondary2}
										alt={`${tour.name} - Imagen 3`}
										className="hotel-image hotel-image-secondary"
										onClick={() => onImageClick?.(tour.name, tour.imageList, 2)}
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

// Componente para renderizar mensajes con imágenes de hoteles
function ChatMessageContent({ content, role, onImageClick }) {
	// Solo procesar diseño enriquecido para el asistente
	if (role !== 'assistant') {
		return <div className="chat-bubble-content">{content}</div>;
	}

	return (
		<AssistantMessageContent
			content={content}
			onImageClick={onImageClick}
		/>
	);
}

export default function BookingConnectIA({ agencyName = "{Nombre_agencia}" }) {
	const [message, setMessage] = useState("");
	const [welcomePrompt, setWelcomePrompt] = useState("");
	// Inicializar con valores por defecto para evitar problemas de hidratación
	const [conversations, setConversations] = useState([]);
	const [activeId, setActiveId] = useState("");
	const [isChatStarted, setIsChatStarted] = useState(false);
	const [isResponding, setIsResponding] = useState(false);
	const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
	const [galleryModal, setGalleryModal] = useState({
		open: false,
		hotelName: "",
		images: [],
		activeIndex: 0,
	});
	const textareaRef = useRef(null);
	const welcomeTextareaRef = useRef(null);
	const messagesEndRef = useRef(null);
	const loadingIntervalRef = useRef(null);
	const [agencyDisplayName, setAgencyDisplayName] = useState(agencyName);
	const [isMounted, setIsMounted] = useState(false);
	const prompts = [
		"{prompt-recomend-hoteles_location}",
		"{prompt-recomend-planes}",
		"{prompt-Hoteles-SantaMarta}",
		"{prompt-Hoteles-Cartagena}",
		"{prompt-Hoteles-Bogota}",
	];

	const loadingMessages = [
		"Espera unos segundos, estoy consultando la disponibilidad...",
		"Estoy haciendo la consulta lo más rápido posible...",
		"Analizando tarifas y tipos de habitación para tu búsqueda...",
		"Encontrando las mejores opciones y similitudes para ti...",
		"Verificando políticas y condiciones de tu reserva...",
		"Organizando la información para darte una respuesta clara..."
	];

	// Configuración de prompts: mapea el placeholder al texto del botón y al prompt real
	const promptConfig = {
		"{prompt-recomend-hoteles_location}": {
			buttonText: "Ciudades disponibles",
			realPrompt: "Hola lucIA! en que hoteles tienes disponibilidad que me puedas ofrecer"
		},
		"{prompt-recomend-planes}": {
			buttonText: "Planes touristicos dispnibles",
			realPrompt: "Hola LucIA! puedes decirme que toures tienes disponibles Cartagena?"
		},
		"{prompt-Hoteles-SantaMarta}": {
			buttonText: "Santa Marta",
			realPrompt: "Hola LucIA! puedes decirme informacion y que hoteles tienes disponibles en Santa Marta ?"
		},
		"{prompt-Hoteles-Cartagena}": {
			buttonText: "Cartagena",
			realPrompt: "Hola LucIA! puedes decirme informacion y que hoteles tienes disponibles en Cartagena ?"
		},
		"{prompt-Hoteles-Bogota}": {
			buttonText: "Bogota",
			realPrompt: "hola LucIA! puedes decirme informacion y que hoteles tienes disponibles en Bogota ?"
		}
	};

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

	// Cargar datos del localStorage solo después del montaje para evitar problemas de hidratación
	useEffect(() => {
		setIsMounted(true);
		// Cargar conversaciones y activeId del localStorage
		const loadedConversations = loadConversations();
		const loadedActiveId = loadActiveId();
		
		if (loadedConversations.length > 0) {
			setConversations(loadedConversations);
			// Establecer activeId
			if (loadedActiveId && loadedConversations.some(conv => conv.id === loadedActiveId)) {
				setActiveId(loadedActiveId);
			} else {
				// Si el activeId no existe o no es válido, usar la primera conversación
				setActiveId(loadedConversations[0].id);
			}
		} else {
			// Si no hay conversaciones, crear una nueva
			const id = generateId();
			const newConversation = {
				id,
				title: "Nuevo chat",
				messages: [],
			};
			setConversations([newConversation]);
			setActiveId(id);
		}
		
		// Cargar nombre de agencia
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
		// Solo guardar si el componente está montado
		if (isMounted) {
			saveConversations(conversations);
		}
	}, [conversations, isMounted]);

	useEffect(() => {
		// Solo guardar si el componente está montado
		if (isMounted) {
			saveActiveId(activeId);
		}
	}, [activeId, isMounted]);

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
		// Solo ejecutar después de que el componente esté montado y los datos cargados
		if (!isMounted || conversations.length === 0) return;
		
		// Verificar si el activeId existe en las conversaciones
		const exists = conversations.some((conv) => conv.id === activeId);
		if (!exists && activeId) {
			// Si el activeId no existe, usar la primera conversación
			setActiveId(conversations[0].id);
		} else if (exists) {
			// Actualizar el estado de isChatStarted basado en la conversación activa
			setIsChatStarted((activeConversation?.messages.length || 0) > 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted, conversations, activeId]);

	useEffect(() => {
		// Gestionar los mensajes dinámicos de "cargando" mientras el asistente responde
		if (!isResponding) {
			setLoadingMessageIndex(0);
			if (loadingIntervalRef.current) {
				clearInterval(loadingIntervalRef.current);
				loadingIntervalRef.current = null;
			}
			return;
		}

		// Reiniciar al primer mensaje cada vez que empieza una nueva respuesta
		setLoadingMessageIndex(0);

		const intervalId = setInterval(() => {
			setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
		}, 9200);

		loadingIntervalRef.current = intervalId;

		return () => {
			clearInterval(intervalId);
			loadingIntervalRef.current = null;
		};
	}, [isResponding, loadingMessages.length]);

	function autoResize(ref) {
		const el = ref.current;
		if (!el) return;
		el.style.height = "0px";
		const next = Math.min(el.scrollHeight, 200);
		el.style.height = `${next}px`;
	}
	
	function forceResize(ref) {
		const el = ref.current;
		if (!el) return;
		// Forzar el resize sin límite para mostrar todo el contenido
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
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

		sendMessageToAPI(trimmed);
	}

	async function sendMessageToAPI(userContent) {
		setIsResponding(true);
		
		try {
			const apiUrl = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/integrations/chat`;
			const requestBody = { message: userContent };

			const response = await fetchWithToken(apiUrl, {
				method: "POST",
				body: JSON.stringify(requestBody),
			});

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					data?.message || `Error: ${response.status} ${response.statusText}`
				);
			}

			if (!data?.ok || typeof data.reply !== "string") {
				throw new Error(data?.message || "Respuesta del servidor en formato incorrecto");
			}

			const assistantMessage = {
				role: "assistant",
				content: data.reply,
			};

			updateActiveConversation((conv) => ({
				...conv,
				...(data.conversationId ? { serverConversationId: data.conversationId } : {}),
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

	function handleReservaRapida() {
		const reservaRapidaText = 
		'Hola me gustaria crear una reserva.\ndia  checkin:  y dia de checkout:  mes: \naño: \nhotel: \nnumero de personas:  \nnombre del titular:  \ntipo de documento: \nnumero de documento:  \nfecha de nacimiento: \ncorreo:  \ntelefono:+57  \nTipo de habitacion preferida: ';
		
		if (!isChatStarted) {
			setWelcomePrompt(reservaRapidaText);
			// Usar setTimeout para asegurar que React haya actualizado el DOM
			setTimeout(() => {
				forceResize(welcomeTextareaRef);
				// Enfocar el textarea
				if (welcomeTextareaRef.current) {
					welcomeTextareaRef.current.focus();
					// Colocar el cursor al final
					const length = reservaRapidaText.length;
					welcomeTextareaRef.current.setSelectionRange(length, length);
				}
			}, 0);
		} else {
			setMessage(reservaRapidaText);
			// Usar setTimeout para asegurar que React haya actualizado el DOM
			setTimeout(() => {
				forceResize(textareaRef);
				// Enfocar el textarea
				if (textareaRef.current) {
					textareaRef.current.focus();
					// Colocar el cursor al final
					const length = reservaRapidaText.length;
					textareaRef.current.setSelectionRange(length, length);
				}
			}, 0);
		}
	}

	function handleCotizacionRapida() {
		const cotizacionRapidaText = 'Hola me gustaria crear una cotización.\ndia  checkin:  y dia de checkout:  mes: \naño: \nhotel: \nnumero de personas:  \nnombre del titular:  \ntipo de documento: \nnumero de documento:  \nfecha de nacimiento: \ncorreo:  \ntelefono:+57  \nTipo de habitacion preferida: ';
		
		if (!isChatStarted) {
			setWelcomePrompt(cotizacionRapidaText);
			// Usar setTimeout para asegurar que React haya actualizado el DOM
			setTimeout(() => {
				forceResize(welcomeTextareaRef);
				// Enfocar el textarea
				if (welcomeTextareaRef.current) {
					welcomeTextareaRef.current.focus();
					// Colocar el cursor al final
					const length = cotizacionRapidaText.length;
					welcomeTextareaRef.current.setSelectionRange(length, length);
				}
			}, 0);
		} else {
			setMessage(cotizacionRapidaText);
			// Usar setTimeout para asegurar que React haya actualizado el DOM
			setTimeout(() => {
				forceResize(textareaRef);
				// Enfocar el textarea
				if (textareaRef.current) {
					textareaRef.current.focus();
					// Colocar el cursor al final
					const length = cotizacionRapidaText.length;
					textareaRef.current.setSelectionRange(length, length);
				}
			}, 0);
		}
	}

	function handlePromptClick(prompt) {
		// Obtener el prompt real desde la configuración, o usar el prompt original si no existe
		const config = promptConfig[prompt];
		const realPrompt = config ? config.realPrompt : prompt;
		
		if (!isChatStarted) {
			sendMessage(realPrompt, true);
			return;
		}
		sendMessage(realPrompt, false);
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
							data-tooltip-content="LucIA es la nueva herramienta de inteligencia artificial para agencias. Te brinda información sobre disponibilidad y planes, permite reservar, cotizar y cancelar reservas de BookingConnect."
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
					{/* <div className="menu-item">
						<svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
						</svg>
						<span>Biblioteca</span>
					</div> */}
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
									<div
										className="history-item-delete"
										role="button"
										tabIndex={0}
										aria-label="Eliminar chat"
										onClick={(evt) => {
											evt.stopPropagation();
											handleDeleteConversation(conv.id, evt);
										}}
										onKeyDown={(evt) => {
											if (evt.key === 'Enter' || evt.key === ' ') {
												evt.preventDefault();
												evt.stopPropagation();
												handleDeleteConversation(conv.id, evt);
											}
										}}
										title="Eliminar chat"
									>
										<FontAwesomeIcon icon={faTrash} />
									</div>
								</button>
							))}
						</div>
					</div>
				</aside>

				<main className={`main-content${isChatStarted ? " has-chat" : ""}`}>
					{!isChatStarted ? (
						<div className="container">
							<h2>
								Hola {agencyDisplayName}, de parte de Geh Suites <br />¿En que podemos ayudarte hoy?
							</h2>
							<div className="input-box">
								<textarea
									ref={welcomeTextareaRef}
									placeholder="Escribe un mensaje a LucIA"
									maxLength={5000}
									value={welcomePrompt}
									onChange={handleWelcomeChange}
									onKeyDown={onWelcomeKeyDown}
									rows={1}
									spellCheck={false}
								/>
							</div>
							<div className="welcome-hint">Enter para enviar • Shift+Enter para salto de línea</div>
							<button 
								className="enviar-button"
								onClick={() => sendMessage(welcomePrompt, true)}
								disabled={!welcomePrompt.trim()}
								style={{
									backgroundColor: '#1c3d5a',
									color: '#ffffff',
									border: 'none',
									borderRadius: '12px',
									padding: '12px 24px',
									fontSize: '15px',
									fontWeight: '600',
									cursor: welcomePrompt.trim() ? 'pointer' : 'not-allowed',
									transition: 'all 0.3s ease',
									width: '100%',
									marginBottom: '12px',
									boxShadow: '0 4px 12px rgba(28, 61, 90, 0.2)',
									opacity: welcomePrompt.trim() ? 1 : 0.6,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px'
								}}
								onMouseEnter={(e) => {
									if (welcomePrompt.trim()) {
										e.target.style.backgroundColor = '#264b74';
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 6px 16px rgba(28, 61, 90, 0.3)';
									}
								}}
								onMouseLeave={(e) => {
									if (welcomePrompt.trim()) {
										e.target.style.backgroundColor = '#1c3d5a';
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 4px 12px rgba(28, 61, 90, 0.2)';
									}
								}}
							>
								Enviar
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
								</svg>
							</button>
							<div className="button-group" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
								<button 
									className="reserva-rapida-button"
									onClick={handleReservaRapida}
									style={{
										backgroundColor: '#1c3d5a',
										color: '#ffffff',
										border: 'none',
										borderRadius: '12px',
										padding: '12px 24px',
										fontSize: '15px',
										fontWeight: '600',
										cursor: 'pointer',
										transition: 'all 0.3s ease',
										flex: '1',
										boxShadow: '0 4px 12px rgba(28, 61, 90, 0.2)'
									}}
									onMouseEnter={(e) => {
										e.target.style.backgroundColor = '#264b74';
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 6px 16px rgba(28, 61, 90, 0.3)';
									}}
									onMouseLeave={(e) => {
										e.target.style.backgroundColor = '#1c3d5a';
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 4px 12px rgba(28, 61, 90, 0.2)';
									}}
								>
									Reserva rápida
								</button>
								<button 
									className="cotizacion-rapida-button"
									onClick={handleCotizacionRapida}
									style={{
										backgroundColor: '#1c3d5a',
										color: '#ffffff',
										border: 'none',
										borderRadius: '12px',
										padding: '12px 24px',
										fontSize: '15px',
										fontWeight: '600',
										cursor: 'pointer',
										transition: 'all 0.3s ease',
										flex: '1',
										boxShadow: '0 4px 12px rgba(28, 61, 90, 0.2)'
									}}
									onMouseEnter={(e) => {
										e.target.style.backgroundColor = '#264b74';
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 6px 16px rgba(28, 61, 90, 0.3)';
									}}
									onMouseLeave={(e) => {
										e.target.style.backgroundColor = '#1c3d5a';
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 4px 12px rgba(28, 61, 90, 0.2)';
									}}
								>
									Cotización rápida
								</button>
							</div>
							<div className="button-group">
								{prompts.map((prompt) => {
									const config = promptConfig[prompt];
									const buttonText = config ? config.buttonText : prompt;
									return (
										<button key={prompt} onClick={() => handlePromptClick(prompt)}>
											{buttonText}
										</button>
									);
								})}
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
											<div className="chat-typing-text">
												{loadingMessages[loadingMessageIndex]}
											</div>
											<div className="chat-typing-spinner" aria-hidden="true" />
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
									// spellCheck={false} // deshabilitar la corrección ortográfica
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


