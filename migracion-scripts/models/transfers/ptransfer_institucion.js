var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  ptransfer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Productostranfers",
  },
  institucion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instituciones",
  },
});

module.exports = mongoose.model("ptransfer_instituciones", schema);
