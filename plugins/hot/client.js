/**
 * @package koa-webpack-dev-service
 * @license MIT
 * @version 0.5.8
 * @author nuintun <nuintun@qq.com>
 * @description A koa 2 middleware for webpack development and hot reloading.
 * @see https://github.com/nuintun/koa-webpack-dev-service#readme
 */

import 'core-js/modules/web.dom-collections.iterator.js';
import { emit } from './events.js';
import Overlay from './ui/overlay.js';
import Progress from './ui/progress.js';
import { applyUpdate, updateHash } from './hot.js';

function createClient(options) {
  let retryTimes = 0;
  let updateTimer;
  const UPDATE_DELAY = 128;
  const MAX_RETRY_TIMES = 10;
  const RETRY_INTERVAL = 3000;
  const progress = new Progress();
  const overlay = new Overlay(options.name);

  const fallback = error => {
    if (options.live) {
      self.location.reload();
    } else if (error) {
      console.error(error);
      console.warn('Use fallback update but you turn off live reload, please reload by yourself.');
    }
  };

  const applyUpdateAsync = () => {
    updateTimer = self.setTimeout(() => {
      applyUpdate(options.hmr, fallback);
    }, UPDATE_DELAY);
  };

  const onInvalid = () => {
    clearTimeout(updateTimer);

    if (options.progress) {
      progress.update(0);
      progress.show();
    }
  };

  const onProgress = ({ value }) => {
    if (options.progress) {
      progress.update(value);
    }
  };

  const onHash = ({ hash }) => {
    updateHash(hash);
  };

  const setProblems = (type, problems) => {
    const maps = {
      errors: ['Error', 'error'],
      warnings: ['Warning', 'warn']
    };
    const [name, method] = maps[type];

    if (options.overlay) {
      overlay.setProblems(type, problems);
    }

    for (const { moduleName, message } of problems) {
      console[method](`${name} in ${moduleName}\r\n${message}`);
    }
  };

  const onProblems = ({ errors, warnings }) => {
    progress.hide();
    setProblems('errors', errors);
    setProblems('warnings', warnings);

    if (options.overlay) {
      overlay.show();
    }

    if (errors.length <= 0) {
      applyUpdateAsync();
    }
  };

  const onSuccess = () => {
    overlay.hide();
    progress.hide();
    applyUpdateAsync();
  };

  const parseMessage = message => {
    try {
      return JSON.parse(message.data);
    } catch {
      return null;
    }
  };

  const createWebSocket = url => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      retryTimes = 0;
    };

    ws.onmessage = message => {
      const parsed = parseMessage(message);

      if (parsed) {
        const { action, payload } = parsed;

        switch (action) {
          case 'invalid':
            onInvalid();
            break;

          case 'progress':
            onProgress(payload);
            break;

          case 'hash':
            onHash(payload);
            break;

          case 'problems':
            onProblems(payload);
            break;

          case 'ok':
            onSuccess();
            break;
        }

        emit(action, payload, options);
      }
    };

    ws.onclose = () => {
      overlay.hide();
      progress.hide();

      if (retryTimes++ < MAX_RETRY_TIMES) {
        setTimeout(() => {
          createWebSocket(url);
        }, RETRY_INTERVAL);
      }
    };
  };

  createWebSocket(options.host + options.path);
}

export { createClient as default };
