import { useState, useEffect } from "react";
import { refreshToken } from "../stores/authtoken";
import Cookies from "js-cookie";
import "../../public/styles/Header.css"; // Importa el archivo CSS

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState()
  const [profileImage, setprofileImage] = useState(userData?.imageUrl || "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Icono%20avatar.png")
  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    if(datosdelusuario){

      setUserData((datosdelusuario));
    }
    
  }, [])

  const fetchWithToken = async (url, options = {}) => {
    let token = Cookies.get('accessToken');
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          }
        });
      }
    }
    return response;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // Adjunta el archivo

 //#region Envio de imagen 
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/files/user-profile`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();

      if (data.url) {
        // 1️⃣ Actualiza la imagen en el estado
      setprofileImage(data.url);
       // 2️⃣ Actualiza el localStorage
       const updatedUserData = { ...userData, imageUrl: data.url };
       localStorage.setItem("datosUsuario", JSON.stringify(updatedUserData));
 
       // 3️⃣ Refresca el estado global de userData si se usa con useContext o un store
       setUserData(updatedUserData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "https://www.gehsuites.com/es";
  };

  const handleUserDashboard = () => {
    window.location.href = "/tablerousuario";
  };

  const handleClick = () => {
    localStorage.removeItem("datosDelVuelo");
    localStorage.removeItem("dataVuelo");
    localStorage.removeItem("datosReservaVuelos");
    localStorage.removeItem("cantAdultos");
    localStorage.removeItem("cantNinos");
    localStorage.removeItem("nochesyedades");
    localStorage.removeItem("datosreserva");
    localStorage.removeItem("data");
    // console.log("datos");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setDropdownVisible(false);
      }
      if (!event.target.closest(".mobile-nav-wrapper")) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <a href="/" onClick={handleClick}>
          <img
            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/gehlogo.png"
            alt="GH Suites Logo"
          />
        </a>
      </div>
      <nav className="nav">
        <div className="desktop-links">
          <a href="/" className="reservations-link">Inicio</a>
          <a href="/misreservas" className="reservations-link">Gestionar reservas</a>
          <a href="/cotizaciones" className="reservations-link">Cotizaciones</a>
          <a href="/tablerousuario" className="reservations-link">Mi perfil</a>
          <a href="/eventos" className="reservations-link">Eventos</a>
        </div>

        <div className="mobile-nav-wrapper">
          <button
            className="hamburger-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <a href="/" className="reservations-link">Inicio</a>
              <a href="/misreservas" className="reservations-link">Gestionar reservas</a>
              <a href="/cotizaciones" className="reservations-link">Cotizaciones</a>
              <a href="/tablerousuario" className="reservations-link">Mi perfil</a>
              <a href="/eventos" className="reservations-link">Eventos</a>
            </div>
          )}
        </div>
        
        <div className="icons">
          <div className="profile-menu">
            <a href="/tablerousuario">
            <img
              src={userData?.imageUrl || profileImage}
              alt="UserIcon"
              id="profile-img"
              // onClick={toggleDropdown}
            />
            </a>
            {dropdownVisible && (
              <div className="dropdown-content">
                <button onClick={handleLogout}>Cerrar sesión</button>
                <button onClick={handleUserDashboard}>Mi perfil</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
