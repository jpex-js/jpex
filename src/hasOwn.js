var ObjectHasOwnProperty = Object.hasOwnProperty;
module.exports = function (obj, name) {
  return ObjectHasOwnProperty.call(obj, name);
};
