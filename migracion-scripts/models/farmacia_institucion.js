var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  farmacia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmacias",
  },
  institucion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instituciones",
  },
});

module.exports = mongoose.model("farmacia_instituciones", schema);
