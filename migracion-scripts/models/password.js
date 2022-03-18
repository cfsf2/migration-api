var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
    {
        usuario: {
            type: String,
            index: true
        },
        password: {
            type: String,
        }
    });

module.exports = mongoose.model("passwords", schema);
