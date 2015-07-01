module.exports = function (grunt, options) {
  return {
    dev: {
      options: {
        hostname: '*',
        port: process.env.PORT || '6789',
        base: '.',
        keepalive: true
      }
    },
    prod: {
      options: {
        hostname: '*',
        port: process.env.PORT || '0',
        base: '.',
        keepalive: true,
      }
    }
  };
};
