/*
altocode-web - v0.0.0

Written by Altocode (https://altocode.nl) and released into the public domain.
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV    = process.argv [2];

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var hitit  = require ('hitit');
var a      = require ('./astack.js');

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


var mailer = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));

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
   clog (message);
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

// *** SENDMAIL ***

var sendmail = function (s, o) {
   o.from1 = o.from1 || SECRET.emailName;
   o.from2 = o.from2 || SECRET.emailAddress;
   mailer.sendMail ({
      from:    o.from1 + ' <' + SECRET.emailAddress + '>',
      to:      o.to1   + ' <' + o.to2 + '>',
      replyTo: o.from2,
      subject: o.subject,
      html:    lith.g (o.message),
   }, function (error, rs) {
      if (! error) return s.next ();
      a.stop (s, [notify, {type: 'mailer error', error: error, options: o}]);
   });
}


// *** ROUTES ***

var routes = [

   ['get', '/', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {charset: 'utf-8'}],
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['title', 'Altocode'],
            ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat+Alternates&display=swap'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Fira+Code&display=swap'}],
         ]],
         ['body', [
            ['noscript', 'Javascript is deactivated in your browser. Please activate it in order to use this page.'],
            dale.go ([
               'gotob/gotoB.min.js',
               'client.js'
            ], function (v) {return ['script', {src: v}]})
         ]]
      ]],
   ])],
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
   ['get', 'recalc', reply, '<script>window.onerror = function () {alert (arguments [0] + " " + arguments [1] + " " + arguments [2])}</script><script src="json2.min.js"></script><script src="dale/dale.js"></script><script src="teishi/teishi.js"></script><script src="recalc/recalc.js"></script><script src="recalc/test.js"></script>'],
   ['get', '(*)', cicek.file, ['node_modules/']],
   dale.go (['dale', 'dale2', 'teishi', 'lith', 'recalc', 'cocholate', 'gotob', 'gotob2'], function (lib) {
      return [];
      //return ['get', '(*)', cicek.file, ['node_modules/']];
   }),
   ['post', 'acpicinvite', function (rq, rs) {
      if (type (rq.body) !== 'object' || type (rq.body.email) !== 'string') return reply (rq, 400, {body: rq.body});
      astop (rs, [
         [sendmail, {
            from1: 'User',
            from2: 'fpereiro@gmail.com',
            to1:   'Chef',
            to2:   'fpereiro@gmail.com',
            subject: 'ac/pic request for subscription',
            message: ['p', [new Date ().toUTCString (), ' ', rq.body.email]],
         }],
         [reply, rs, 200],
      ]);
   }],
];

// *** SERVER CONFIGURATION ***

cicek.options.log.console  = false;

cicek.apres = function (rs) {
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'OMITTED';
   }

   if (rs.log.code >= 400) {
      if (['/favicon.ico', '/lib/normalize.min.css.map'].indexOf (rs.log.url) === -1) notify (a.creat (), {type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, ua: rs.log.requestHeaders ['user-agent'], body: rs.log.requestBody, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
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
