'use strict';

const debug = require('debug')('swagger-codegen:handlebarsEngine');
const hbs = require('handlebars');

/**
 * The handlebarsEngine loads a new instance of handlebars and applies
 * the task-specific helper functions
 */
function handlebarsEngine(taskOptions) {
  debug('Initializing new instance of hbs');
  const handlebars = hbs.create();

  /* istanbul ignore else */
  if (taskOptions.helpers) {
    for (const helper of Object.keys(taskOptions.helpers)) {
      debug('  Registering helper: %s', helper);
      handlebars.registerHelper(helper, taskOptions.helpers[helper]);
    }
  }

  return handlebars;
}

module.exports = handlebarsEngine;
