define(function (require, exports, module) {
  'use strict';

  // imports
  var $ = require('jquery'),
      hogan = require('hogan'),
      templates = require('./templates');

  // vars
  var hash = window.location.search
           ? window.location.search.replace('?', '')
           : '',
      paramsList = [];

  // $electors
  var $electors = {
    urls: $('#urls'),
    hosts: $('#hosts'),
    paths: $('#paths'),
    params: $('#params'),
    paramsContainer: $('#params-container'),
    output: $('#output'),
    controls: $('#controls'),
    btnReset: $('#btn-reset'),
    btnOpenAll: $('#btn-open-all')
  };

  var Urls = {
    parse: function () {
      var urlsVal = $electors.urls.val(),
          urls = urlsVal.split('\n'),
          inputs = {
            hosts: '',
            paths: '',
            params: ''
          };

      if (urlsVal) {
        for (var i = 0, urlsLen = urls.length; i < urlsLen; i++) {
          var url = urls[i];

          if (url) {
            var a = document.createElement('a');
            a.href = url;

            if (a.protocol && a.host) {
              inputs.hosts += a.protocol + '//' + a.host + '\n';
            }

            if (a.pathname) {
              inputs.paths = a.pathname + '\n';
            }

            if (a.search) {
              var searches = a.search.replace('?', '').split('&');

              for (var j = 0, searchesLen = searches.length; j < searchesLen; j++) {
                var search = searches[j].split('=');

                if (search[0]) {
                  inputs.params += search[0] + '\n';
                }

                if (search[1]) {
                  inputs[search[0]] = (inputs[search[0]] ? inputs[search[0]] : '') + search[1] + '\n';
                }
              }
            }
          }
        }

        Inputs.populate(inputs);
      }
    },
    generate: function () {
      var hostsVal = $electors.hosts.val(),
          hosts = hostsVal.split('\n'),
          output = {};

      if (hostsVal) {
        var toCombinate = [{
              type: 'host',
              list: hosts
            }],
            pathsVal = $electors.paths.val(),
            paths = pathsVal.split('\n');

        if (pathsVal) {
          toCombinate.push({
            type: 'path',
            list: paths
          });
        }

        for (var i = 0, paramsListLen = paramsList.length; i < paramsListLen; i++) {
          var $param = paramsList[i],
              paramVal = $param.val(),
              paramList = paramVal.split('\n');

          if (paramVal) {
            toCombinate.push({
              type: $param.attr('rel'),
              list: paramList
            });
          }
        }

        if (toCombinate.length > 1) {
          var links = Inputs.combinateAll(toCombinate).list,
              linksFormated = [];

          for (var i = 0, linksLen = links.length; i < linksLen; i++) {
            var link = links[i].replace('&', '?');

            linksFormated.push(link);
          }

          output.links = {
            list: linksFormated
          };
        }

        $electors.controls.show();
      } else {
        $electors.controls.hide();
      }

      Misc.updateHash();
      $electors.output.html(templates.link(output));
    }
  };

  var Params = {
    generate: function (data) {
      var paramsVal = $.trim($electors.params.val()),
          params = paramsVal.split('\n'),
          $textareaContainers = $('.param'),
          textareaContainersLen = $('.param').length,
          html = '',
          toRemove = textareaContainersLen - params.length;

      if (paramsVal) {
        for (var i = 0, paramsLen = 0; i < params.length; i++) {
          var param = params[i],
              toOrder = -1;

          $textareaContainers.each(function (index) {
            if (i !== index && $(this).get(0).id === param) {
              toOrder = index;
              return;
            }
          });

          if (toOrder > -1) {
            $textareaContainers
              .eq(toOrder)
              .detach()
              .insertBefore($textareaContainers.eq(i));
          }
        }
      } else {
        $electors.paramsContainer.empty();
      }

      paramsList = [];

      for (var i = 0, paramsLen = params.length; i < paramsLen; i++) {
        var param = params[i];

        if (param) {
          var $textareaContainer = $textareaContainers.eq(i);

          if (!$textareaContainer.length) {
            $textareaContainer = $(templates.param({ param: param }))
                                  .appendTo($electors.paramsContainer);
          } else {
            var oldId = $textareaContainer.find('textarea').attr('id'),
                oldVal = $textareaContainer.find('textarea').val();

            $textareaContainer
              .attr('id', param)
              .find('label')
                .attr('for', param)
                .text(param)
                .end()
              .find('textarea')
                .attr({
                  id: param,
                  name: param,
                  placeholder: param,
                  rel: param
                })
                .val(oldId === param ? oldVal : '')
                .end();
          }

          var $textarea = $textareaContainer.find('textarea');
          $textarea.on('keyup', { type: 'param' }, Events.keyUp);

          if (data && data[param]) {
            $textarea.val(data[param]);
          }

          paramsList.push($textarea);
        }
      }

      if (toRemove > 0) {
        for (var i = 0; i < toRemove; i++) {
          $textareaContainers.eq(params.length + i - 1)
            .off()
            .remove();
        }
      }

      if (!data) {
        Misc.updateHash();
      }

      Urls.generate();
    }
  };

  var Inputs = {
    populate: function (data) {
      $electors.hosts.val($.trim(data.hosts));
      $electors.paths.val($.trim(data.paths));
      $electors.params.val($.trim(data.params));

      Params.generate(data);
      Urls.generate();
    },
    serialize: function () {
      var inputs = {
            hosts: $electors.hosts.val(),
            paths: $electors.paths.val(),
            params: $electors.params.val()
          };

      for (var i = 0, paramsListLen = paramsList.length; i < paramsListLen; i++) {
        var $param = paramsList[i];

        inputs[$param.get(0).id] = $param.val();
      }

      return inputs.hosts
           ? JSON.stringify(inputs)
           : null;
    },
    combinateAll: function (arrays) {
      return !arrays.length
            ? []
            : arrays.length === 1
            ? arrays[0]
            : Inputs.combinate(arrays, 0);
    },
    combinate: function (arrays) {
      var array1 = arrays.splice(0, 1)[0],
          array2 = arrays.length === 1 ? arrays[0] : Inputs.combinate(arrays),
          array = [];

      for (var i = 0, array1Len = array1.list.length; i < array1Len; i++) {
        if (array1.list[i]) {
          for (var j = 0, array2Len = array2.list.length; j < array2Len; j++) {
            if (array2.list[j]) {
              var part1 = Inputs.format(array1.list[i], array1.type),
                  part2 = Inputs.format(array2.list[j], array2.type);

              array.push(part1 + part2);
            }
          }
        }
      }

      return {
        type: array1.type === 'path' ? 'pathAndParams' : null,
        list: array
      };
    },
    format: function (string, type) {
      if (type === 'host') {
        if (string.charAt(string.length - 1) !== '/') {
          string += '/';
        }
      } else if (type === 'path') {
        if (string.charAt(0) === '/') {
          string = string.substring(1);
        }
      } else if (type && type !== 'pathAndParams') {
        string = '&' + type + '=' + string;
      }

      return string;
    },
    resetAll: function () {
      $electors.urls.val('');
      $electors.hosts.val('');
      $electors.paths.val('');
      $electors.params.val('');
      $electors.paramsContainer.empty();
      $electors.controls.hide();

      Params.generate();
      Urls.generate();
      Misc.updateHash();
    }
  };

  var Events = {
    keyUp: function (event) {
      if (event.data.type === 'urls') {
        Urls.parse();
      } else if (event.data.type === 'hosts' || event.data.type === 'paths' || event.data.type === 'param') {
        Urls.generate();
      } else if (event.data.type === 'params') {
        Params.generate();
      }
    },
    click: function (event) {
      if (event.data.type === 'reset') {
        Inputs.resetAll();
      } else if (event.data.type === 'all') {
        Misc.openAllLinks();
      }
    }
  };

  var Misc = {
    updateHash: function () {
      var serializedForm = Inputs.serialize(),
          newHash = btoa(serializedForm);

      if (!serializedForm) {
        hash = '';
        window.history.replaceState(false, 'Urlify', '/');
      } else if (hash !== newHash) {
        hash = newHash;
        window.history.replaceState(false, 'Urlify', '?' + hash);
      }
    },
    openWindow: function (href) {
      window.open(href, '_blank');
    },
    openAllLinks: function () {
      $electors.output.find('a').each(function () {
        Misc.openWindow($(this).attr('href'));
      });
    }
  };

  if (hash) {
    Inputs.populate(JSON.parse(atob(hash)));
  } else {
    $electors.controls.hide();
  }

  $electors.urls.on('keyup', { type: 'urls' }, Events.keyUp);
  $electors.hosts.on('keyup', { type: 'hosts' }, Events.keyUp);
  $electors.paths.on('keyup', { type: 'paths' }, Events.keyUp);
  $electors.params.on('keyup', { type: 'params' }, Events.keyUp);
  $electors.btnReset.on('click', { type: 'reset' }, Events.click);
  $electors.btnOpenAll.on('click', { type: 'all' }, Events.click);
});
