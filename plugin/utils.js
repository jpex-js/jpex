const getPath = (props, obj) => props.reduce((acc, key) => acc && acc[key], obj);

module.exports = {
  getPath,
};
