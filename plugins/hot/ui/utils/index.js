/**
 * @package koa-webpack-dev-service
 * @license MIT
 * @version 0.5.8
 * @author nuintun <nuintun@qq.com>
 * @description A koa 2 middleware for webpack development and hot reloading.
 * @see https://github.com/nuintun/koa-webpack-dev-service#readme
 */

/**
 * @module utils
 */
const defaultStyleElement = document.createElement('style');
function injectCSS(css, styleElement = defaultStyleElement) {
  const { head } = document;
  styleElement.appendChild(document.createTextNode(css.trim()));

  if (!head.contains(styleElement)) {
    head.appendChild(styleElement);
  }

  return styleElement;
}
function appendHTML(html, parent) {
  const nodes = [];
  const parser = new DOMParser();
  const stage = parent || document.body;
  const fragment = document.createDocumentFragment();
  const { body } = parser.parseFromString(html.trim(), 'text/html');

  while (body.firstChild) {
    nodes.push(fragment.appendChild(body.firstChild));
  }

  stage.appendChild(fragment);
  return nodes;
}

export { appendHTML, injectCSS };
