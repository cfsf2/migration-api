var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
  {
    nombre: {
      type: "String",
    },
    entidadnombre: {
      type: "String",
    },
    imagen: {
      type: "String",
      default: "",
    },
    email: {
      type: "String",
    },
    habilitado: {
      type: "Boolean",
      default: true,
    },
    fechaalta: {
      type: "Date",
      default: Date.now,
    },
    rentabilidad: {
      type: "Number",
    },
    logo: {
      type: "String",
      default: "",
    },
    no_mostrar_en_proveeduria: {
      type: "Boolean",
      default: false,
    },
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

module.exports = mongoose.model("Entidades", schema);
