module.exports = function (grunt, options) {
  return {
    compile: {
      src: 'js/templates/**/*.mustache',
      dest: 'js/templates.js',
      options: {
        binderName: 'amd'
      }
    }
  };
};
