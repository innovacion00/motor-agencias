export async function fetchWithAuth(url, option = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, // Añadir token a la cabecer de la app
    ...options.headers
  };


  const response = await fetch(url, {...option, headers});
  return response.json(); // Retorna respuesta variable

}

