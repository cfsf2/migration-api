var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
  {
    farmaciaid: {
      type: String,
    },
    matricula: {
      type: String,
    },
    usuario: {
      type: String,
    },
    password: {
      type: String,
    },
    nombre: {
      type: String,
    },
    nombrefarmaceutico: {
      type: String,
    },
    calle: {
      type: String,
    },
    numero: {
      type: "Number",
      default: 0,
    },
    localidad: {
      type: String,
    },
    cp: {
      type: String,
    },
    provincia: {
      type: String,
    },
    cuit: {
      type: String,
    },
    telefono: {
      type: String,
    },
    cufe: {
      type: String,
    },
    descripcion: {
      type: String,
    },
    telefonofijo: {
      type: String,
    },
    direccioncompleta: {
      type: String,
    },
    lat: {
      type: String,
    },
    log: {
      type: String,
    },
    ubicacion: {
      type: String,
    },
    whatsapp: {
      type: String,
    },
    email: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagran: {
      type: String,
    },
    web: {
      type: String,
    },
    tiempotardanza: {
      type: String,
      default: "...",
    },
    costoenvio: {
      type: Number,
      default: 0,
    },
    telFijo: {
      type: String,
    },
    imagen: {
      type: String,
      default: "",
    },
    habilitado: {
      type: Boolean,
      default: true,
    },
    descubrir: {
      type: Boolean,
      default: false,
    },
    nohagoenvios: {
      type: Boolean,
      default: true,
    },
    fechaalta: {
      type: Date,
      default: Date.now,
    },
    servicios: [
      {
        tipo: { type: String },
        dato: { type: String },
      },
    ],
    mediospagos: [],
    promociones: [],
    pedidos: [],
    horarios: [],
    papeleraProductos: [],
    productos: [
      {
        productoid: {
          type: String,
        },
        imagen: {
          type: String,
        },
        nombre: {
          type: String,
        },
        sku: {
          type: String,
        },
        inventario: {
          type: String,
        },
        precio: {
          type: Number,
        },
        favorito: {
          type: Boolean,
        },
        fecha: {
          type: Date,
          default: Date.now,
        },
        descripcion: {
          type: String,
        },
        esPromocion: {
          type: Boolean,
        },
        orden_perfil: {
          type: Number,
        },
        fecha_publicacion: {
          type: Date,
          default: Date.now,
        },
        fecha_limite: {
          type: Date,
        },
      },
    ],
    excepcionesProdFarmageo: [],
    excepcionesEntidadesFarmageo: [],
    ultimoacceso: {
      type: Date,
    },
    visita_comercial: {
      type: String,
    },
    //perfil_farmageo: 'vender_online', 'solo_visible', 'no_visible, 'indefinido'
    perfil_farmageo: {
      type: String,
      default: "solo_visible",
    },
    lote: {
      type: String,
    },
    relaciones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "farmacia_instituciones",
      },
    ],
    //migracion SQL
    idsql: { type: Number },
    idsql_usuario: { type: Number },
    id_localidad: { type: Number },
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
  },
  {
    usePushEach: true,
  }
);

schema.statics.findByFarmaciaId = async (farmaciaid) => {
  return await mongoose
    .model("Farmacias")
    .findOne({ farmaciaid: farmaciaid })
    .exec();
};

schema.statics.findByUsername = async (username) => {
  return await mongoose
    .model("Farmacias")
    .findOne({ usuario: username })
    .exec();
};

schema.statics.findByMatricula = async (matricula) => {
  return await mongoose
    .model("Farmacias")
    .findOne({ matricula: matricula })
    .exec();
};

schema.statics.findByLocalidad = async (localidad) => {
  let _localidad = new RegExp(localidad, "i");
  return await mongoose
    .model("Farmacias")
    .find({ localidad: _localidad })
    .exec();
};

module.exports = mongoose.model("Farmacias", schema);
