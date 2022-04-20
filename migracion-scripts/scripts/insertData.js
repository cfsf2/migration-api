#!/usr/bin/node
const migracion = require("./migracionscript");
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

(async () => {
  return new Promise(async (resolve, reject) => {
    await connectToDatabase();

    // await migracion.tbl_usuario();
    //  await migracion.tbl_farmacia();
    //   await migracion.tbl_producto_pack();
    //   await migracion.tbl_laboratorio();
    //await migracion.tbl_transfer_productos();
    // await migracion.tbl_publicidades();
    //await migracion.tbl_producto_custom();
    resolve();
  });
})()
  .then(() => {
    const migration = () => {
      return new Promise((resolve, reject) => {
        // migracion.tbl_farmacia_productopack();
        //migracion.tbl_farmacia_institucion();
        //  migracion.tbl_farmacia_mediosdepago();
        //migracion.tbl_farmacia_servicios();
        //  migracion.tbl_farmacia_dia();

        // migracion.tbl_perfil_permiso();
        // migracion.tbl_usuario_perfil();

        // migracion.tbl_publicidad_institucion();
        // migracion.tbl_ptransfer_institucion();

        migracion.tbl_solicitud_proveeduria();
        // migracion.tbl_debitofarmacia();
        // migracion.tbl_pedidos_producto_pack();
        //migracion.tbl_transfers();

        resolve();
      });
    };

    return migration();
  })
  .then(() => {
    return console.log("Listorti");
  });
