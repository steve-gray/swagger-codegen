'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const helperFunctions = require('../src/handlebars-helpers');
const path = require('path');
const handlebars = require('handlebars');

/* global after, afterEach, before, beforeEach, describe, it */
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(
    (file) => fs.statSync(path.join(srcpath, file)).isDirectory());
}

describe('Templating tests', () => {
  for (const dir of getDirectories('./tests/templating-tests')) {
    it(dir, () => {
      const instance = handlebars.create();
      const helpers = helperFunctions;
      for (const helper of Object.keys(helpers)) {
        instance.registerHelper(helper, helpers[helper]);
      }
      const testRoot = path.join('./tests/templating-tests', dir);

      // Compile template
      const templateContent = fs.readFileSync(path.join(testRoot, 'template.hbs'), 'utf8');
      const template = instance.compile(templateContent);

      // Load input
      const inputContent = fs.readFileSync(path.join(testRoot, 'input.json'), 'utf8');
      const input = JSON.parse(inputContent);

      // Load output
      const outputContent = fs.readFileSync(path.join(testRoot, 'expected.txt'), 'utf8').trim();

      // Run template
      const result = template(input).trim();
      expect(result).to.equal(outputContent);
    });
  }
});
