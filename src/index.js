'use strict';

// NPM Imports
const _ = require('lodash');
const debug = require('debug')('swagger-codegen');
const definitionMapper = require('./definition-mapper');
const defaults = require('defaults-deep');
const failureHandler = require('./failure-handler');
const handlebarsEngine = require('./handlebars-engine');
const handlebarsHelpers = require('./handlebars-helpers');
const path = require('path');
const util = require('util');
const FileTemplateLoader = require('./file-template-loader');

// Configuration Defaults
const configDefaults = {
  definitionMapper,
  failureHandler,
  helpers: handlebarsHelpers,
  templateEngine: handlebarsEngine,
  templateLoader: (templater) => {
    const instance = new FileTemplateLoader(templater);
    return instance;
  },
  textEncoding: 'utf8',
};

/**
 * Perform the code generation tasks for the specified option-set.
 * @param taskOptions           - Task options for the plugin.
 */
function generateCode(taskOptions) {
  try {
    // Perform initialization tasks
    const model = taskOptions.swagger;
    debug('Processing configuration');
    const config = defaults(taskOptions, configDefaults);
    debug('  Initializing template engine');
    const templateEngine = taskOptions.templateEngine(taskOptions);
    debug('  Mapping definitions from file');
    const definitionMap = taskOptions.definitionMapper(model);

    // Execute definition templates
    /* istanbul ignore else - Trivial case */
    if (config.perDefinition) {
      debug('  Executing per-definition templates:');
      for (const templateFile of Object.keys(config.perDefinition)) {
        debug('    Iterating template: %s', templateFile);
        const options = defaults(config.perDefinition[templateFile], {
          extension: '.js',
          operations: ['get', 'put', 'post', 'delete'],
        });
        const template = taskOptions.templateLoader(templateEngine)
          .loadTemplate(templateFile, taskOptions.textEncoding);
        for (const definitionKey of Object.keys(definitionMap)) {
          const definition = definitionMap[definitionKey];

          debug('      Processing definition %s', definitionKey);
          // Copy fields from options into definition for
          const context = {
            model,
            definition,
            definitionMap,
            options,
          };

          debug('      Rendering template');
          const output = template(context);
          const subPath = path.join(options.target,
            definition.definitionName.toLowerCase() +
            options.extension);
          taskOptions.output(subPath, output);
        }
      }
    } else {
      debug('    No per-definition templates specified in perDefinition');
    }

    // Execute path templates
    if (config.perPath) {
      debug('  Executing per-path templates:');
      for (const templateFile of Object.keys(config.perPath)) {
        debug('    Processing template: %s', templateFile);
        const options = defaults(config.perPath[templateFile], {
          extension: '.js',
          operations: ['get', 'put', 'post', 'delete'],
        });
        const template = taskOptions.templateLoader(templateEngine)
          .loadTemplate(templateFile, taskOptions.textEncoding);
        debug('    Iterating paths, grouping operations by %s', options.groupBy);

        const groups = {};

        for (const pathString of Object.keys(model.paths)) {
          debug('      Path: %s', pathString);
          const pathDef = model.paths[pathString];
          let groupKey = pathDef[options.groupBy];
          pathDef.pathString = path;

          // Iterate through the allowed operations
          for (const operationString of _.intersection(Object.keys(pathDef), options.operations)) {
            debug('        Operation: %s', operationString);
            const operationDef = model.paths[pathString][operationString];
            groupKey = operationDef[options.groupBy] || groupKey;
            operationDef.pathDef = pathDef;
            operationDef.operationString = operationString;

            // We need a grouping key at either operation or path level
            /* istanbul ignore if */
            if (groupKey === null || groupKey === undefined) {
              throw new Error(util.format(
                'Cannot map path operation. No groupBy match at path/operation level: %s/%s [%s]',
                pathString,
                operationString,
                options.groupBy));
            }
            debug('          Assigned to output group: %s', groupKey);

            // If the group does not exist, create it
            if (groups[groupKey] === undefined) {
              groups[groupKey] = [];
            }

            // Add to group
            groups[groupKey].push(operationDef);
          } // per operationString
        } // per pathString

        debug('    Rendering template for %s group(s)', Object.keys(groups).length);
        for (const groupKey of Object.keys(groups)) {
          debug('      Processing group: %s', groupKey);

          const context = {};
          context.fileName = groupKey.trim().toLowerCase();
          context.groupKey = groupKey;
          context.members = groups[groupKey];
          context.definitionMap = definitionMap;
          context.model = model;
          context.options = options;

          const output = template(context);
          const subPath = path.join(options.target,
            context.fileName + options.extension);
          taskOptions.output(subPath, output);
        }
      } // per templateFile
    } // if perPath
  } catch (err) {
    /* istanbul ignore next - We don't wan't to test process.exit */
    taskOptions.failureHandler(err);
  }
}

module.exports = generateCode;
