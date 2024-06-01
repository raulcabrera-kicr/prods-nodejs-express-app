/*
Resumen de la aplicación:
Esta aplicación es una API web desarrollada con Node.js utilizando el framework Express. 
Se conecta a una base de datos MongoDB utilizando Mongoose para gestionar la persistencia de datos.
La API permite guardar y recuperar información de usuarios y sus productos asociados.
Se utilizan las siguientes tecnologías:
- Express: Framework web para Node.js.
- Mongoose: Biblioteca para modelado de datos y conexión a MongoDB.
- body-parser: Middleware para parsear el cuerpo de las solicitudes HTTP.
- CORS: Middleware para permitir el intercambio de recursos entre diferentes orígenes.
*/

// Importación de dependencias necesarias
const express = require('express'); // Framework web para Node.js
const mongoose = require('mongoose'); // Biblioteca para trabajar con MongoDB
const bodyParser = require('body-parser'); // Middleware para parsear el cuerpo de las solicitudes
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)

// Configuración de la aplicación
const app = express(); // Creación de la aplicación Express
app.use(cors()); // Habilitar CORS para todas las solicitudes
app.use(bodyParser.json()); // Parsear el cuerpo de las solicitudes como JSON

// Conexión a MongoDB
mongoose.connect('mongodb+srv://ucn:Ucn.123@test.cwsozmy.mongodb.net/?retryWrites=true&w=majority&appName=test', {
  useNewUrlParser: true, // Uso del nuevo parser de URL de MongoDB
  useUnifiedTopology: true, // Uso del nuevo motor de administración de conexiones unificadas
});

const db = mongoose.connection; // Obtener la conexión de MongoDB
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:')); // Manejo de errores de conexión
db.once('open', () => {
  console.log('Conectado a MongoDB'); // Mensaje al conectar exitosamente
});

// Esquema y modelo de Mongoose
const productoSchema = new mongoose.Schema({ // Definición del esquema para los productos
  codigo: String,
  nombre: String,
  cantidad: String,
  valorUnidad: Number,
  valorTotal: Number,
});

const usuarioSchema = new mongoose.Schema({ // Definición del esquema para los usuarios
  identificacion: String,
  nombres: String,
  apellidos: String,
  ciudad: String,
  direccion: String,
  celular: String,
  productos: [productoSchema], // Un usuario puede tener varios productos
  total: Number,
});

// Middleware para calcular el total antes de guardar un usuario
usuarioSchema.pre('save', function(next) {
  // Calcula valorTotal para cada producto
  this.productos.forEach(producto => {
    producto.valorTotal = producto.cantidad * producto.valorUnidad;
  });

  // Calcula el total para el usuario
  this.total = this.productos.reduce((sum, producto) => sum + producto.valorTotal, 0);

  next(); // Procede con la operación de guardado
});

const Usuario = mongoose.model('Usuario', usuarioSchema); // Creación del modelo de Mongoose basado en el esquema

// Endpoint para guardar el JSON
app.post('/productos/guardar', async (req, res) => {
  const usuario = new Usuario(req.body); // Crear una nueva instancia de Usuario con los datos recibidos
  try {
    const savedUsuario = await usuario.save(); // Guardar el usuario en la base de datos
    res.status(200).send(savedUsuario); // Responder con el usuario guardado
  } catch (err) {
    res.status(400).send(err); // Manejo de errores
  }
});

// Endpoint para obtener el JSON basado en la identificación
app.get('/productos/obtener/:identificacion', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ identificacion: req.params.identificacion }); // Buscar un usuario por identificación
    if (usuario) {
      res.status(200).send(usuario); // Responder con el usuario encontrado
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' }); // Manejo de usuario no encontrado
    }
  } catch (err) {
    res.status(400).send(err); // Manejo de errores
  }
});

// Endpoint para obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, 'productos'); // Buscar todos los usuarios y devolver solo sus productos
    res.status(200).send(usuarios); // Responder con los productos encontrados
  } catch (err) {
    res.status(400).send(err); // Manejo de errores
  }
});

// Iniciar el servidor
const port = 8080; // Puerto en el que correrá el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`); // Mensaje al iniciar el servidor
});