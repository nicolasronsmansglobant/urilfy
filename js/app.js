$(function () {
  var $urls = $('#urls'),
      $input = $('#input'),
      $hosts = $('#hosts'),
      $types = $('#types'),
      $typesContainer = $('#types-container'),
      $output = $('#output'),
      $openAll = $('#btn-all').hide();

  var hash = window.location.search
           ? window.location.search.replace('?', '')
           : '',
      typesList = [];

  var parseUrls = function () {
    var urlsVal = $urls.val(),
        urls = urlsVal.split('\n'),
        form = {
          hosts: '',
          types: ''
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
            form.types = 'path\n';
            form.path = a.pathname + '\n';
          }

          if (a.search) {
            var searches = a.search.replace('?', '').split('&');

            for (var j = 0, searchesLen = searches.length; j < searchesLen; j++) {
              var search = searches[j].split('=');

              if (search[0]) {
                form.types += search[0] + '\n';
              }

              if (search[1]) {
                form[search[0]] = (form[search[0]] ? form[search[0]] : '') + search[1] + '\n';
              }
            }
          }
        }
      }
      populateForm(form);
      //$urls.val('');
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
      }];

      for (var i = 0, typesListLen = typesList.length; i < typesListLen; i++) {
        var $type = typesList[i],
            typeVal = $type.val(),
            typeList = typeVal.split('\n');

        if (typeVal) {
          toCombinate.push({
            type: $type.get(0).id,
            list: typeList
          });
        }
      }

      if (toCombinate.length > 1) {
        var links = combinateAll(toCombinate).list;

        for (var i = 0, linksLen = links.length; i < linksLen; i++) {
          var link = links[i].replace('&', '?');

          output += '<a href="' + link + '" title="' + link + '" target="_blank">' + link + '</a><br>';
        }

        output += '<hr>';
        $openAll.show();
      } else {
        $openAll.hide();
      }
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
  generateTypes = function (data) {
    var typesVal = $types.val(),
        types = typesVal.split('\n'),
        html = '';

    for (var i = 0, typesListLen = typesList.length; i < typesListLen; i++) {
      var toKeep = false;

      for (var j = 0, typesLen = types.length; j < typesLen; j++) {
        if (typesList[i].get(0).id === types[j]) {
          toKeep = true;
        }
      }

      if (!toKeep) {
        typesList[i]
          .remove()
          .off();
      }
    }

    typesList = [];

    for (var i = 0, typesLen = types.length; i < typesLen; i++) {
      var type = types[i];

      if (type) {
        var $textarea = $('#' + type);

        if (!$textarea.length) {
          $textarea = $('<textarea id="' + type + '" name="' + type + '" placeholder="' + type + '"></textarea>');
        } else {
          $textarea.detach();
        }

        $textarea
          .appendTo($typesContainer)
          .on('keyup', generateUrls);

        if (data && data[type]) {
          $textarea.val(data[type]);
        }

        typesList.push($textarea);
      }
    }

    if (!data) {
      updateHash();
    }
  },
  onClick = function () {
    $output.find('a').each(function () {
      openWindow($(this).attr('href'));
    });
  },
  openWindow = function (href) {
    window.open(href, '_blank');
  },
  updateHash = function () {
    var newHash = btoa(serializeForm());

    if (hash != newHash) {
      hash = newHash;
      window.history.replaceState(false, 'Urlify', '?' + hash);
    }
  },
  serializeForm = function () {
    var form = {
          hosts: $hosts.val(),
          types: $types.val()
        };

    for (var i = 0, typesListLen = typesList.length; i < typesListLen; i++) {
      var $type = typesList[i];

      form[$type.get(0).id] = $type.val();
    }

    return JSON.stringify(form);
  },
  populateForm = function (data) {
    var form = data;

    $hosts.val(form.hosts);
    $types.val(form.types);

    generateTypes(form);
    generateUrls();
  };

  if (hash) {
    populateForm(JSON.parse(atob(hash)));
  }

  $urls.on('keyup', parseUrls)
  $hosts.on('keyup', generateUrls);
  $types.on('keyup', generateTypes);
  $openAll.on('click', onClick);
});
