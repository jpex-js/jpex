var hasOwn = require('../hasOwn');

exports.use = function (plugin, config) {
  var Jpex = this;

  if (!plugin || !plugin.install || typeof plugin.install !== 'function'){
    throw new Error('Plugin does not have an install method');
  }
  if (!plugin.name || typeof plugin.name !== 'string'){
    throw new Error('Plugin must have a name property');
  }

  if (this.$$using[plugin.name] && !plugin.reuse){
    if (!plugin.silent){
      console.warn('Plugin ' + plugin.name + ' skipped as it has already been used'); // eslint-disable-line
    }
    return;
  }else{
    this.$$using[plugin.name] = true;
  }

  var options = {
    Jpex : Jpex,
    on : function (name, fn) {
      addHook(Jpex, name, fn);
    },
    options : config
  };

  plugin.install(options);
};

exports.trigger = function (name, payload) {
  var hook = this.$$hooks[name];
  if (!hook){
    return;
  }

  hook.trigger(payload);
};

function addHook(Class, name, fn) {
  var hooks = Class.$$hooks;

  if (!hooks[name]){
    var id = 0;
    var Parent = Class;
    while (Parent.$$parent && Parent.$$parent.$$parent){
      Parent = Parent.$$parent;
    }
    Parent.$$hooks[name] = Object.create({
      push : function (fn) {
        this[id++] = fn;
      },
      trigger : function (payload) {
        payload = Object.assign({ Jpex : Class, eventName : name }, payload);
        Array.prototype.slice.call(this).forEach(function (fn) {
          if (fn){
            fn(payload);
          }
        });
      }
    }, {
      length : {
        get : function () {
          return id;
        }
      }
    });
  }
  if (!hasOwn(hooks, name)){
    hooks[name] = Object.create(Class.$$parent.$$hooks[name] || null);
  }
  hooks[name].push(fn);
}
