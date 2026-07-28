import cfonts from 'cfonts';

export const banner3 = cfonts.render('WAGURI', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'green'],
  independentGradient: true,
  transitionGradient: true,
  space: true,
});

export const banner2 = cfonts.render(
  'Assim como uma estrela, todo bom codigo eventualmente colapsa sob o peso da propria complexidade.\n@paulo_mod_domina',
  {
    font: 'console',
    align: 'center',
    colors: ['cyan'],
    space: false,
  }
);
