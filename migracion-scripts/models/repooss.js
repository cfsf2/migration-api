
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.Promise = global.Promise;

/*
Los TIPOS van a ser:
    - 'novedadesadmin' (que lo verán solo las farmacias)
    - 'infointeres' (que sale en la app)
    - 'mutual' (que sale en la app abajo de todo)
*/

var schema = new Schema({
  oossInactivas: {
    type: []
  },
  alert: {
    type: String
  },
  attachName: {
    type: String
  },
  mimetype: {
    type: String
  },
  avaliable: {
    type: Boolean, default: true
  },
}, {
  timestamps: true,
  usePushEach: true
});

module.exports = mongoose.model('repoos', schema);