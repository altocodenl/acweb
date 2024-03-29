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

var type = teishi.type, clog = console.log, eq = teishi.eq, inc = function (a, v) {return a.indexOf (v) > -1}, reply = cicek.reply, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   }, true);
}, astop = function (rs, path) {
   a.stop (path, function (s, error) {
      reply (rs, 500, {error: error});
   });
}, mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (null, error);
      s.next (data);
   });
}

// *** NOTIFICATIONS ***

var aclog = {
   initialize: function (logProcessingFunction) {
      aclog.send = function (log, CB) {
         CB = CB || clog;
         var freshCookie;
         var login = function (cb) {
            freshCookie = true;
            hitit.one ({}, {
               host:   SECRET.aclog.host,
               https:  SECRET.aclog.https,
               method: 'post',
               path:   SECRET.aclog.basepath + '/auth/login',
               body: {username: SECRET.aclog.username, password: SECRET.aclog.password, timezone: new Date ().getTimezoneOffset ()}
            }, function (error, data) {
               if (error) return CB (error);
               aclog.cookie = data.headers ['set-cookie'] [0];
               aclog.csrf   = data.body.csrf;
               cb ();
            });
         }
         var send = function () {
            if (type (log) !== 'object') return CB ({error: 'Log must be an object but instead is of type ' + type (log), log: log});
            hitit.one ({}, {
               host:   SECRET.aclog.host,
               https:  SECRET.aclog.https,
               method: 'post',
               path:   SECRET.aclog.basepath + '/data',
               headers: {cookie: aclog.cookie},
               body:    {csrf: aclog.csrf, log: logProcessingFunction ? logProcessingFunction (log) : log}
            }, function (error) {
               if (error && error.code === 403 && ! freshCookie) return login (send);
               if (error) return CB (error);
               CB ();
            });
         }
         if (! aclog.cookie) login (send);
         else                send ();
      }
   }
}

aclog.initialize (function (log) {
   log = dale.obj (log, function (v, k) {
      var sv = type (v) === 'string' ? v : JSON.stringify (v);
      var length = (sv || '').length;
      if (length > 5000) v = sv.slice (0, 2500) + ' [' + (length - 5000) + ' CHARACTERS OMITTED' + '] ' + sv.slice (-2500);
      return [k, v];
   });
   log.application = 'ac;web';
   log.environment = ENV;
   return log;
});

var notify = function (s, message) {
   if (! ENV || ! SECRET.aclog.username) {
      clog (new Date ().toUTCString (), message);
      return s.next ();
   }
   aclog.send (message, function (error) {
      if (error) return s.next (null, error);
      else s.next ();
   });
}

// *** ON UNCAUGHT EXCEPTION, REPORT AND CLOSE SERVER ***

var server;

process.on ('uncaughtException', function (error, origin) {
   a.seq ([
      [notify, {priority: 'critical', type: 'server error', error: error, stack: error.stack, origin: origin}],
      function (s) {
         if (! server) process.exit (1);
         else server.destroy (function () {
            process.exit (1);
         });
      }
   ]);
});

// *** KABOOT ***

var k = function (s) {

   var command = [].slice.call (arguments, 1);

   var output = {stdout: '', stderr: '', command: command};

   var options = {};
   var commands = dale.fil (command.slice (1), undefined, function (command) {
      if (type (command) !== 'object' || ! command.env) return command;
      options.env = command.env;
   });

   var proc = require ('child_process').spawn (command [0], commands, options);

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (output.code === 0) s.next (output);
      else                   s.next (0, output);
   }

   dale.go (['stdout', 'stderr'], function (v) {
      proc [v].on ('data', function (chunk) {
         output [v] += chunk;
      });
      proc [v].on ('end', done);
   });

   proc.on ('error', function (error) {
      output.err += error + ' ' + error.stack;
      done ();
   });
   proc.on ('exit',  function (code, signal) {
      output.code = code;
      output.signal = signal;
      done ();
   });
}

// *** ROUTES ***

var makePage = function (body, head, params) {
   return lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {charset: 'utf-8'}],
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,900;1,400;1,600&display=swap'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Fira+Code&display=swap'}],
            ['link', {rel: 'canonical', href: 'https://altocode.nl' + params.url}],
            dale.go (['robots', 'googlebot', 'bingbot'], function (v) {
               return ['meta', {name: v, content: 'index, follow'}];
            }),
            // Open Graph Protocol
            ['meta', {property: 'og:locale', content: 'en_US'}],
            ['meta', {property: 'og:type', content: params.type}],
            ['meta', {property: 'og:title', content: params.title}],
            ['meta', {property: 'og:description', content: params.description}],
            ['meta', {property: 'og:url', content: 'https://altocode.nl' + params.url}],
            ['meta', {property: 'og:site_name', content: 'Altocode'}],
            params.images && params.images [0] ? [
               ['meta', {property: 'og:image', content: params.images [0]}],
               ['meta', {property: 'og:image:alt', content: params.title}],
            ] : [],
            head || [],
            ['script', {type: 'application/ld+json'}, JSON.stringify ({
               '@context': "http://schema.org",
               '@type': 'WebPage',
               name: params.title,
               description: params.description,
               publisher: {
                  '@type': 'ProfilePage',
                  name: 'Altocode - We create applications to empower humans.'
               }
            }, null, '   ')],
            ! params.breadcrumbs ? [] : ['script', {type: 'application/ld+json'}, JSON.stringify ({
               '@context': "http://schema.org",
               '@type': 'BreadCrumbList',
               itemListElement: dale.go (params.breadcrumbs, function (v, k) {
                  return {
                     '@type': 'ListItem',
                     position: k + 1,
                     name: v [0],
                     item: 'https://altocode.nl' + v [1]
                  };
               }),
            }, null, '   ')],
            ! params.articleDate ? [] : ['script', {type: 'application/ld+json'}, JSON.stringify ({
               '@context': "http://schema.org",
               '@type': 'Article',
                mainEntityOfPage: {
                   '@type': 'WebPage',
                   '@id': 'https://altocode.nl/'
                },
                name: params.title,
                headline: params.title,
                author: {
                   '@type': 'Organization',
                   name: 'Altocode',
                },
                publisher: {
                   '@type': 'Organization',
                   name: 'Altocode',
                },
                image: params.images && params.images [0] ? params.images [0] : undefined,
                datePublished: params.articleDate,
                dateModified: params.articleDate,
                articleSection: 'blog',
                url: 'https://altocode.nl/' + params.breadcrumbs [1],
             }, null, '   ')],
         ]],
         ['body', [
            body,
         ]],
      ]]
   ]);
}

var blog = [];

var routes = [

   // *** UPTIME ROBOT ***

   ['head', '*', function (rq, rs) {
      reply (rs, ['/', '/blog', '/blog/', '/pic', '/pic/'].indexOf (rq.url) !== -1 ? 200 : 404);
   }],

   // *** DOCS ***

   dale.go (['privacy-policy', 'terms-of-service'], function (v) {
      var html = lith.g ([
         ['!DOCTYPE HTML'],
         ['html', [
            ['head', [
               ['meta', {charset: 'utf-8'}],
               ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
               ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'}],
               ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,900;1,400;1,600&display=swap'}],
               ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Fira+Code&display=swap'}],
               ['link', {rel: 'stylesheet', href: '/blog/style.css'}],
               ['link', {rel: 'canonical', href: 'https://altocode.nl/' + v}],
            ]],
            ['body', [
               ['LITERAL', showdown.makeHtml (fs.readFileSync ('docs/' + v + '.md', 'utf8'))]
            ]],
         ]],
      ]);
      return ['get', v, function (rq, rs) {
         reply (rs, 200, html, 'html');
      }];
   }),

   // *** BLOG ***

   // TODO: strip trailing slash in cicek
   ['get', /^\/blog\/$/, reply, (function () {
      var articles = fs.readdirSync ('blog');
      articles = dale.fil (articles, undefined, function (article) {
         if (! article.match (/\.md/)) return;
         var content = fs.readFileSync ('blog/' + article, 'utf8');
         var description = content.split ('\n') [0];
         return {
            filename: article.slice (9).slice (0, -3),
            description: description,
            date: article.slice (0, 8),
            // Second line contains the title
            title: content.split ('\n') [1].replace (/#\s+/, ''),
            text: showdown.makeHtml (content.replace (description + '\n', '')),
            images: []
         }
      });
      articles.sort (function (a, b) {
         return parseInt (b.date) - parseInt (a.date);
      });
      blog = articles;
      return makePage ([
         ['h1', 'Altocode\'s blog'],
         ['ul', dale.go (articles, function (article) {
            return ['li', [[article.date.slice (6, 8), article.date.slice (4, 6), article.date.slice (0, 4)].join ('-'), ['a', {class: 'title', href: article.filename}, article.title]]];
         })],
         ['br'],
         ['a', {href: '/'}, 'Back to the home page.'],
      ], [
         ['link', {rel: 'stylesheet', href: '/blog/style.css'}],
         ['title', 'Altocode\'s blog']
      ], {url: '/blog', description: 'Altocode\'s blog', title: 'Altocode', type: 'website', breadcrumbs: [['Blog', '/blog']]});
   }) ()],

   ['get', 'blog/img/(*)', function (rq, rs) {
      // cache-control required by search engines to not be penalized, despite having etags already.
      cicek.file (rq, rs, 'blog/img/' + rq.data.params [0], {'cache-control': 'max-age=' + (60 * 60 * 24 * 365 * 10)});
   }],

   ['get', 'blog/style.css', cicek.file, 'blog/style.css'],

   ['get', 'blog*', function (rq, rs) {
      var article = dale.stopNot (blog, undefined, function (article) {
         if (article.filename === rq.url.replace (/\/blog\//, '')) return article;
      });
      if (! article) return reply (rs, 404, 'Article not found!');
      reply (rs, 200, makePage ([
         ['LITERAL', article.text],
         ['br'],
         ['a', {href: '/blog'}, 'Back to the blog.'],
      ], [
         ['link', {rel: 'stylesheet', href: '/blog/style.css'}],
         ['meta', {name: 'description', content: article.description}],
         ['title', article.title + ' | Altocode\'s blog']
      ], {title: article.title, description: article.description, url: rq.url, images: article.images, type: 'article', breadcrumbs: [['Blog', '/blog'], [article.title, '/blog/' + article.filename]], articleDate: [article.date.slice (0, 4), article.date.slice (4, 6), article.date.slice (6, 8)].join ('-')}));
   }],

   ['get', 'robots.txt', reply, (function () {
      return 'Sitemap: https://altocode.nl/sitemap.xml';
   }) ()],

   ['get', 'sitemap.xml', reply, (function () {
      var output = '<?xml version="1.0" encoding="UTF-8"?>';
      output += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http:www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
      // TODO: rest of the SEO
      dale.go (['/', '/blog'], function (url) {
         output += '<url><loc>https://altocode.nl' + url + '</loc></url>';
      });
      dale.go (['/pic'], function (url) {
         var images = fs.readFileSync ('pic/index.html', 'utf8').match (/<img[^>]+/g);
         if (images !== null) {
            images = dale.go (images, function (image) {
               return 'https://altocode.nl/pic/img/' + encodeURIComponent (image.replace ('img/', '').match (/src="[^"]+/) [0].replace ('src="', ''));
            });
         }
         output += '<url><loc>https://altocode.nl' + url + '</loc>';
         dale.go (images, function (image) {
            output += '<image:image><image:loc>' + image + '</image:loc></image:image>';
         });
         output += '</url>';
      });
      dale.go (blog, function (article) {
         var images = article.text.match (/<img[^>]+/g);
         if (images !== null) {
            images = dale.go (images, function (image) {
               return 'https://altocode.nl/blog/img/' + encodeURIComponent (image.replace ('img/', '').match (/src="[^"]+/) [0].replace ('src="', ''));
            });
            article.images = images;
         }
         output += '<url>';
         output += '<loc>https://altocode.nl/blog/' + encodeURIComponent (article.filename) + '</loc>';
         if (images) dale.go (images, function (image) {
            output += '<image:image><image:loc>' + image + '</image:loc></image:image>';
         });
         output += '</url>';
      });
      return output + '</urlset>';
   }) ()],

   // *** AC;PIC HOME ***

   // TODO: strip trailing slash in cicek
   ['get', /^\/pic\/$/, cicek.file, 'pic/index.html'],
   ['get', /^\/pic\/pricing$/, cicek.file, 'pic/pricing.html'],
   ['get', 'pic/style.css', cicek.file, 'pic/style.css'],
   ['get', 'pic/img/(*)', function (rq, rs) {
      // cache-control required by search engines to not be penalized, despite having etags already.
      cicek.file (rq, rs, 'pic/img/' + rq.data.params [0], {'cache-control': 'max-age=' + (60 * 60 * 24 * 365 * 10)});
   }],

   // *** STATIC ASSETS ***

   ['get', 'favicon.ico', cicek.file, 'favicon.ico'],

   ['get', '/', reply, makePage ([
      ['noscript', 'Javascript is deactivated in your browser. Please activate it in order to use this page.'],
      dale.go (['gotob/gotoB.min.js', 'client.js'], function (v) {
         return ['script', {src: (ENV === 'dev' ? 'dev/' : '') + v}
      ]})
   ], ['title', 'Altocode'], {url: '/', description: 'We create simple applications that everyone can understand and use. We focus on quality, not features.', title: 'Altocode', type: 'website'})],
   ['get', 'client.js', cicek.file],

   // *** LIBRARIES ***

   ['get', 'json2.min.js', function (rq, rs) {
      hitit.one ({}, {method: 'get', https: true, host: 'cdn.jsdelivr.net', path: 'gh/douglascrockford/JSON-js@aef828bfcd7d5efaa41270f831f8d27d5eef3845/json2.min.js', code: 200, apres: function (s, rq2, rs2) {
         reply (rs, 200, rs2.body, 'js');
      }});
   }],

   ['get', 'dale',   reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="dale/test.js"></script>'],
   ['get', 'teishi', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="teishi/test.js"></script>'],
   ['get', 'lith', reply, (function () {
      var test = require ('./node_modules/lith/test.js');
      var html = fs.readFileSync ('test.html', 'utf8');
      setTimeout (function () {
         try {
            fs.unlinkSync ('test.html');
         }
         catch (error) {}
      }, 1000);
      html = html.replace (/<script.+/g, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script>' + lith.g (dale.go (['json2.min.js', 'dale/dale.js', 'teishi/teishi.js', 'lith/lith.js', 'lith/test.js'], function (v) {return ['script', {src: v}]})));
      return html;
   }) ()],
   ['get', 'recalc', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="recalc/recalc.js"></script><script src="recalc/test.js"></script>'],
   ['get', 'cocholate', reply, (function () {
      var test = fs.readFileSync ('node_modules/cocholate/test.html', 'utf8');
      test = test.replace (/<script src.+><\/script>/g, '');
      test = test.replace ('<body>', '<body>\n' + '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script>' + lith.g (dale.go (['json2.min.js', 'dale/dale.js', 'teishi/teishi.js', 'lith/lith.js', 'cocholate/cocholate.js'], function (v) {return ['script', {src: v}]})));
      test = test.replace ('\'cocholate.js', '\'cocholate/cocholate.js');
      return test;
   }) ()],
   ['get', 'gotob', reply, (function () {
      try {
         var test = fs.readFileSync ('node_modules/gotob/test.html', 'utf8');
         test = test.replace ('<body>', '<body><script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script>');
         test = test.replace ('https://cdn.jsdelivr.net/gh/douglascrockford/JSON-js@aef828bfcd7d5efaa41270f831f8d27d5eef3845/json2.min.js', 'json2.min.js');
         test = test.replace ('gotoB.min.js', 'gotob/gotoB.min.js');
         return test;
      }
      catch (error) {
         return 'not found';
      }
   }) ()],
   ['get', dale.go (['app', 'examples', 'cart', '7guis', 'todomvc'], function (v) {
      return 'gotob/examples/' + v + '.html';
   }), function (rq, rs) {
      try {
         var test = fs.readFileSync ('node_modules/' + rq.url, 'utf8');
         test = test.replace ('https://cdn.jsdelivr.net/gh/douglascrockford/JSON-js@aef828bfcd7d5efaa41270f831f8d27d5eef3845/json2.min.js', '../../json2.min.js');
         reply (rs, 200, test);
      }
      catch (error) {
         reply (rs, 404);
      }
   }],
   dale.go (['dale', 'teishi', 'lith', 'recalc', 'cocholate', 'gotob'], function (lib) {
      return ['get', lib + '/(*)', cicek.file, ['node_modules/' + lib]];
   }),
];

// *** SERVER CONFIGURATION ***

cicek.options.log.console  = false;

cicek.apres = function (rs) {
   if (rs.log.code >= 400) {
      var ignore = dale.stop ([
         ['/auth/csrf',   403],
         ['/favicon.ico', 403]
      ], true, function (toIgnore) {
         return rs.log.url === toIgnore [0] && rs.log.code === toIgnore [1];
      });
      if (! ignore) notify (a.creat (), {priority: rs.log.code >= 500 ? 'critical' : 'normal', type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, userAgent: rs.log.requestHeaders ['user-agent'], headers: rs.log.requestHeaders, body: rs.log.requestBody, data: rs.log.data, user: rs.request.user ? rs.request.user.username : null, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
   }

   cicek.Apres (rs);
}

cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;
   var notification;
   if (message [1] === 'client error') {
      if (message [2] === 'Error: read ECONNRESET') return;
      if (message [2].match ('Error: Parse Error:')) return;
      notification = {
         priority: 'important',
         type:    'client error in server',
         from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
         error:   message [2]
      }
   }
   else if (message [1] === 'Invalid signature in cookie') {
      // TODO: re-add notification once cicek ignores attributes in cookies
      return;
      /*
      notification = {
         priority: 'important',
         type: 'invalid signature in cookie',
         from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
         error:   message [2]
      }
      */
   }
   else if (message [1].match (/cicek\.(reply|file) validation error/) && message [2].match (/response.connection.writable passed to cicek.(reply|file) should be equal to true but instead is false/)) notification = {
      priority: 'normal',
      type:    'client error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }
   else if (message [1] === 'worker error') notification = {
      priority: 'critical',
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }
   else notification = {
      priority: 'critical',
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }

   notify (a.creat (), notification);
}

cicek.cluster ();

server = cicek.listen ({port: CONFIG.port}, routes);

if (cicek.isMaster) a.seq ([
   [k, 'git', 'rev-parse', 'HEAD'],
   function (s) {
      if (s.error) return notify (a.creat (), {priority: 'critical', type: 'server start', error: s.error});
      notify (a.creat (), {priority: 'important', type: 'server start', sha: s.last.stdout.slice (0, -1)});
   }
]);

process.on ('uncaughtException', function (error, origin) {
   a.seq ([
      [notify, {priority: 'critical', type: 'server error', error: error, stack: error.stack, origin: origin}],
      function (s) {
         if (! server) process.exit (1);
         else server.close (function () {
            process.exit (1);
         });
      }
   ]);
});
