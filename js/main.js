'use strict';

require.config({
  baseUrl: 'js/',
  paths: {
    'jquery': '../node_modules/jquery/dist/jquery',
    'hogan': '../node_modules/hogan.js/dist/hogan-3.0.2.min.amd'
  }
});

requirejs(['app']);
