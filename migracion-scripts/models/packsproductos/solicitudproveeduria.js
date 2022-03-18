var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const AutoIncrement = require("mongoose-sequence")(mongoose);

var schema = new mongoose.Schema(
  {
    codigo_solicitud: Number,
    estado: {
      type: "String",
    },
    fecha: {
      type: "Date",
      default: Date.now,
    },
    ultima_modificacion: {
      type: "Date",
      default: Date.now,
    },
    farmacia_id: {
      type: "String",
    },
    farmacia_nombre: {
      type: "String",
    },
    entidad_id: {
      type: "String",
    },
    drogueria_id: {
      type: "String",
    },
    nro_cuenta_drogueria: {
      type: "String",
    },
    email_destinatario: {
      type: "String",
    },
    productos_solicitados: [
      {
        codigo_producto: { type: "String" },
        cantidad: { type: "Number" },
        observacion: { type: "String" },
        nombre: { type: "String" },
      },
    ],
    //migracion
    idsql: { type: Number },
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

schema.plugin(AutoIncrement, { inc_field: "codigo_solicitud" });

module.exports = mongoose.model("SolicitudesProveeduria", schema);
