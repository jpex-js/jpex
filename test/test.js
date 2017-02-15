// This is test.js
debugger;
var Jpex = require('../src');

var Class = Jpex.extend();
var instance = new Class(function () {
  console.log('Created');
});

module.exports = instance;
