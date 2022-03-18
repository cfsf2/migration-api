var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  matricula: {
    type: String,
  },
  usuario: {
    type: String,
  },
  password: {
    type: String,
  },
  nombre: {
    type: String,
  },
  nombrefarmaceutico: {
    type: String,
  },
  telefono: {
    type: String,
  },
  cuit: {
    type: String,
  },
  cufe: {
    type: String,
  },
  calle: {
    type: String,
  },
  nro: {
    type: String,
  },
  localidad: {
    type: String,
  },
  provincia: {
    type: String,
  },
  cp: {
    type: String,
  },
  email: {
    type: String,
  },
  codigo: {
    type: String,
  },
  id_localidad: { type: Number },
  id_provincia: { type: Number },
});

module.exports = mongoose.model("Farmaciauxs", schema);
