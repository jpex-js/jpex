var grequire = require('../../../jpex-folder/grequire');
var jpex = grequire('node_modules/jpex');

module.exports = jpex.extend({
  constructor : function(){
    this.test = 'jpex service';
  },
  interface : 'iinterface'
});