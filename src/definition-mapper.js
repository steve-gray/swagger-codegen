'use strict';

const debug = require('debug')('swagger-codegen:definition-mapper');
const util = require('util');

/**
 * Map the definitions from a Swagger model
 * @param {object} model      - Swagger model
 * @return                    - Map of definition name to definition body
 */
function mapDefinitionsFromModel(model) {
  const definitionMap = [];

  /* istanbul ignore else */
  if (model && model.definitions) {
    debug('Parsing %s definitions', Object.keys(model.definitions).length);
    for (const definitionName of Object.keys(model.definitions)) {
      debug('  Reading definition for %s', definitionName);
      const definitionKey = util.format('#/definitions/%s', definitionName);
      const currentDef = model.definitions[definitionName];
      currentDef.definitionName = definitionName;
      currentDef.referencePath = definitionKey;
      definitionMap[definitionKey] = currentDef;
    }
  }

  return definitionMap;
}

module.exports = mapDefinitionsFromModel;
