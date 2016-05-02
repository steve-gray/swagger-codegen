'use strict';

const codegen = require('../src');
const dircompare = require('dir-compare');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const yaml = require('yamljs');
const util = require('util');


/**
 * This file runs output tests from ./test/output-tests. Each folder has a:
 *    swagger.yaml  - Service definition
 *    templates/
 *      perPath/
 *        *.hbs     - Templates to render per-path
 *      perDefinition/
 *        *.hbs     - Templates to render per-definition
 * The collective content of the files is compared to the output directory.
 */
describe('Output Testing', () => {
  const globbed = glob.sync('./tests/output-tests/**/swagger.yaml', {});
  for (const file of globbed) {
    const parsed = path.parse(file);
    const caseName = parsed.dir.split('/').slice(-1);

    const perDefTemplates = glob.sync(path.join(parsed.dir, 'templates', 'perDefinition', '*.*'));
    const perDefinition = [];
    for (const subFile of perDefTemplates) {
      const parsedChild = path.parse(subFile);
      perDefinition[subFile] = {
        target: path.join(parsed.dir, 'output', 'definitions', parsedChild.name),
        extension: parsedChild.ext,
      };
    }

    const perPathTemplates = glob.sync(path.join(parsed.dir, 'templates', 'perPath', '*.*'));
    const perPath = [];
    for (const subFile of perPathTemplates) {
      const parsedChild = path.parse(subFile);
      perPath[subFile] = {
        groupBy: 'x-swagger-router-controller',
        target: path.join(parsed.dir, 'output', 'paths', parsedChild.name),
        extension: parsedChild.ext,
      };
    }

    const context = {
      swagger: yaml.load(file),
      perDefinition,
      perPath,
      output: (name, data) => { // eslint-disable-line no-loop-func
        const parsedTarget = path.parse(name);
        mkdirp.sync(parsedTarget.dir);
        fs.writeFileSync(name, data, {
          encoding: 'utf8',
        });
      },
    };

    it(util.format('Test Case: %s', caseName), () => { // eslint-disable-line no-loop-func
      const outputFolder = path.join(parsed.dir, 'output');
      const referenceFolder = path.join(parsed.dir, 'reference');
      rimraf.sync(outputFolder);
      codegen(context);
      const result = dircompare.compareSync(referenceFolder, outputFolder, {
        compareContent: true,
      });

      // Generate the error report
      if (!result.same) {
        const fileDetails = [];
        result.diffSet.forEach((item) => {
          // Difference type
          const state = {
            equal: '==',
            left: 'Missing from output',
            right: 'Extra output file',
            distinct: 'Content difference',
          }[item.state];

          // Log item
          if (state !== '==') {
            fileDetails.push({
              left: {
                type: item.type1 || '',
                name: item.name1 || '',
              },
              right: {
                type: item.type2 || '',
                name: item.name2 || '',
              },
              state,
            });
          }
        });

        throw new Error(JSON.stringify(fileDetails, 4));
      }
    });
  }
});
