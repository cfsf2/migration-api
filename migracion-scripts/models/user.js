var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var userSchema = mongoose.Schema({
  id_wp: String,
  name: String,
  apellido: String,
  localidad: String,
  fechaNac: String,
  usuario: String,
  email: String,
  dni: String,
  telephone: String,
  confirmado: {
    type: Boolean,
    default: false,
  },
  codigo_confirmacion: String,
  password: String,
  admin: {
    type: Boolean,
    default: false,
  },
  esfarmacia: {
    type: Boolean,
    default: true,
  },
  farmaciaid: {
    type: String,
  },
  demolab: {
    type: Boolean,
    default: false,
  },
  demolab_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "laboratorios",
    default: null,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  habilitado: {
    type: Boolean,
    default: true,
  },
  newsletter: {
    type: Boolean,
    default: false,
  },
  Farmaciasfavoritas: [],
  Farmacia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "farmacias",
  },
  permisos: [],
  perfil: { type: mongoose.Schema.Types.ObjectId, ref: "perfiles" },
  Farmacia: { type: mongoose.Schema.Types.ObjectId, ref: "farmacias" },
  obras_sociales: [
    {
      nombre: {
        type: String,
      },
      descripcion: {
        type: String,
      },
      carnet: {
        type: String,
      },
      fechaalta: {
        type: Date,
        default: Date.now,
      },
      fechavencimiento: {
        type: Date,
      },
    },
  ],
  ultimoacceso: {
    type: Date,
  },
  lote: {
    type: String,
  },
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
  //migracion
  id_localidad: {
    type: Number,
  },
  idsql: {
    type: Number,
  },
  fechaNac_f: { type: String },
});

userSchema.statics.findByUsername = async (username) => {
  return await mongoose.model("User").findOne({ usuario: username }).exec();
};

module.exports = mongoose.model("User", userSchema);
