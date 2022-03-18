var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema(
    {
        cufe: {
            type: "String",
        },
        titular: {
            type: "String",
        },
        matricula: {
            type: "String",
        },
        cuit: {
            type: "String",
        },
        ingbrutos: {
            type: "String",
        },
        nombre: {
            type: "String",
        },
        domicilio: {
            type: "String",
        },
        nro: {
            type: "String",
        },
        localidad: {
            type: "String",
        },
        departamento: {
            type: "String",
        },
        cp: {
            type: "String",
        },
        telefono: {
            type: "String",
        }
    }
);

module.exports = mongoose.model("Padrones", schema);
