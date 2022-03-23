var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
  {
    descripcion: {
      type: "String",
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
    favorito: {
      type: "Boolean",
      default: true,
    },
    precio: {
      type: "Number", // precio en FarmaGeo PVP
    },
    sku: {
      type: "String",
      default: null,
    },
    en_papelera: {
      type: "Boolean",
      default: false,
    },
    inventario: {
      type: "String",
    },
    esPromocion: {
      type: "Boolean",
      default: false,
    },

    //migracion
    idsql: { type: Number, default: null },
    idsql_categoria: {
      type: "String",
      default: null,
    },
  },
  {
    usePushEach: true,
  }
);

module.exports = mongoose.model("tbl_producto_customs", schema);
