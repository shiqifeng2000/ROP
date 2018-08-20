'use strict';

/**
 * Created by robin on 1/14/16.
 */
var express = require('express'),
    agent = require('../agent'),
    ropRouter = require('../router'),
    log4js = require('log4js'),
    constant = require('../constant'),
    i18n = require('../i18n');

var router = express.Router(),
    info = { ssv_id: 'b4ffce1c-0b1a-4e52-b244-d7e13ec6aeac', ssv_name: '', cat_id: '' };

router.get('/ApiSdk', function (request, response) {
  response.redirect(constant.protocol + '://' + constant.domain + '/welcome/sdkTool');
});

router.get('/doc_detail.html', function (request, response) {
  var id = request.query && request.query.id ? request.query.id : '';
  response.redirect(constant.protocol + '://' + constant.domain + '/welcome/document/' + id.toLowerCase());
});

router.use('/:func-:id.html', function (request, response, next) {
  var id = request.params.id,
      func = request.params && request.params.func ? request.params.func.toLowerCase() : '',
      param = {},
      isAPI = func == 'apipreview' || func == 'apimethod';
  param[isAPI ? 'api_id' : 'domain_id'] = id;
  request.session.locale && (param.lang_flag = i18n.localeMap[request.session.locale]);
  agent.deliver(ropRouter.deliverOption('common', 'sponsor', 'get_ssv', param)).then(function (rawBody) {
    if (rawBody.error_response) {
      agent.renderErrorHandler(response, rawBody.error_response.msg);
      return;
    }
    var body = constant.ROPRequestType == 1 ? rawBody : JSON.parse(rawBody.rop_api_data_get_response.result);

    if (typeof body.is_success == 'boolean' && body.is_success || typeof body.is_success == 'string' && body.is_success == 'true') {
      if (!new RegExp('^' + body.user_domain + '\\.' + constant.domain + '(:(' + constant.port + '|' + constant.optionPort + ')){0,1}$').test(request.headers.host)) {
        if (func == 'apimethod' || func == 'apidomain') {
          response.redirect(constant.protocol + '://' + body.user_domain + '.' + constant.domain + '/supplier/document/' + (func == 'apimethod' ? 'api' : 'domain') + '/' + id);
        } else {
          var info = {
            ssv_id: body.ssv_user_id,
            ssv_name: body.ssv_user_name,
            cat_id: body.cat_id,
            id: id,
            method: isAPI ? 'api' : 'domain'
          },
              param = {
            _session_id: request.session.id,
            _info: 'window.ssv_info = ' + JSON.stringify(info),
            _injection: constant.clientSideScript
          };
          response.render('pages/' + agent.mobileSwitch('supplier', request) + '/preview', param, function (error, html) {
            agent.renderErrorHandler(response, error, html);
          });
        }
      } else {
        var newinfo = {
          ssv_id: body.ssv_user_id,
          ssv_name: body.ssv_user_name,
          cat_id: body.cat_id,
          id: id,
          method: isAPI ? 'api' : 'domain'
        },
            newparam = {
          _session_id: request.session.id,
          _info: 'window.ssv_info = ' + JSON.stringify(newinfo),
          _injection: constant.clientSideScript
        };
        if ((func == 'apimethod' || func == 'apidomain') && new RegExp('^.+?\\.' + constant.domain + '(:(' + constant.port + '|' + constant.optionPort + ')){0,1}$').test(request.headers.host)) {
          response.render('pages/supplier/index', newparam, function (error, html) {
            agent.renderErrorHandler(response, error, html);
          });
        } else {
          response.redirect(constant.protocol + '://' + constant.domain + request.originalUrl);
          /*response.redirect(`${constant.protocol}://${body.user_domain}.${constant.domain}:${constant.port}/supplier/document/${(func == "apimethod")?'api':'domain'}/${id}`);
           response.render('pages/supplier/preview',param, (error, html) => {
           agent.renderErrorHandler(response, error, html)
           });*/
        }
      }
    } else {
      response.send(body.msg);
    }
  }, function (why) {
    agent.logger.info('Error in module Legacy, while delivering router /:func-:id.html');
    agent.logger.error(why);
    //response.send(why);
    agent.renderErrorHandler(response, why);
  });
});

router.get('*', function (request, response) {
  //response.redirect(`${constant.protocol}://${constant.domain}:${constant.port}/welcome/API`);
  response.redirect(constant.protocol + '://' + constant.domain);
});
module.exports = router;