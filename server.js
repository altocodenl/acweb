/*
altocode-web - v0.0.0

Written by Altocode (https://altocode.nl) and released into the public domain.
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV    = process.argv [2];

var fs = require ('fs');

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var hitit  = require ('hitit');
var a      = require ('./astack.js');

var showdown = new (require ('showdown')).Converter ();

var type = teishi.type, clog = console.log, eq = teishi.eq, reply = function () {
   cicek.reply.apply (null, dale.fil (arguments, undefined, function (v, k) {
      if (k === 0 && v && v.path && v.last && v.vars) return;
      return v;
   }));
}, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   });
}, astop = function (rs, path) {
   a.stop (path, function (s, error) {
      reply (rs, 500, {error: error});
   });
}, mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (0, error);
      s.next (data);
   });
}, cbreply = function (rs, cb) {
   return function (error, result) {
      if (error)       return reply (rs, 500, {error: error});
      if (cb === true) return reply (rs, 200);
      if (cb) cb (result);
   };
}

// *** NOTIFICATIONS ***

SECRET.ping.send = function (payload, CB) {
   CB = CB || clog;
   var login = function (cb) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path:   require ('path').join (SECRET.ping.path || '', 'auth/login'),
         body: {username: SECRET.ping.username, password: SECRET.ping.password, tz: new Date ().getTimezoneOffset ()}
      }, function (error, data) {
         if (error) return CB (error);
         SECRET.ping.cookie = data.headers ['set-cookie'] [0];
         cb ();
      });
   }
   var send = function (retry) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path: require ('path').join (SECRET.ping.path || '', 'data'),
         headers: {cookie: SECRET.ping.cookie},
         body:    payload,
      }, function (error) {
         if (error && error.code === 403 && ! retry) return login (function () {send (true)});
         if (error) return CB (error);
         CB ();
      });
   }
   if (SECRET.ping.cookie) {
      payload.cookie = SECRET.ping.cookie;
      send ();
   }
   else login (function () {
      payload.cookie = SECRET.ping.cookie;
      send (true);
   });
}

var notify = function (s, message) {
   if (type (message) !== 'object') return clog ('NOTIFY: message must be an object but instead is', message, s);
   message.environment = ENV || 'local';
   if (! ENV) {
      clog (new Date ().toUTCString (), message);
      return s.next ();
   }
   SECRET.ping.send (message, function (error) {
      if (error) return s.next (null, error);
      else s.next ();
   });
}

// *** ROUTES ***

var makePage = function (body, head) {
   return lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {charset: 'utf-8'}],
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            head || [],
            ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat+Alternates&display=swap'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Fira+Code&display=swap'}],
         ]],
         ['body', body],
      ]]
   ]);
}

var blog = [];

var routes = [

   // *** BLOG ***

   ['get', 'blog', reply, (function () {
      var articles = fs.readdirSync ('blog');
      articles = dale.go (articles, function (article) {
         var content = fs.readFileSync ('blog/' + article, 'utf8');
         var description = content.split ('\n') [0];
         return {
            description: description,
            date: article.slice (0, 8),
            title: article.slice (8).slice (0, -3),
            text: showdown.makeHtml (content.replace (description + '\n', '')),
         }
      });
      articles.sort (function (a, b) {
         return parseInt (b.date) - parseInt (a.date);
      });
      blog = articles;
      return makePage ([
         ['style', [
            ['body', {
               'font-family': '\'Montserrat Alternates\', sans-serif',
               padding: 30,
            }],
            ['a.title', {'margin-left': 10}],
            ['li', {'margin-top': 15}],
         ]],
         ['h1', 'Altocode\'s blog'],
         ['br'],
         ['ul', dale.go (articles, function (article) {
            return ['li', [[article.date.slice (6, 8), article.date.slice (4, 6), article.date.slice (0, 4)].join ('-'), ['a', {class: 'title', href: '/blog/' + article.title}, article.title]]];
         })],
         ['br'],
         ['a', {href: '/'}, 'Back to the home page.'],
      ], ['title', 'Altocode\'s blog']);
   }) ()],

   ['get', 'blog*', function (rq, rs) {
      var article = dale.stopNot (blog, undefined, function (article) {
         if (article.title === rq.url.replace ('\/blog', '')) return article;
      });
      if (! article) return reply (rs, 404, 'Article not found!');
      reply (rs, 200, makePage ([
         ['style', [
            ['body', {
               'font-family': '\'Montserrat Alternates\', sans-serif',
               padding: 30,
               'max-width': 1000,
               margin: 'auto',
               'line-height': '1.5rem'
            }],
         ]],
         ['LITERAL', article.text],
         ['br'],
         ['a', {href: '/blog'}, 'Back to the blog.'],
      ], [
         ['meta', {name: 'description', content: article.description}],
         ['title', article.title + ' | Altocode\'s blog']
      ]));
   }],

   ['get', 'favicon.ico', cicek.file, 'favicon.ico'],

   ['get', '/', reply, makePage ([
      ['noscript', 'Javascript is deactivated in your browser. Please activate it in order to use this page.'],
      dale.go (['gotob/gotoB.min.js', 'client.js'], function (v) {
         return ['script', {src: v}
      ]})
   ], ['title', 'Altocode'])],
   ['get', 'client.js', cicek.file],
   ['get', 'json2.min.js', function (rq, rs) {
      hitit.one ({}, {method: 'get', https: true, host: 'cdn.jsdelivr.net', path: 'gh/douglascrockford/JSON-js@aef828bfcd7d5efaa41270f831f8d27d5eef3845/json2.min.js', code: 200, apres: function (s, rq2, rs2) {
         reply (rs, 200, rs2.body, 'js');
      }});
   }],

   ['get', 'testall.html', reply, '<script>window.onerror = function () {alert (\'There was an error!\'); console.log (\'ERROR\', arguments);}</script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="lith/lith.js"></script><script src="recalc/recalc.js"></script><script src="dale/test.js"></script><script src="teishi/test.js"></script><script src="lith/test.js"></script><script src="recalc/test.js"></script><iframe src="cocholate/test.html"></iframe>', 'html'],
   ['get', 'testallbc.html', reply, '<script>window.onerror = function () {}</script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="lith/lith.js"></script><script src="recalc/recalc.js"></script><script src="dale/test.js"></script><script src="teishi/test.js"></script><script src="lith/test.js"></script><script src="recalc/test.js"></script>', 'html'],
   ['get', 'dale', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="dale/test.js"></script>'],
   ['get', 'teishi', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="teishi/test.js"></script>'],
   ['get', 'lith', reply, '<!DOCTYPE HTML><html><head><meta charset="utf-8"><title>lith test</title><style>html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline;}article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section{display:block;}body{line-height:1;}ol, ul{list-style:none;}blockquote, q{quotes:none;}blockquote:before, blockquote:after, q:before, q:after{content:\'\';}blockquote:before, blockquote:after, q:before, q:after{content:none;}table{border-collapse:collapse;border-spacing:0;}body{padding:10px;}textarea{padding:5px;width:90%;height:150px;font-family:"Lucida Console", Monaco, monospace;line-height:2em;}div.main{width:50%;float:left;}label{font-weight:bold;display:block;margin-top:10px;margin-bottom:10px;}div#output{border:solid 1px;padding:10px;}textarea#outputText{background-color:#DDDDDD;}</style></head><body><div class="main"><label>lith input - insert a valid lith below</label><textarea id="inputLith" onchange="window.recalc ()" onkeydown="window.recalc ()" onkeyup="window.recalc ()"></textarea><label>litc input - insert a valid litc below</label><textarea id="inputLitc" onchange="window.recalc ()" onkeydown="window.recalc ()" onkeyup="window.recalc ()"></textarea><label>Output (will only change if you wrote a valid lith + litc above)</label><textarea readonly="readonly" id="outputText"></textarea></div><div class="main"><label>Div containing HTML output (will only change if you wrote a valid lith + litc)</label><div id="output"></div></div><script>window.noBenchmark = true</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="lith/lith.js"></script><script src="lith/test.js"></script></body></html>'],
   ['get', 'recalc', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="recalc/recalc.js"></script><script src="recalc/test.js"></script>'],
   ['get', '(*)', cicek.file, ['node_modules/']],
   dale.go (['dale', 'dale2', 'teishi', 'lith', 'recalc', 'cocholate', 'gotob', 'gotob2'], function (lib) {
      return [];
      //return ['get', '(*)', cicek.file, ['node_modules/']];
   }),
];

// *** SERVER CONFIGURATION ***

cicek.options.log.console  = false;

cicek.apres = function (rs) {
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'OMITTED';
   }

   if (rs.log.code >= 400) {
      if (['/lib/normalize.min.css.map'].indexOf (rs.log.url) === -1) notify (a.creat (), {type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, ua: rs.log.requestHeaders ['user-agent'], body: rs.log.requestBody, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
   }

   cicek.Apres (rs);
}

cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;
   if (message [1] === 'Invalid signature in cookie') return;
   notify (a.creat (), {
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   });
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

if (cicek.isMaster) setTimeout (function () {
   notify (a.creat (), {type: 'server start'});
}, 1500);
