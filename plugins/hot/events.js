/**
 * @package koa-webpack-dev-service
 * @license MIT
 * @version 0.5.8
 * @author nuintun <nuintun@qq.com>
 * @description A koa 2 middleware for webpack development and hot reloading.
 * @see https://github.com/nuintun/koa-webpack-dev-service#readme
 */

import 'core-js/modules/web.dom-collections.iterator.js';

/**
 * @module events
 */
const events = {
  ok: [],
  hash: [],
  invalid: [],
  progress: [],
  problems: []
};
function emit(event, message, options) {
  const callbacks = events[event];

  if (callbacks && callbacks.length > 0) {
    for (const callback of callbacks) {
      callback(message, options);
    }
  }
}
/**
 * @function on
 * @description Add an event listener callback.
 * @param event Event name.
 * @param callback Event listener callback.
 */

function on(event, callback) {
  const callbacks = events[event];

  if (callbacks) {
    callbacks.push(callback);
  }
}
/**
 * @function off
 * @description Remove an event listener callback.
 * @param event Event name.
 * @param callback Event listener callback.
 */

function off(event, callback) {
  const callbacks = events[event];

  if (callbacks) {
    if (callback) {
      const index = callbacks.indexOf(callback);

      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    } else {
      events[event] = [];
    }
  }
}

export { emit, off, on };
