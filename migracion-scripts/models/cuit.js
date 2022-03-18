var mongoose = require("mongoose");
mongoose.Promise = global.Promise;


var schema = new mongoose.Schema(
    {
        matricula: {
            type: "String",
        },
        cuit: {
            type: "String",
        },
        telefono: {
            type: "String",
        }
    }
);


module.exports = mongoose.model("cuit", schema);
