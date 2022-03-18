var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var perfilesSchema = mongoose.Schema({
  nombre: String,
  descripcion: String,
  permisos: [],
  tipo: String,
  idsql: { type: Number },
});

module.exports = mongoose.model("perfiles", perfilesSchema);
