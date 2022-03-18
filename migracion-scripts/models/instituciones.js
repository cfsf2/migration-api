var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  habilitada: {
    type: Boolean,
    default: true,
  },
  id_institucion_madre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instituciones",
    default: null,
    required: false,
  },
  nombre_institucion_madre: {
    type: String,
    default: null,
  },
  //migracion
  idsql: { type: Number },
  idsql_institucion_madre: { type: Number },
  //datos auditoria
  fecha_alta: {
    type: Date,
    default: Date.now,
  },
  id_usuario_alta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  fecha_modificacion: {
    type: Date,
    default: Date.now,
  },
  id_usuario_modificacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("instituciones", schema);
