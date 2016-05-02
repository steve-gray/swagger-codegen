'use strict';
/* istanbul ignore next */
/* eslint-disable no-console */

/**
 * Handle failures in the application by terminating.
 * @param {Exception}   err       - Exception to handle.
 */
module.exports = (err) => {
  console.log(err);
  console.log(err.stack);
  process.exit(-1);
};
