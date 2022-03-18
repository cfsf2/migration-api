var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
  {
    entidad_id: {
      type: "String",
      default: "sin_entidad",
    },
    nombre: {
      type: "String",
    },
    imagen: {
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
    sku: {
      type: "String",
    },
    inventario: {
      type: "String",
    },
    precio: {
      type: "Number", // precio en FarmaGeo PVP
    },
    precio_con_IVA: {
      type: "Number", // precio de carga en admin
    },
    rentabilidad: {
      type: "Number", // rentabilidad en %
    },
    descripcion: {
      type: "String",
    },
    categoria_id: {
      type: "String",
      default: "sin_categoria",
    },
    en_papelera: {
      type: "Boolean",
      default: null,
    },
    //migracion
    idsql: { type: Number },
    idsql_entidad: { type: Number },
    idsql_categoria: { type: Number },
  },
  {
    usePushEach: true,
  }
);

module.exports = mongoose.model("Productospack", schema);
