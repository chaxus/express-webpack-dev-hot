/**
 * @package koa-webpack-dev-service
 * @license MIT
 * @version 0.5.8
 * @author nuintun <nuintun@qq.com>
 * @description A koa 2 middleware for webpack development and hot reloading.
 * @see https://github.com/nuintun/koa-webpack-dev-service#readme
 */

/**
 * @module hot
 */
// Last error.
let error; // Last update hash.

let hash = __webpack_hash__; // HMR status.

let status = 'idle';
/**
 * @function isUpdateAvailable
 * @description Is there a newer version of this code available.
 */

function isUpdateAvailable() {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by webpack.
  return hash !== __webpack_hash__;
}
/**
 * @function updateHash
 * @description Update hash.
 * @param value - The new hash value.
 */

function updateHash(value) {
  hash = value;
}
/**
 * @function updateStatus
 * @description Update status.
 * @param value The new status of the hot update.
 */

function updateStatus(value) {
  status = value;
} // Initialize status.

if (import.meta.webpackHot) {
  updateStatus(import.meta.webpackHot.status());
}
/**
 * @function applyUpdate
 * @description Apply update.
 * @param hmr Whether to enable HMR.
 * @param fallback Fallback function when HMR fail.
 */

function applyUpdate(hmr, fallback) {
  // Update available.
  if (isUpdateAvailable()) {
    // HMR enabled.
    if (hmr && import.meta.webpackHot) {
      switch (status) {
        case 'idle':
          // Get status.
          updateStatus('check'); // Auto check and apply updates.

          import.meta.webpackHot
            .check(true)
            .then(updated => {
              // Update status.
              updateStatus(import.meta.webpackHot.status()); // When updated modules is available,
              // it indicates server is ready to serve new bundle.

              if (updated) {
                // While update completed, do it again until no update available.
                applyUpdate(hmr, fallback);
              }
            })
            .catch(exception => {
              // Get status.
              const status = import.meta.webpackHot.status(); // Update status.

              if (status === 'fail' || status === 'abort') {
                updateStatus(status);
              } else {
                updateStatus('fail');
              } // Cache error.

              error = exception; // Call fallback.

              fallback(error);
            });
          break;

        case 'fail':
        case 'abort':
          // Call fallback.
          fallback(error);
          break;
      }
    } else {
      // HMR disabled.
      fallback();
    }
  }
}

export { applyUpdate, isUpdateAvailable, updateHash, updateStatus };
