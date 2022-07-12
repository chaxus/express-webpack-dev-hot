/**
 * @package koa-webpack-dev-service
 * @license MIT
 * @version 0.5.8
 * @author nuintun <nuintun@qq.com>
 * @description A koa 2 middleware for webpack development and hot reloading.
 * @see https://github.com/nuintun/koa-webpack-dev-service#readme
 */

import 'core-js/modules/web.dom-collections.iterator.js';
import 'core-js/modules/web.url.js';
import 'core-js/modules/web.url-search-params.js';
import createClient from './client.js';
export { off, on } from './events.js';

if (!self.__WDS_HOT_CLIENT_INITIALLED__) {
  self.__WDS_HOT_CLIENT_INITIALLED__ = true;

  const isTLS = protocol => {
    return protocol === 'https:';
  };

  const getCurrentScript = () => {
    const { currentScript } = document;

    if (currentScript) {
      return currentScript;
    }
  };

  const resolveHost = params => {
    let host = params.get('host');
    let tls = params.get('tls') || isTLS(self.location.protocol);

    if (!host) {
      const script = getCurrentScript();

      if (script) {
        const { src } = script;
        const url = new URL(src);
        host = url.host;
        tls = isTLS(url.protocol) || tls;
      } else {
        host = self.location.host;
      }
    }

    return `${tls ? 'wss' : 'ws'}://${host}`;
  };

  const resolveOptions = () => {
    const params = new URLSearchParams(__resourceQuery);
    const host = resolveHost(params);
    const live = params.get('live') !== 'false';
    const overlay = params.get('overlay') !== 'false';

    try {
      return { ...__WDS_HOT_OPTIONS__, host, live, overlay };
    } catch {
      throw new Error('Imported the hot client but the hot server is not enabled.');
    }
  };

  createClient(resolveOptions());
}
