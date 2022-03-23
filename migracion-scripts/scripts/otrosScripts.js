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

connectToDatabase().then(() => {
  migracion.ProductosCustom();
});
