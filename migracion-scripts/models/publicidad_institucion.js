var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  publicidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publicidades",
  },
  institucion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instituciones",
  },
});

module.exports = mongoose.model("publicidad_instituciones", schema);
