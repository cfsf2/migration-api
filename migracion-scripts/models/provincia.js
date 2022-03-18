var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
  id: {
    type: "String",
  },
  nombre: {
    type: "String",
  },
});

module.exports = mongoose.model("provincias", schema);
