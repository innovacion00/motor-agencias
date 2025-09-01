import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import Swal from "sweetalert2";
import { refreshToken } from "../stores/authtoken";
import Cookies from "js-cookie";

const Configuracion = () => {
  const [userData, setUserData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [limiteUsuarios, setLimiteUsuarios] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    telefono: "",
    adminRole: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  //#region Use effect general
  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));

    setUserData(datosdelusuario);

    // Determinar el límite según la categoría
    if (datosdelusuario) {
      if (datosdelusuario.agencia.category == 0) {
        setLimiteUsuarios(10);
      } else {
        setLimiteUsuarios(20);
      }
    }
  }, []);
  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem("authToken");

    // Redirigir al usuario a la página de login
    window.location.href = "https://www.gehsuites.com/es";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si es un checkbox, usamos la propiedad checked en lugar de value
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.fullName ||
      !formData.password ||
      !formData.telefono
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, completa todos los campos",
      });
      return;
    }

    setIsLoading(true);
    const payload = {
      email: formData.email,
      fullName: formData.fullName,
      password: formData.password,
      telefono: formData.telefono,
      adminRole: formData.adminRole,
    };

    const fetchRegister = async (token) => {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/auth/register-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      return response;
    };

    try {
      let response = await fetchRegister(Cookies.get("accessToken"));

      if (response.status === 401) {
        // Intentar renovar el token
        const newToken = await refreshToken();
        if (newToken) {
          // Reintentar la petición con el nuevo token
          response = await fetchRegister(newToken);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar el usuario");
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Usuario registrado correctamente",
      });

      // Limpiar el formulario después de un registro exitoso
      setFormData({
        email: "",
        fullName: "",
        password: "",
        telefono: "",
        adminRole: false,
      });

      // Ocultar el formulario
      setShowForm(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error al registrar el usuario",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: "20px" }}>Tablero de usuario</h1>
      <br />
      <div className="header">
        <h1
          style={{
            fontSize: "18px",
            paddingBottom: "10px",
            fontFamily: "Roboto",
          }}
        >
          Configuración
        </h1>
      </div>
      <div className="nav-tabs">
        <a className="active" href="/tablerousuario">
          {" "}
          Mi perfíl{" "}
        </a>
        <a href="/misreservas">Gestionar reservas</a>
        {userData &&
          userData?.role &&
          userData?.role.includes("super-admin") && (
            <a href="/estadisticas">Análisis de datos</a>
          )}
        <a href="/configuracion">Configuración</a>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <div className="content">
        <div className="config-cards">
          <div id="gu" className="cardd" onClick={toggleForm}>
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/usericon.png"
              alt="Gestión de usuarios"
            />
            <h3>Gestión de usuarios</h3>
            <p>Administra usuarios: crea perfiles de manera sencilla.</p>
          </div>
          <div className="cardd">
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/configIcon.png"
              alt="Gestión de roles"
            />
            <h3>Gestión de roles</h3>
            <p>Muy pronto...</p>
            {/* <p>Configura roles personalizados: asigna permisos, crea, edita, consulta y elimina roles según tus necesidades.</p> */}
          </div>
          {/* <div className="cardd">
            <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/apiIcon.png" alt="Documentación del API" />
            <h3>Documentación de la API</h3>
            <p>Muy pronto ...</p>
            <p>Accede al código API para conectar nuestro portal de agencias directamente a tu sistema y optimiza tu gestión.</p>
          </div> */}
        </div>
        <br />
      </div>
      <div className="formUser">
        {showForm && (
          <div
            className="user-form-container"
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <h3>Registrar nuevo usuario</h3>
            <br />
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div className="form-group">
                <label htmlFor="email" style={{ paddingRight: "8px" }}>
                  Correo electrónico:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  style={{
                    width: "30%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName" style={{ paddingRight: "9px" }}>
                  Nombre completo:
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  style={{
                    width: "30%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" style={{ paddingRight: "55px" }}>
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  style={{
                    width: "30%",
                    padding: "10px",
                    paddingLeft: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono" style={{ paddingRight: "74px" }}>
                  Teléfono:
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+573001234567"
                  style={{
                    width: "30%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div
                className="form-group checkbox-container"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "5px",
                }}
              >
                <input
                  type="checkbox"
                  id="adminRole"
                  name="adminRole"
                  checked={formData.adminRole}
                  onChange={handleInputChange}
                  style={{ margin: "0" }}
                />
                <label htmlFor="adminRole" style={{ margin: "0" }}>
                  ¿Desea crear un usuario administrador?
                </label>
              </div>
              <label
                htmlFor="identificador"
                style={{ fontWeight: "light", fontSize: "12px" }}
              >
                El limite de usuarios permitidos para su agencia es de{" "}
                {limiteUsuarios}.
              </label>
              <div
                className="form-actions"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={toggleForm}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="registerbtn"
                  type="submit"
                  disabled={isLoading}
                  // style={{
                  //   padding: "10px 15px",
                  //   borderRadius: "4px",
                  //   border: "none",
                  //   backgroundColor: "#1C3D5A",
                  //   color: "white",
                  //   cursor: isLoading ? "not-allowed" : "pointer",
                  // }}
                >
                  {isLoading ? "Registrando..." : "Registrar usuario"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;
