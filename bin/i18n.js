'use strict';

var i18n = require('i18n'),
    constant = require('./constant');

i18n.configure({
  locales: ['zh-cn', 'zh-en'],
  directory: __dirname + '/../' + constant.localePath,
  defaultLocale: 'zh-cn',
  cookie: 'lang'
});

module.exports = {
  initLocale: function initLocale(req, res, next) {
    i18n.init(req, res);
    var cookie_locale = req.cookies._lang,
        current_locale = i18n.getLocale();
    if (!cookie_locale) {
      res.cookie('_lang', current_locale, { domain: '.' + constant.domain /*+ ":" + constant.port*/ });
      console.log('\u8BED\u8A00\u521D\u59CB\u5316\u4E3A' + current_locale);
    } else if (cookie_locale != current_locale) {
      i18n.setLocale(res.locals, cookie_locale);
      console.log('\u8BED\u8A00\u5207\u6362\u4E3A' + cookie_locale);
    } else {
      console.log('\u8BED\u8A00\u4FDD\u6301\u4E3A' + current_locale);
    }
    return next();
  },
  updateSession: function updateSession(req, res, next) {
    var current_locale = i18n.getLocale();
    if (req.session) {
      req.session.locale = current_locale;
    } else {
      console.log("无Session，故语言无法设置");
      //i18n.setLocale(res.locals, 'zh-cn')
    }
    return next();
  },

  localeMap: {
    'zh-cn': 0,
    'zh-en': 1
  }
};