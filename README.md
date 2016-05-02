# swagger-codegen

[![Build Status](https://travis-ci.org/steve-gray/swagger-codegen.svg?branch=master)](https://travis-ci.org/steve-gray/swagger-codegen)

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
