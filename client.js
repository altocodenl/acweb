// *** SETUP ***

var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.type, clog = teishi.clog, media = lith.css.media, style = lith.css.style, inc = function (a, v) {return a.indexOf (v) > -1}

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
      'font-style': 'normal',
      'max-width': 1000,
      'line-height': '1.5rem',
      'color': '#484848',
      'background': '#fff',
      'padding-left': .01,
      width: 1,
      height: 1,
   }],
   ['.h1', {
      'font-weight': '600',
      'font-size': '2.5em',
      'font-style': 'normal',
      'color': '#5b6eff'
   }],
   ['p, li', {
      'line-height': '1.6em',
      'font-size': 20,
      'font-weight': 'normal',
   }],
   ['strong', {
     'font-weight': '600',
   }],
   ['.logo-container', {
      'margin-top': .02,
   }],
   ['.tagline', {
      'text-align': 'center',
   }]
];

views.main = function () {
   return ['div', {style: style ({'margin-left': 3})}, [
      ['style', views.baseCSS],
      ['div', {class: 'logo-container'},[
         ['span', {class: 'h1'}, 'altocode'],
         ['br'],
         ['span', {class: 'tagline'}, 'Commit to the future']
      ]],
      ['br'],
      ['p', [
         'We create simple & useful software to empower humans. This is our ',
         ['a', {href: 'blog/manifesto'}, 'manifesto'],
         '.',
         ' And this is our ',
         ['a', {href: 'blog'}, 'blog'],
         '.',
      ]],
      ['p', 'What is different about us?'],
      ['ul', [
         ['li', [['strong', 'We create simple software'], ' that everyone can understand and use. We focus on quality, not features.']],
         ['li', [['strong', 'We treat our users as we like to be treated ourselves:'], ' we defend their privacy to the outmost; our users own their own data; and we only make money through charging reasonable fees for application usage.']],
         ['li', [['a', {target: '_blank', href: 'https://github.com/altocodenl'}, 'Our applications are 100% open source'], '. Anyone can see our source code, contribute their own, or start a competing product using it. We\'d rather share our knowledge instead of hoarding it in the hopes of preventing competition.']],
         ['li', [['a', {target: '_blank', href: 'https://drive.google.com/drive/folders/1otweqrARCHe2u6DeHW3FDZmug0L1Wd6p'}, 'We work in the open.'], ' Our internal documents, inasmuch as they don\'t refer to particular individuals outside of our team, are public.']],
         ['li', ['Our business model is that of a ', ['strong', 'digital utility'], '. Our users pay to use our products based on how much space they use on our servers. Besides covering the server cost, users are also contributing to the development and maintenance of quality applications.']],
      ]],
      ['h3', 'Apps'],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'https://altocode.nl/pic'}, 'tagaway'], ': '],
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
