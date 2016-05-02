'use strict';

const debug = require('debug')('swagger-codegen:file-template-loader');
const fs = require('fs');

/**
 * The FileTemplateLoader reads template content from filesystem files.
 */
class FileTemplateLoader {
  /**
   * Initialize a new instance of the FileTemplateLoader
   * @param {function}  templateCompiler    - Function for compiling loaded templates.
   */
  constructor(templateCompiler) {
    this.templateCompiler = templateCompiler;
  }

  /**
   * Load a template file from disk and compile it.
   *
   * @param   {object}    file        - File to load
   * @param   {string}    encoding    - Text encoding to use when reading file
   * @returns {object}                - Compiled template
   */
  loadTemplate(file, encoding) {
    // read from disk
    debug('Loading text file template from %s', file);

    // Read file
    debug('    Reading filecontent as %s', encoding);
    const fileContent = fs.readFileSync(file, encoding);

    // Compile
    debug('    Parsing with templating engine');
    const template = this.templateCompiler.compile(fileContent);
    debug('    Compiled succesfully.');

    return template;
  }
}

module.exports = FileTemplateLoader;
