// Definition file header
{{#with definition}}
  // Property list
  {{#each properties}}
    DIRECT MEMBER: {{@key}}
  {{/each}}
{{else}}
  Error
{{/with}}