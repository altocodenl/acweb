(function () {

   // TODO: remove iife, v2 style.

   // *** SETUP ***

   var dale  = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
   var type = teishi.t, clog = console.log, time = teishi.time, media = lith.css.media, last = teishi.last;

   var style = function (attributes, prod) {
      var result = lith.css.g (['', attributes], prod);
      return result === false ? result : result.slice (1, -1);
   }

   window.Data  = B.store.Data  = {};
   window.State = B.store.State = {};

   B.prod = true;

   // *** INITIALIZATION ***

   c.ready (function () {
      B.mount ('body', Views.base ({from: {ev: 'ready'}}));
   });

   // *** BASE VIEW ***

   var Views = {};

   Views.baseCSS = [
      ['body', {
         'font-family': '\'Montserrat Alternates\', sans-serif',
         padding: 30,
         'max-width': 1000,
      }],
      ['p, li', {
         'line-height': '1.6em',
      }],
   ];

   Views.base = function () {
      return ['div', {style: style ({'margin-left': 3})}, [
         ['style', Views.baseCSS],
         B.view (['State', 'path'], {listen: [
             ['submit', 'email', function () {
                var email = prompt ('The email address where we should send you an acpic invite:');
                if (! email.match (/^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6}))$/)) {
                   alert ('Please enter a valid email address.');
                   return B.do ('submit', 'email');
                }
                c.ajax ('post', 'acpicinvite', {}, {email: email}, function (error) {
                   if (error) return alert ('Wow, we just experienced a connection error. Could you please try again?');
                   alert ('Your email has been submitted!');
                });
             }],
         ]}, function () {
            return [
               ['div', {class: 'opaque', style: style ({'font-size': 36, 'font-weight': 'normal', 'font-family': '\'Fira Code\', monospace'})}, [
                  ['span', {style: style ({color: 'red', 'font-weight': ''})}, 'a'], 'lto;',
                  ['br'],
                  ['LITERAL', '&nbsp;'], ['span', {style: style ({color: 'red', 'font-weight': ''})}, 'c'], 'o', ['span', {style: style ({color: ''})}, 'de'],
               ]],
               ['br'],
               ['p', [
                  'We create applications to empower humans. This is our ',
                  ['a', {href: 'http://federicopereiro.com/manifesto'}, 'manifesto'],
                  '.',
                  ' And this is our ',
                  ['a', {href: 'http://altocode.nl/blog'}, 'blog'],
                  '.',
               ]],
               ['p', 'What is different about us?'],
               ['ul', [
                  ['li', 'We create simple applications that everyone can understand and use. We focus on quality, not features.'],
                  ['li', 'We treat our users as we like to be treated ourselves: we defend their privacy to the outmost; our users own their own data; and we only make money through charging reasonable fees for application usage.'],
                  ['li', [['a', {href: 'https://github.com/altocodenl'}, 'Our applications are 100% open source'], '. Anyone can see our source code, contribute their own, or start a competing product using it. We\'d rather share our knowledge instead of hoarding it in the hopes of preventing competition.']],
                  ['li', [['a', {href: 'https://drive.google.com/drive/folders/1otweqrARCHe2u6DeHW3FDZmug0L1Wd6p'}, 'We work in the open.'], ' Our internal documents, inasmuch as they don\'t refer to particular individuals outside of our team, are public.']],
                  ['li', ['Our business model is that of a ', ['strong', 'digital utility'], '. Our users pay to use our products based on how much space they use on our servers. Besides covering the server cost, users are also contributing to the development and maintenance of quality applications.']],
               ]],
               ['h3', 'Apps'],
               ['ul', [
                  ['li', [
                     [['a', {target: '_blank', href: 'https://altocode.nl/pic'}, 'ac;pic'], ': '],
                     'A digital home for your pictures'
                  ]],
               ]],
               ['h3', 'Team'],
               ['ul', [
                  ['li', [
                     [['a', {target: '_blank', href: 'http://federicopereiro.com'}, 'Federico Pereiro'], ': '],
                     ['strong', ' Chef'],
                     ', Leiden, Netherlands.'
                  ]],
                  ['li', [
                     [['a', {target: '_blank', href: 'https://about.me/tomsawada'}, 'Tom Sawada'], ': '],
                     ['strong', ' Maître d\''],
                     ', St. Louis, Missouri, USA.'
                  ]],
                  ['li', [
                     [['a', {target: '_blank', href: 'http://rubenmeines.com/'}, 'Ruben Meines'], ': '],
                     ['strong', ' Saucier'],
                     ', Leiden, Netherlands.'
                  ]]
               ]]
            ];
         })
      ]];
   }

}) ();
