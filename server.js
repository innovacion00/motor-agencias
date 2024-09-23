// Importamos los módulos necesarios.
const express = require('express'); // Framework de Node.js para manejar rutas y solicitudes HTTP.
const mongoose = require('mongoose'); // Módulo para interactuar con MongoDB.
const bodyParser = require('body-parser'); // Middleware para parsear el cuerpo de las solicitudes.
const cors = require('cors'); // Middleware para habilitar CORS, permitiendo que el frontend pueda interactuar con el servidor.

// Inicializamos la aplicación Express.
const app = express();

// Configuramos el middleware para que Express pueda parsear JSON y manejar CORS.
app.use(bodyParser.json()); // Permite que el servidor entienda solicitudes con cuerpo en formato JSON.
app.use(cors()); // Habilita CORS para que se puedan hacer solicitudes desde diferentes orígenes.

// Conectamos con la base de datos de MongoDB.
mongoose.connect('mongodb://localhost:27017/tu_basededatos', {
    useNewUrlParser: true, // Utiliza el nuevo analizador de URL de MongoDB.
    useUnifiedTopology: true, // Utiliza el nuevo motor de gestión de conexiones de MongoDB.
})
    .then(() => console.log('Conectado a MongoDB')) // Mensaje que indica que la conexión fue exitosa.
    .catch(err => console.error('Error al conectar con MongoDB', err)); // Muestra un mensaje de error si no se pudo conectar.

// Definimos un esquema y modelo para los usuarios en MongoDB.
const userSchema = new mongoose.Schema({
    email: String, // Campo para almacenar el correo electrónico del usuario.
    password: String, // Campo para almacenar la contraseña del usuario.
});

const User = mongoose.model('User', userSchema); // Creamos el modelo 'User' basado en el esquema definido.

// Definimos la ruta para el inicio de sesión.
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Extraemos el correo electrónico y la contraseña del cuerpo de la solicitud.
    
    try {
        // Buscamos un usuario en la base de datos que coincida con el correo electrónico y la contraseña proporcionados.
        const user = await User.findOne({ email, password });
        
        // Si se encuentra un usuario, enviamos una respuesta de éxito.
        if (user) {
            res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            // Si no se encuentra un usuario, enviamos una respuesta de error.
            res.status(400).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        // En caso de error, enviamos una respuesta de error.
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Iniciamos el servidor en el puerto 3000.
const PORT = process.env.PORT || 3000; // El servidor usará el puerto 3000 o un puerto definido en las variables de entorno.
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`); // Mensaje que indica que el servidor está funcionando.
});
