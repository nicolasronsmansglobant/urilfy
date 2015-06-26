$(function () {
  var $input = $('#input'),
      $hosts = $('#hosts'),
      $paths = $('#paths'),
      $tnames = $('#tnames'),
      $viewoverrides = $('#viewoverrides'),
      $mvts = $('#mvts'),
      $output = $('#output');

  var onUpdate = function () {
    var hostsVal = $hosts.val(),
        pathsVal = $paths.val(),
        tnamesVal = $tnames.val(),
        viewoverridesVal = $viewoverrides.val(),
        mvtsVal = $mvts.val(),
        hosts = hostsVal.split('\n'),
        paths = pathsVal.split('\n'),
        tnames = tnamesVal.split('\n'),
        viewoverrides = viewoverridesVal.split('\n'),
        mvts = mvtsVal.split('\n'),
        output = '';

        console.log($input.serialize(), btoa($input.serialize()), atob(btoa($input.serialize())));

    if (hostsVal) {

      var toCombinate = [{
        type: 'hosts',
        list: hosts
      }];

      if (pathsVal) {
        toCombinate.push({
          type: 'paths',
          list: paths
        });
      }

      if (tnamesVal) {
        toCombinate.push({
          type: 'tnames',
          list: tnames
        });
      }

      if (viewoverridesVal) {
        toCombinate.push({
          type: 'viewoverrides',
          list: viewoverrides
        });
      }

      if (mvtsVal) {
        toCombinate.push({
          type: 'mvts',
          list: mvts
        });
      }

      if (toCombinate.length > 1) {
        var links = combinateAll(toCombinate).list;

        for (var i = 0, linksLen = links.length; i < linksLen; i++) {
          var link = links[i].replace('&', '?');

          output += '<a href="' + link + '" title="' + link + '" target="_blank">' + link + '</a><br>';
        }

        output += '<hr>';
        output += '<button id="btn-all" title="Open all">Open all</button>';
      }
    }

    $output.html(output);
  },
  combinateAll = function (arrays) {
    if (arrays.length) {
     if (arrays.length > 4) {
        return combinate(arrays[0], combinate(arrays[1], combinate(arrays[2], combinate(arrays[3], arrays[4]))));
      } else if (arrays.length > 3) {
        return combinate(arrays[0], combinate(arrays[1], combinate(arrays[2], arrays[3])));
      } else if (arrays.length > 2) {
        return combinate(arrays[0], combinate(arrays[1], arrays[2]));
      } else if (arrays.length > 1) {
        return combinate(arrays[0], arrays[1]);
      }

      return arrays[0];
    }
  },
  combinate = function (obj1, obj2) {
    var array = [];

    for (var i = 0, obj1Len = obj1.list.length; i < obj1Len; i++) {
      if (obj1.list[i]) {
        for (var j = 0, obj2Len = obj2.list.length; j < obj2Len; j++) {
          if (obj2.list[j]) {
            var part1 = obj1.list[i],
                part2 = obj2.list[j];

            if (obj1.type === 'hosts' && part1.charAt(part1.length - 1) !== '/') {
              part1 += '/';
            }

            if (obj1.type === 'paths') {
              if (part1.charAt(0) === '/') {
                part1 = part1.substring(1);
              }
              if (part1.charAt(part1.length - 1) !== '/') {
                part1 += '/';
              }
            }
            if (obj2.type === 'paths') {
              if (part2.charAt(0) === '/') {
                part2 = part2.substring(1);
              }
              if (part2.charAt(part2.length - 1) !== '/') {
                part2 += '/';
              }
            }

            if (obj1.type === 'tnames') {
              part1 = '&tName=' + part1;
            }
            if (obj2.type === 'tnames') {
              part2 = '&tName=' + part2;
            }

            if (obj1.type === 'viewoverrides') {
              part1 = '&viewOverride=' + part1;
            }
            if (obj2.type === 'viewoverrides') {
              part2 = '&viewOverride=' + part2;
            }

            if (obj1.type === 'mvts') {
              part1 = '&mvt=' + part1;
            }
            if (obj2.type === 'mvts') {
              part2 = '&mvt=' + part2;
            }

            array.push(part1 + part2);
          }
        }
      }
    }

    return {
      type: 'mixed',
      list: array
    };
  },
  onClick = function () {
    $output.find('a').each(function () {
      openWindow($(this).attr('href'));
    });
  },
  openWindow = function (href) {
    window.open(href, '_blank');
  };

  $hosts.on('keyup', onUpdate);
  $paths.on('keyup', onUpdate);
  $tnames.on('keyup', onUpdate);
  $viewoverrides.on('keyup', onUpdate);
  $mvts.on('keyup', onUpdate);
  $('body').on('click', '#btn-all', onClick);
});
