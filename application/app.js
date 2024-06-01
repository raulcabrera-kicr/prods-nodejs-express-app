const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Configuración de la aplicación
const app = express();
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://ucn:Ucn.123@test.cwsozmy.mongodb.net/?retryWrites=true&w=majority&appName=test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Esquema y modelo de Mongoose
const productoSchema = new mongoose.Schema({
  codigo: String,
  nombre: String,
  cantidad: String,
});

const usuarioSchema = new mongoose.Schema({
  identificacion: String,
  nombres: String,
  apellidos: String,
  ciudad: String,
  direccion: String,
  celular: String,
  productos: [productoSchema],
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Endpoint para guardar el JSON
app.post('/productos/guardar', async (req, res) => {
  const usuario = new Usuario(req.body);
  try {
    const savedUsuario = await usuario.save();
    res.status(200).send(savedUsuario);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Endpoint para obtener el JSON basado en la identificación
app.get('/productos/obtener/:identificacion', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ identificacion: req.params.identificacion });
    if (usuario) {
      res.status(200).send(usuario);
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// Endpoint para obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
      const usuarios = await Usuario.find({}, 'productos');
      res.status(200).send(usuarios);
    } catch (err) {
      res.status(400).send(err);
    }
  });

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});