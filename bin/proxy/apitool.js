'use strict';

/**
 * Created by robin on 2/2/16.
 */

var express = require('express'),
    constant = require('../constant'),
    router = express.Router();

router.use(function (request, response, next) {
  if (request.query) {
    response.redirect(constant.protocol + '://' + constant.domain + '/welcome/debugTool?key=' + (request.query.sign ? request.query.sign : ''));
  } else {
    next();
  }
});
module.exports = router;