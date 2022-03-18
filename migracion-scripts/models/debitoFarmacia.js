var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  usuario: {
    type: String,
    index: true,
  },
  periodo: {
    type: String,
  },
  archivo: {
    type: String,
  },
  idsql: { type: Number },
  id_usuario_creacion: { type: Number },
  id_usuario_modificacion: { type: Number },
});

module.exports = mongoose.model("debitoFarmacias", schema);
