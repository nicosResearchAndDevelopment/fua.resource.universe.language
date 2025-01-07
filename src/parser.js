const
  persist = require('@fua/module.persistence'),
  dfc = require('@fua/module.dfc'),
  context = require('../data/context.json'),
  factory = new persist.TermFactory(context),
  dataParser = new dfc.CSVTransformer({
    id: 'languages-parser',
    headers: true,
    trim: true
  }),
  rowParser = new dfc.Transformer('languages-parser');

dataParser.use(function (source, output, next) {
  output.dataset = new persist.Dataset(null, factory);
  output.dataset.add(factory.quad(
    factory.namedNode(context.fua_lang),
    factory.namedNode(context.rdf + 'type'),
    factory.namedNode(context.ldp + 'Container')
  ));
  next();
});

dataParser.use(async function (source, output, next) {
  try {
    for (let row of output.rows) {
      if (!row['alpha2']) continue;
      const rowParam = {
        Identifier: row['alpha2'].toLowerCase(),
        ISO_639_1: row['alpha2'],
        ISO_639_2t: row['alpha3-t'],
        ISO_639_2b: row['alpha3-b'],
        EnglishName: row['English'],
        FrenchName: row['French']
      };
      await rowParser(rowParam, output.dataset);
    }
    next();
  } catch (err) {
    next(err);
  }
});

dataParser.use(function (source, output, next) {
  next(null, output.dataset);
});

rowParser.use(function (source, output, next) {
  output.add(factory.quad(
    factory.namedNode(context.fua_lang + source.Identifier),
    factory.namedNode(context.rdf + 'type'),
    factory.namedNode(context.ldp + 'RDFSource')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  output.add(factory.quad(
    factory.namedNode(context.fua_lang),
    factory.namedNode(context.ldp + 'contains'),
    factory.namedNode(context.fua_lang + source.Identifier)
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.EnglishName) output.add(factory.quad(
    factory.namedNode(context.fua_lang + source.Identifier),
    factory.namedNode(context.rdfs + 'label'),
    factory.literal(source.EnglishName, 'en')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.FrenchName) output.add(factory.quad(
    factory.namedNode(context.fua_lang + source.Identifier),
    factory.namedNode(context.rdfs + 'label'),
    factory.literal(source.FrenchName, 'fr')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.ISO_639_1) output.add(factory.quad(
    factory.namedNode(context.fua_lang + source.Identifier),
    factory.namedNode(context.dc + 'language'),
    factory.literal(source.ISO_639_1, factory.namedNode(context.xsd + 'language'))
  ));
  next();
});

rowParser.lock();
module.exports = dataParser.lock();
