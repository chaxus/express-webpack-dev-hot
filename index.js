const { test } = require('./block')
// document.body.append('12345678')
test()

if (module.hot) {
    module.hot.accept();
  }