var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var schema = new mongoose.Schema({
    "fecha": {
        "type": "Date", "default": Date.now
    },
    "motivo": {
        "type": "String"
    },
    "username_denunciante": {
        "type": "String"
    },    
    "username_denunciado": {
      "type": "String"
    },
    "nombre_denunciado": {
        "type": "String"
    },    
    "tipodenuncia":{
      "type": "String"
    }
  }, {
    usePushEach: true
  });

schema.statics.findByUsername = async (nombre_denunciado) => {
  return await mongoose.model('Denuncias').findOne({ nombre_denunciado: nombre_denunciado }).exec();
};

module.exports = mongoose.model('Denuncias', schema);