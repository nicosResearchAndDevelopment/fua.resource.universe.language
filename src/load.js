module.exports = {
  '@context': 'fua.load.rdf',
  'dct:identifier': __filename,
  'dct:format': 'application/fua.load+js',
  'dct:title': 'load',
  'dct:alternative': '@fua/resource.universe.language',
  'dct:requires': [{
    'dct:identifier': '../data/languages.ttl',
    'dct:format': 'text/turtle'
  }]
};
