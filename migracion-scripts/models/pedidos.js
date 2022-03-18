var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const AutoIncrement = require("mongoose-sequence")(mongoose);

var schema = new mongoose.Schema(
  {
    _id: Number,
    username: {
      type: "String",
    },
    fechaalta: {
      type: "Date",
      default: Date.now,
    },
    fechamodificacion: {
      type: "Date",
      default: Date.now,
    },
    fechaentrega: {
      type: "Date",
      default: Date.now,
    },
    descripcion: {
      type: "String",
    },
    comentarios: {
      type: "String",
    },
    estado: {
      type: "String",
    },
    idfarmacia: {
      type: "String",
    },
    nombrefarmacia: {
      type: "String",
    },
    idsocio: {
      type: "String",
    },
    habilitado: {
      type: "Boolean",
      default: true,
    },
    envio: {
      type: "Boolean",
      default: false,
    },
    costoenvio: {
      type: "String",
    },
    domicilioenvio: {
      type: "String",
    },
    whatsapp: {
      type: "String",
    },
    pago_online: {
      type: "Boolean",
      default: false,
    },
    gruposproductos: [
      {
        obra_social: {
          type: "String",
        },
        obra_social_frente: {
          type: "String",
        },
        obra_social_dorso: {
          type: "String",
        },
        receta: {
          type: "String",
        },
        descripcion: {
          type: "String",
        },
        productos: [],
        precio: {
          type: "Number",
        },
        fecha: {
          type: "Date",
          default: Date.now,
        },
      },
    ],
    es_invitado: {
      type: "Boolean",
      default: false,
    },
    datos_cliente: [
      {
        nombre: {
          type: "String",
        },
        apellido: {
          type: "String",
        },
        email: {
          type: "String",
        },
      },
    ],
    origen: {
      // app o ecommerce
      type: "String",
    },
  },
  {
    _id: false,
    usePushEach: true,
  }
);

schema.statics.findByUsername = async (username) => {
  return await mongoose.model("Pedidos").findOne({ username: username }).exec();
};

schema.plugin(AutoIncrement);

module.exports = mongoose.model("Pedidos", schema);
