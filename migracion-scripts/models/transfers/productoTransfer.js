var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
  {
    codigo: {
      type: "String",
    },
    laboratorioid: {
      type: String,
    },
    nombre: {
      type: "String",
    },
    presentacion: {
      type: "String",
    },
    imagen: {
      type: "String",
    },
    cantidad_minima: {
      type: "Number",
    },
    descuento_porcentaje: {
      type: "Number",
    },
    habilitado: {
      type: "Boolean",
      default: true,
    },
    fechaalta: {
      type: "Date",
      default: Date.now,
    },
    precio: {
      type: "Number",
    },
    en_papelera: {
      type: "Boolean",
      default: null,
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
    idsql: { type: Number },
    idsql_laboratorio: { type: Number },
  },
  {
    usePushEach: true,
  }
);

/*
schema.statics.findByFarmaciaId = async (farmaciaid) => {
  return await mongoose.model('Farmacias').findOne({ farmaciaid: farmaciaid }).exec();
};

schema.statics.findByUsername = async (username) => {
  return await mongoose.model('Farmacias').findOne({ usuario: username }).exec();
};

schema.statics.findByMatricula = async (matricula) => {
  return await mongoose.model('Farmacias').findOne({ matricula: matricula }).exec();
};

schema.statics.findByLocalidad = async (localidad) => {
  let _localidad = new RegExp(localidad,'i')
  return await mongoose.model('Farmacias').find({ localidad: _localidad }).exec();
};
*/

module.exports = mongoose.model("Productostranfers", schema);
