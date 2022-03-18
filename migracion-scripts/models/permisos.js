var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var permisosSchema = mongoose.Schema({
  slug: String,
  descripcion: String,
  tipo: String,
  idsql: { type: Number },
});

module.exports = mongoose.model("permisos", permisosSchema);
