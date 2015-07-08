define(['hogan'], function(Hogan) {
  var t = {
    /* jshint ignore:start */
    'link' : new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("links",c,p,1),c,p,0,10,115,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<hr>");t.b("\n" + i);if(t.s(t.d("links.list",c,p,1),c,p,0,31,94,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <a href=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\" title=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\" target=\"_blank\">");t.b(t.v(t.d(".",c,p,0)));t.b("</a><br>");t.b("\n" + i);});c.pop();}t.b("<hr>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }}),
    'param' : new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"param col-xs-6\">");t.b("\n" + i);t.b("  <div class=\"form-group\">");t.b("\n" + i);t.b("    <label for=\"");t.b(t.v(t.f("param",c,p,0)));t.b("\">");t.b(t.v(t.f("param",c,p,0)));t.b("</label>");t.b("\n" + i);t.b("    <textarea id=\"");t.b(t.v(t.f("param",c,p,0)));t.b("\" name=\"");t.b(t.v(t.f("param",c,p,0)));t.b("\" class=\"form-control\" placeholder=\"");t.b(t.v(t.f("param",c,p,0)));t.b("\" rel=\"");t.b(t.v(t.f("param",c,p,0)));t.b("\"></textarea>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>'");t.b("\n");return t.fl(); },partials: {}, subs: {  }})
    /* jshint ignore:end */
  },
  r = function(n) {
    var tn = t[n];
    return function(c, p, i) {
      return tn.render(c, p || t, i);
    };
  };
  return {
    'link' : r('link'),
    'param' : r('param')
  };
});