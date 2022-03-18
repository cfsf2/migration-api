var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var permisosSchema = mongoose.Schema({
  idsql_farmacia: { type: Number },
  idsql_productoPack: { type: Number },
  habilitado: { type: Boolean },
  id_usuario_creacion: 1,
  ts_creacion: null,
  id_usuario_modificacion: 1,
  ts_modificacion: null,
});

module.exports = mongoose.model("tbl_farmacia_productopacks", permisosSchema);
