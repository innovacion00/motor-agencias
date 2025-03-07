import { useState, useEffect } from "react";
import "../../public/styles/Header.css"; // Importa el archivo CSS

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userData, setUserData] = useState()
  const [profileImage, setprofileImage] = useState(userData?.imageUrl || "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Icono%20avatar.png")
  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    if(datosdelusuario){

      setUserData(JSON.parse(datosdelusuario));
    }
    
  }, [])

  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // Adjunta el archivo

 //#region Envio de imagen 
    try {
      const response = await fetch("https://gehsuitesapps.com/agencias/v1/files/user-profile", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${userData.token}`, // Se envía el token para autenticación
        },
      });

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setDropdownVisible(false);
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
        <a href="/">
          <img
            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/gehlogo.png"
            alt="GH Suites Logo"
          />
        </a>
      </div>
      <nav className="nav">
        <a href="/" className="reservations-link">Inicio</a>
        <a href="/misreservas" className="reservations-link">Gestionar reservas</a>
        <a href="/tablerousuario" className="reservations-link">Mi perfil</a>
        <div className="icons">
          <div className="profile-menu">
            <a href="/tablerousuario">
            <img
              src={userData?.imageUrl || profileImage}
              alt="UserIcon"
              id="profile-img"
              onClick={toggleDropdown}
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
