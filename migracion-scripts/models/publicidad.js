var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

/*
Los TIPOS van a ser:
    - 'novedadesadmin' (que lo verán solo las farmacias)
    - 'infointeres' (que sale en la app)
    - 'mutual' (que sale en la app abajo de todo)
*/

var schema = new mongoose.Schema(
  {
    username: {
      type: "String",
    },
    tipo: {
      type: "String",
    },
    fechainicio: {
      type: Date,
    },
    fechafin: {
      type: Date,
    },
    titulo: {
      type: "String",
    },
    descripcion: {
      type: "String",
    },
    link: {
      type: "String",
    },
    imagen: {
      type: "String",
    },
    habilitado: {
      type: "Boolean",
      default: true,
    },
    color: {
      type: "String",
    },
    // datos de auditoria
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
    idsql: { type: Number },
  },
  {
    usePushEach: true,
  }
);

schema.statics.findByUsername = async (username) => {
  return await mongoose
    .model("Publicidades")
    .findOne({ username: username })
    .exec();
};

module.exports = mongoose.model("Publicidades", schema);
