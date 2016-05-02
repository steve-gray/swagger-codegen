# swagger-codegen

[![Travis-CI Build](https://travis-ci.org/steve-gray/swagger-codegen.svg?branch=master)](https://travis-ci.org/steve-gray/swagger-codegen)
[![Prod Dependencies](https://david-dm.org/steve-gray/swagger-codegen/status.svg)](https://david-dm.org/steve-gray/swagger-codegen)
[![Dev Dependencies](https://david-dm.org/steve-gray/swagger-codegen/dev-status.svg)](https://david-dm.org/steve-gray/swagger-codegen#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/steve-gray/swagger-codegen/badge.svg?branch=master)](https://coveralls.io/github/steve-gray/swagger-codegen?branch=master)
[![npm version](https://badge.fury.io/js/swagger-codegen.svg)](https://badge.fury.io/js/gulp-swagger-codegen)

![Stats]( https://nodei.co/npm/swagger-codegen.png?downloads=true&downloadRank=true&stars=true)
![Downloads](https://nodei.co/npm-dl/swagger-codegen.png?height=2)

Code generation for Swagger based API's. Supports NodeJS 4.x+.

## Overview
A code generation module for simplifying the consumption of Swagger services.
Allows generation of content based on groupings of custom attributes on paths
and per-entity/definition.

The code is intended to be as pluggable as reasonably practical, and pull requests
to support additional features are _very, __very__ welcome_.

## Gulp Task
This module is leveraged in the [gulp-swagger-codegen](https://www.npmjs.com/package/gulp-swagger-codegen)
module, but can be used independently for generating code at runtime. 

## Usage
The code generation can be invoked with:

    const codegen = require('swagger-codegen');

    // Synchonrous method
    codegen({
      // Parse your YAML or JSON and load here
      swagger: yourSwaggerObjectHere,

      // Templates that run per #/definition
      perDefinition: {
        // Substitute for your own handlebars template
        // and generate as many as you want.
        './path/to/def-template.hbs': {
          target: './target-folder',
          extension: '.js', // Default
          /* Add your own options for templates here */
        }
      },

      // Templates that run per grouping of 
      // path attributes
      perPath: {
        // Substitute for your own handlebars template
        // and generate as many as you want.
        './path/to/def-template.hbs': {
          groupBy: 'x-swagger-router-controller',
          target: './controllers',
          extension: '.js', // Default
          operations: ['get', 'put', 'post', 'delete'], // Default
          /* Add your own options for templates here */
        }
      }
    });

## Templating

### Data Context
Each template is provided with a collection of objects to use when generating code.
This collection varies based on the type of template being processed and there are
some fields common across all types. This object is passed as a map to the template
engine as the root-object.

### Common Fields
The following fields are common for all template types:
  - __model__: The complete parsed Swagger content (JSON/object structure)
  - __definitionMap__: A name/definition map of all known definitions in Swaggerfile.
  - __options__: The options object passed into the code-generation function.

### Per-Definition Templates
Generated per entity/#definition in the Swaggerfile, fields are:
  - __definition__: The current definition being processed.

### Per-Path Templates
Fields are:
  - __groupKey__: The value of the groupBy attribute that this file represents.
  - __members__: The map of operations from the swaggerfile that link to this file.
  - __fileName__: The physical file-name this perPath template will use.


### Handlebars Template Helper Functions
#### Registering Your Own
You can register your own `handlebars` helper functions by adding a top-level configuration
property called `helpers` and assigning the functions as key-values. The key will be the
exact block-helper name and the value must be the helper function itself.

#### arrayContains
Does the array contain an item?

      {{#arrayContains arrayProp value}}
        // Template if value is in array
      {{else}}
        // Template if value is not in array
      {{/arrayContains}}

#### compare
Perform a comparison operation.

      {{#compare leftVal operand rightVal}}
        // Template if leftVal op rightVal true
      {{else}}
        // False template
      {{/compare}}

Supported operands are ==, ===, !=, >, >=, <, <= and typeof

#### lowercase
Converts a block to lowercase.

    {{#lowercase}}MAKE ME LOWERCASE{{/lowercase}}

#### lowerFirst
Makes the first character of a block lowercase, but leaves the rest
of the block untouched.

    {{#lowerFirst}}MAKES FIRST M LOWERCASE{{/lowerFirst}}

### property
Property name complication helper.

    {{#property someProp "property-name-with-bad-characters" "resultName"}}
      This scope will be `someProp` but with an extra sub-property of resultName
    {{else}
      This scope will be returned if property-name-with-bad-characters does not exist
    {[/property

This is used primarily because handlebars does not natively seem to permit invalid characters
in variable names. Some of the extended swaggerfile attributes are prefixed with x- and so
to reason about them in templates, you'll need this.

#### uppercase
Converts a block to uppercase.

    {{#uppercase}}i want to be tall{{/uppercase}}

#### upperFirst
Makes the first character of a block uppercas, but leaves the rest
of the block untouched.

    {{#upperFirst}}mAKES THE FIRST m UPPERCASE{{/upperFirst}}

#### withDef
Creates a child scope using the specified definition as the context:

    {{#withDef defReferencePath}}
      // Generate a sub-section that relates to a definition.
    {{/withDef}}

This allows creation of cross-entity relations/nesting, and is shown
being used in the included ES6 definition template.


## Additional options 
In addition to the `swagger`, `perPath` and `perDefinition` options, you 
can pass through the following values. All of the below have default
implementations that can be used:

  - __definitionMapper__ | (model) -> map
    - Compute a map/array of definition names to definitions. Allows you to
      selectively filter or substitute definitions during code generation.
  - __failureHandler__ | (err) -> action
    - Run a command when an error occurs. Processing of the entire code
      generation task is abandoned. Default implementation exits the process
      with an error code of -1 and writes the message/stack trace to stdout.
  - __templateEngine__ | (taskOptions) --> engine
    - Function to create an instance of the template engine. Recieves the entire
      task options as an input. There is a default .helpers property that contains
      the well-known helper functions.
  - __templateLoader__ | (templater) -> templateLoader
    - Function that generates types to handle template loading. Default
      implementation is a class that reads from disk. Returned object
      must have a .loadTemplate object that returns a template-function.
  - __textEncoding__ | (string)
    - Default text encoding when loading templates from files. Default is utf8

## Custom Template Engines
To use a custom template engine besides handlebars:

  - Create a function such as:
        function createTemplateEngine(opts) {
          return new MyTemplateEngine();
        }
  - Pass the template loader as:
        codegen({
          ... task options ...,
          
          templateEngine: createTemplateEngine
        });

Note that 'MyTemplateEngineType' instances must have a .loadTemplate(content)
implementation, where content is the loaded text of the template file. The
.loadTemplate operation _must return a function_ such as:

    // Normally called by the swagger-codegen
    const engine = new MyTemplateEngine();
    
    // Must have a .loadTemplate(string) method
    const templateInstance = engine.loadTemplate(someTextContent);

    // Must be a function that takes context data
    const output = templateInstance(contextData);

Where contextData is the template-type specific context data, as described in
the templating context data section. This model allows most pluggable
template engines to be used in lieu of the default handlebars.

# Licence
This code is MIT licensed and comes without any warranties. Please see
the LICENSE file for specifics.
