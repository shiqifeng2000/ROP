'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*TODO map 中的path的存在是为了多api库调用功能存在的，multiple是post方式开关，_init用于把api注入到ejs一并发送给前端而存在的*/
var map = require('./api.json');
var constant = require('./constant');

var deliverOption = function deliverOption(module, partial, api, param) {
  // 拷贝默认参数
  var data = JSON.parse(JSON.stringify(map[module][partial][api].param));
  // 将用户设置参数mixin到参数体内
  if (param) {
    for (var prop in param) {
      data[prop] = param[prop];
    }
  }
  // TODO 由于ROP访问规则变更，输入的参数需要
  if (constant.ROPRequestType == 1) {
    return {
      url: constant.apiHost + (map[module][partial][api].path || '') + constant.generateROPStandardRequest(constant.ROPRequestType),
      multiple: map[module][partial][api].multiple || false,
      body: data
    };
  } else {
    var standardData = constant.generateROPStandardRequest();
    standardData.request_parameter = JSON.stringify(data);
    return {
      url: constant.apiHost + (map[module][partial][api].path || ''),
      multiple: map[module][partial][api].multiple || false,
      data: standardData
    };
  }
};

var deliverOptions = function deliverOptions(module, partial, names, param) {
  var options = {};
  names.forEach(function (name) {
    options[name] = deliverOption(module, partial, name, param);
  });
  return options;
};

var initDeliverOptions = function initDeliverOptions(module, partial, param) {
  return map[module] && map[module][partial] && map[module][partial]._init ? deliverOptions(module, partial, map[module][partial]._init, param) : [];
};

exports.map = map;
exports.deliverOption = deliverOption;
exports.deliverOptions = deliverOptions;
exports.initDeliverOptions = initDeliverOptions;