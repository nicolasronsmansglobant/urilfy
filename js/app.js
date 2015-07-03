$(function () {
  var $urls = $('#urls'),
      $input = $('#input'),
      $hosts = $('#hosts'),
      $paths = $('#paths'),
      $params = $('#params'),
      $paramsContainer = $('#params-container'),
      $output = $('#output'),
      $controls = $('#controls').hide(),
      $openAll = $('#btn-all'),
      $reset = $('#btn-reset');

  var hash = window.location.search
           ? window.location.search.replace('?', '')
           : '',
      paramsList = [];

  var parseUrls = function () {
    var urlsVal = $urls.val(),
        urls = urlsVal.split('\n'),
        form = {
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
            form.hosts += a.protocol + '//' + a.host + '\n';
          }

          if (a.pathname) {
            form.paths = a.pathname + '\n';
          }

          if (a.search) {
            var searches = a.search.replace('?', '').split('&');

            for (var j = 0, searchesLen = searches.length; j < searchesLen; j++) {
              var search = searches[j].split('=');

              if (search[0]) {
                form.params += search[0] + '\n';
              }

              if (search[1]) {
                form[search[0]] = (form[search[0]] ? form[search[0]] : '') + search[1] + '\n';
              }
            }
          }
        }
      }
      populateForm(form);
    }
  },
  generateUrls = function () {
    var hostsVal = $hosts.val(),
        hosts = hostsVal.split('\n'),
        output = '';

    if (hostsVal) {
      var toCombinate = [{
            type: 'host',
            list: hosts
          }],
          pathsVal = $paths.val(),
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
        var links = combinateAll(toCombinate).list;

        output += '<hr>';

        for (var i = 0, linksLen = links.length; i < linksLen; i++) {
          var link = links[i].replace('&', '?');

          output += '<a href="' + link + '" title="' + link + '" target="_blank">' + link + '</a><br>';
        }

        output += '<hr>';
        $controls.show();
      } else {
        $controls.hide();
      }
    } else {
      $controls.hide();
    }

    updateHash();
    $output.html(output);
  },
  combinateAll = function (arrays) {
    return !arrays.length
          ? []
          : arrays.length === 1
          ? arrays[0]
          : combinate(arrays, 0);
  },
  combinate = function (arrays) {
    var array1 = arrays.splice(0, 1)[0],
        array2 = arrays.length === 1 ? arrays[0] : combinate(arrays);
        array = [];

    for (var i = 0, array1Len = array1.list.length; i < array1Len; i++) {
      if (array1.list[i]) {
        for (var j = 0, array2Len = array2.list.length; j < array2Len; j++) {
          if (array2.list[j]) {
            var part1 = format(array1.list[i], array1.type),
                part2 = format(array2.list[j], array2.type);

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
  format = function (string, type) {
    if (type === 'host') {
      if (string.charAt(string.length - 1) !== '/') {
        string += '/';
      }
    } else if (type === 'path') {
      if (string.charAt(0) === '/') {
        string = string.substring(1);
      }
    } else if (type && type != 'pathAndParams') {
      string = '&' + type + '=' + string;
    }

    return string;
  },
  onParamChange = function () {
    generateParams();
  }
  generateParams = function (data) {
    var paramsVal = $.trim($params.val()),
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
          if (i != index && $(this).get(0).id === param) {
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
      $paramsContainer.empty();
    }

    paramsList = [];

    for (var i = 0, paramsLen = params.length; i < paramsLen; i++) {
      var param = params[i];

      if (param) {
        var $textareaContainer = $textareaContainers.eq(i);

        if (!$textareaContainer.length) {
          var html = '<div class="param col-xs-6">\n' +
                     '  <div class="form-group">\n' +
                     '    <label for="' + param + '">' + param + '</label>\n' +
                     '    <textarea id="' + param + '" name="' + param + '" class="form-control" placeholder="' + param + '" rel="' + param + '"></textarea>\n' +
                     '  </div>\n' +
                     '</div>';

          $textareaContainer = $(html).appendTo($paramsContainer);
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
        $textarea.on('keyup', generateUrls);

        if (data && data[param]) {
          $textarea.val(data[param]);
        }

        paramsList.push($textarea);
      }
    }


console.log(textareaContainersLen, params.length);
    if (toRemove > 0) {
      for (var i = 0; i < toRemove; i++) { console.log(params.length + i - 1);
        $textareaContainers.eq(params.length + i - 1)
          .off()
          .remove();
      }
    }

    if (!data) {
      updateHash();
    }

    generateUrls();
  },
  resetForm = function () {
    $urls.val('');
    $hosts.val('');
    $paths.val('');
    $params.val('');
    $paramsContainer.empty();
    $controls.hide();

    generateParams();
    generateUrls();
    updateHash();
  },
  openAllLinks = function () {
    $output.find('a').each(function () {
      openWindow($(this).attr('href'));
    });
  },
  openWindow = function (href) {
    window.open(href, '_blank');
  },
  updateHash = function () {
    var serializedForm = serializeForm(),
        newHash = btoa(serializedForm);

    if (!serializedForm) {
      hash = '';
      window.history.replaceState(false, 'Urlify', '/');
    } else if (hash != newHash) {
      hash = newHash;
      window.history.replaceState(false, 'Urlify', '?' + hash);
    }
  },
  serializeForm = function () {
    var form = {
          hosts: $hosts.val(),
          paths: $paths.val(),
          params: $params.val()
        };

    for (var i = 0, paramsListLen = paramsList.length; i < paramsListLen; i++) {
      var $param = paramsList[i];

      form[$param.get(0).id] = $param.val();
    }

    return form.hosts && form.paths && form.params
         ? JSON.stringify(form)
         : null;
  },
  populateForm = function (data) {
    data;

    $hosts.val($.trim(data.hosts));
    $paths.val($.trim(data.paths));
    $params.val($.trim(data.params));

    generateParams(data);
    generateUrls();
  };

  if (hash) {
    populateForm(JSON.parse(atob(hash)));
  }

  $urls.on('keyup', parseUrls)
  $hosts.on('keyup', generateUrls);
  $paths.on('keyup', generateUrls);
  $params.on('keyup', onParamChange);
  $reset.on('click', resetForm);
  $openAll.on('click', openAllLinks);
});
