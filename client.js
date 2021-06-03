// *** SETUP ***

var dale  = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.t, clog = teishi.clog, media = lith.css.media, style = lith.css.style;

// *** VIEWS OBJECT ***

var views = {};

// *** RESPONDERS ***

B.mrespond ([
   ['initialize', [], function () {
      B.mount ('body', views.main);
   }]
]);

// *** VIEWS ***

views.baseCSS = [
   ['body', {
      'font-family': '\'Montserrat\', sans-serif',
      padding: 30,
      'max-width': 1000,
   }],
   ['p, li', {
      'line-height': '1.6em',
   }],
   ['strong', {
     'font-weight': '600',
   }],
];

views.main = function () {
   return ['div', {style: style ({'margin-left': 3})}, [
      ['style', views.baseCSS],
      ['div', {class: 'opaque', style: style ({'font-size': 36, 'font-weight': 'normal', 'font-family': '\'Montserrat\', monospace'})}, [
         ['span', {style: style ({color: '#5b6eff', 'font-weight': ''})}, 'a'], 'lto;',
         ['br'],
         ['LITERAL', '&nbsp;'], ['span', {style: style ({color: '#5b6eff', 'font-weight': ''})}, 'c'], 'o', ['span', {style: style ({color: ''})}, 'de'],
      ]],
      ['br'],
      ['p', [
         'We create simple & useful software to empower humans. This is our ',
         ['a', {href: 'http://federicopereiro.com/manifesto'}, 'manifesto'],
         '.',
         ' And this is our ',
         ['a', {href: 'http://altocode.nl/blog'}, 'blog'],
         '.',
      ]],
      ['p', 'What is different about us?'],
      ['ul', [
         ['li', 'We create simple software that everyone can understand and use. We focus on quality, not features.'],
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
   ]];
}

// *** INITIALIZATION ***

B.call ('initialize', []);
