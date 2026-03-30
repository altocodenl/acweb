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
         'We empower humans through digital means.',
      ]],
      ['p', 'What is different about us?'],
      ['ul', [
         ['li', [['strong', 'We create simple software'], ' that everyone can understand and use. We focus on quality, not features.']],
         ['li', [['strong', 'We are open source:'], ' we work in the open.']],
         ['li', [['strong', 'We are profit-bound:'], ' we\'re in it to make a change, not a pile.']],
      ]],
      ['a', {href: 'blog'}, 'Read more'],
      ['h3', 'Apps'],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'https://buildwithvibey.com'}, 'Vibey'], ': '],
            'Build with words, not code.'
         ]],
      ]],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'https://github.com/altocodenl/cell'}, 'cell'], ': '],
            'A spreadsheet-like programming environment that you can use from any browser'
         ]],
      ]],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'https://tagaway.nl'}, 'tagaway'], ': '],
            'A digital home for your pictures'
         ]],
      ]],
      ['h3', 'Current team'],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'http://federicopereiro.com'}, 'Federico Pereiro'], ': '],
            ['strong', ' Chef'],
            ', Leiden, Netherlands.'
         ]],
      ]],
      ['h3', 'Former, beloved team members'],
      ['ul', [
         ['li', [
            [['a', {target: '_blank', href: 'https://about.me/tomsawada'}, 'Tom Sawada'], ': '],
            ['strong', ' Maître d\''],
         ]],
         ['li', [
            [['a', {target: '_blank', href: 'http://rubenmeines.com/'}, 'Ruben Meines'], ': '],
            ['strong', ' Saucier'],
         ]]
      ]]
   ]];
}

// *** INITIALIZATION ***

B.call ('initialize', []);
