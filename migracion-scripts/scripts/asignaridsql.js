const migracion = require("./migracionscript");

const Permiso = require("../models/permisos");
const ProductoPack = require("../models/packsproductos/productopack");
const ProductoTransfer = require("../models/transfers/productoTransfer");
const Laboratorio = require("../models/transfers/laboratorio");
const Drogueria = require("../models/transfers/drogueria");
const Farmacia = require("../models/farmacia");
const Usuario = require("../models/user");
const Publicidad = require("../models/publicidad");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const MONGODB_URI =
  "mongodb+srv://usr_farmageo:2IXRusmHMrkKpu8t@cluster0.k0r5j.mongodb.net/farmageo?retryWrites=true&w=majority";
let isConnected;

let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

connectToDatabase = async () => {
  if (isConnected) {
    return Promise.resolve();
  }
  return await mongoose.connect(MONGODB_URI, options).then((db) => {
    isConnected = db.connections[0].readyState;
    console.log("conectado a Mongo DB Farmageo Prod");
  });
};

const asignaridsql = async () => {
  await connectToDatabase();

  // migracion.asignar_idsql(Usuario);
  // migracion.asignar_idsql(Farmacia);
  // migracion.asignar_idsql(Permiso);
  // migracion.asignar_idsql(ProductoPack);
  // migracion.asignar_idsql(Laboratorio);
  // migracion.asignar_idsql(Drogueria);
  // migracion.asignar_idsql(Publicidad);
   migracion.asignar_idsql(ProductoTransfer);

  // migracion.asignar_idsql_externo(
  //   ProductoTransfer,
  //   Laboratorio,
  //   "idsql_laboratorio",
  //   "laboratorioid"
  // );

  // migracion.transfer_asignar_idsql_codigotransfer();

  // migracion.farmacia_asignar_usuario_idsql();
  // migracion.farmacia_asignar_id_localidad();
  // migracion.usuario_asignar_id_localidad();
  // migracion.productoPack_categoria_entidad_idsql();
};

asignaridsql();
