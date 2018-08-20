const errorMap = require('./error.json')
let router = require('./router'), request = require('request'), Q = require('q'), log4js = require('log4js'),
  constant = require('./constant'), MobileDetect = require('mobile-detect'), fs = require('fs'), path = require('path'),
  Jimp = require('jimp'), mime = require('mime'), proxy_legacy = require('./proxy/legacypreview'),
  proxy_legacypro = require('./proxy/legacymethod'),
  proxy_apitool = require('./proxy/apitool'), etc = require('./etc/miscellaneous'),
  proxy_sponsor = require('./proxy/sponsor'), i18n = require('./i18n'), secret = '7AE0800C-BBF9-44CD-A568-460E75C16DD4',
  viewDir = 'pages', templateDir = 'template'

log4js.configure({
  appenders: [
    {type: 'console'},
    {type: 'file', filename: constant.logFile, category: 'server'},
    {type: 'file', filename: constant.errFile, category: 'err'}
  ]
})
let logger = log4js.getLogger('server'), errLogger = log4js.getLogger('err'),
  isMobile = request => {
    var md = new MobileDetect(request.headers['user-agent'])
    //console.log(md)
    return md.mobile()
  },
  jumpToPC = (request, response) => {
    request.session.jumpToPC = true
    response.redirect(constant.env == 'test' || constant.env == 'pro' ? `${constant.protocol}://${constant.domain}` : `${constant.protocol}://${constant.domain}:${constant.port}`)
  },
  mobileSwitch = (module, request) => {
    return isMobile(request) && !request.session.jumpToPC && fs.existsSync(`${__dirname}/../${constant.viewsPath}/pages/m_${module}`) ? `m_${module}` : module
  },
  // 由于平台升级，所有http请求都需要封装json
  deliver = param => {
    let option = {url: param.url, json: constant.isRequestJson, headers: constant.requestHeader}, deferred = Q.defer()
    param.body ? (option.body = param.body) : (param.multiple ? (option.formData = param.data) : (option.form = param.data))
    option.timeout = constant.apiTimeout
    logger.info(option)
    request.post(option, (err, httpResponse, body) => {
      if (err) {
        logger.info(`Error in module Agent while delivering API #${JSON.stringify(option)}`)
        logger.error(err)
        deferred.reject(err)
        return
      }
      logger.info('Returning server response')
      logger.info(body)
      deferred.resolve(body)
    })

    return deferred.promise
  },
  massDeliver = params => {
    let promiseArray = [],
      deferred = Q.defer(),
      makeTmplParam = (params, args) => {
        let data = {}
        let i = 0
        for (let name in params) {
          data[name] = args[i]
          i++
        }
        return data
      }
    for (let name in params) {
      promiseArray.push(deliver(params[name]))
    }

    Q.all(promiseArray).spread(function () {
      deferred.resolve(makeTmplParam(params, arguments))
    }).done(() => {
      //deferred.resolve({});
    }, reason => {
      deferred.reject({error: true, reason})
    })
    return deferred.promise
  },
  getHtml = param => {
    let option = {url: param.url, html: true}, deferred = Q.defer()
    param.multiple ? (option.formData = param.data) : (option.form = param.data)
    request.post(option, (err, httpResponse, body) => {
      if (err) {
        deferred.reject(err)
      }
      deferred.resolve(body)
    })
    return deferred.promise
  },
  renderJSONErrorHandler = (response, error, html) => {
    if (error) {
      var codeMessage = error.message && response.request.session.locale && errorMap[error.message.code] ? errorMap[error.message.code][response.request.session.locale] : errorMap.ECOMMON[response.request.session.locale],
        msg = `${codeMessage}`
      errLogger.error(error)
      errLogger.info(msg)
      response.send({success: false, msg: msg, error: error.stack})
    } else {
      response.send(html)
    }
  },
  renderErrorHandler = (response, error, html) => {
    if (error) {
      errLogger.error(error)
      errLogger.info('因为错误重定向到500页面')
      response.render(`${constant.errorPath}/500`, {error: error.stack || error})
    } else {
      response.send(html)
    }
  },
  overallErrorHandler = (request, response, error, html) => {
    if (error) {
      errLogger.error(error)
      errLogger.error('因为错误重定向到500页面')
      response.render(`${constant.errorPath}/500`, {
        error: error.stack || error,
        domain: request.session ? (`${constant.protocol}://${constant.domain}`) : undefined
      })
    } else {
      response.send(html)
    }
  },
  wrongwayErrorHandler = response => {
    errLogger.error('访问错误重定向到404页面')
    response.render(`${constant.errorPath}/404`, {domain: (`${constant.protocol}://${constant.domain}`)})
  },
  randomRGBColor = () => `#${(function co (lor) {
    return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) && (lor.length == 6) ? lor : co(lor)
  })('')}`,
  randomHSLColor = (s, _s, l, _l) => `hsl(${Math.round(Math.random() * 360)},${Math.round((_s && (_s != '0')) ? (Math.random() * s) : (Math.random() * (100 - s) + s))}%,${Math.round((_l && (_l != '0')) ? (Math.random() * l) : (Math.random() * (100 - l) + l))}%)`,
  randomString = length => {
    let len = 6
    if (length && (typeof length == 'number')) {
      len = length
    }
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }

let overallReqestErrorHandler = (req, res, next) => {
    if (!req || !res) {
      logger.info('Http request or Http response not working, please verify the server network or server agents such as Nginx')
      logger.error('Http communication Error')
      overallErrorHandler(req, res, 'Http communication Error')
      return
    }
    if (!req.session) {
      logger.info('Session not exist, please verify the couchbase connection and the code')
      logger.error('Couchbase Error')
      overallErrorHandler(req, res, 'Couchbase Error')
      return
    }
    req.url && logger.info(`Incoming request: ${req.url}`)
    req.connection && req.connection.remoteAddress && logger.info(`Incoming request from: ${req.connection.remoteAddress}`)
    req.method && logger.info(`Incoming request method: ${req.method}`)
    req.body && logger.info(`Incoming request body: ${JSON.stringify(req.body)}`)
    req.referer && logger.info(`Incoming request referer: ${req.referer}`)
    next()
  }, tempFileHandler = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    response.setHeader('Cache-Control', 'no-cache')
    var file = request.params.file, localFile = path.resolve(`${__dirname}/../${constant.uploadPath}/${file}`),
      blur = request.query && request.query.blur, defaultFileSender = () => {
        if (fs.existsSync(localFile)) {
          response.sendFile(localFile)
        } else {
          response.status(404).sendFile(path.resolve(`${__dirname}/../${constant.staticPath}/resource/image-404.png`))
        }
      }
    if (blur) {
      Jimp.read(localFile).then((image) => {
        image.quality(20).blur(50)
          .getBuffer(mime.lookup(localFile), (err, buffer) => {
            /*//Transfer image file buffer to base64 string
             let base64Image = buffer.toString('base64')
             let imgSrcString = 'data:' + type.mime + ';base64, ' + base64Image
             //Resolve base94 string
             resolve(imgSrcString)*/
            if (err) {
              defaultFileSender()
            } else {
              //response.write(buffer, 'binary')
              response.end(buffer, 'binary')
            }
          })
      }).catch(defaultFileSender)
    } else {
      defaultFileSender()
    }
  }, imageSalvation = (request, response) => {
    logger.warn(`找不到图片${request.url}, 将返回404提示图片`)
    response.status(404).sendFile(path.resolve(`${__dirname}/../${constant.staticPath}/resource/image-404.png`))
  }, textSalvation = (request, response) => {
    logger.warn(`找不到文本${request.url}, 将返回404提示文本`)
    response.status(404).send('没有找到文本')
  }, fileSalvation = (request, response) => {
    logger.warn(`找不到文本${request.url}, 将返回404提示文本`)
    response.status(404).send('没有找到页面')
  }, urlLettercaseRedirector = (req, res, next) => {
    if (req.url !== req.url.toLowerCase()) { res.redirect(301, req.url.toLowerCase())} else {next()}
  },
  legacyWelcomeDoc = (request, response) => response.redirect(`${constant.protocol}://${constant.domain}/welcome/document`),
  legacyWelcomeDocWithID = (request, response) => {
    let id = request.params.id ? request.params.id : ''
    response.redirect(`${constant.protocol}://${constant.domain}/welcome/document/${id}`)
  }, templateRouter = (request, response) => {
    //response.setHeader('Cache-Control', `public, max-age=14400`)
    response.setHeader('Cache-Control', 'no-cache')
    let path = request.params ? request.params.path : ''
    if (constant.templateList.indexOf(path) == -1) {
      wrongwayErrorHandler(response)
      return
    }
    response.render(`${templateDir}/${path}`, {
      _session_id: request.session.id,
      _injection: constant.clientSideScript
    }, (error, html) => {
      renderErrorHandler(response, error, html)
    })
  }, viewRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    let module = request.params.module ? request.params.module : 'welcome',
      partial = request.params.partial ? request.params.partial : 'index'

    if (constant.moduleList.indexOf(module) == -1 || !router.map[module][partial]) {
      wrongwayErrorHandler(response)
      return
    }
    /*if (module != 'console') {
      response.setHeader('Cache-Control', `public, max-age=120`)
    } else {
      response.setHeader('Cache-Control', 'no-cache')
    }*/
    response.setHeader('Cache-Control', 'no-cache')

    let initOptions = router.initDeliverOptions(module, partial)

    if (!initOptions || !Object.keys(initOptions).length) {
      response.render(`${viewDir}/${mobileSwitch(module, request)}/partials/${partial}`, {}, (error, html) => {
        renderErrorHandler(response, error, html)
      })
      return
    }
    let param = {
      session_id: request.session.profile ? request.session.profile.login_user_id : '',
      sub_session_id: request.session.profile ? request.session.profile.login_sub_user_id : ''
    }
    request.session.locale && (param.lang_flag = i18n.localeMap[request.session.locale])
    massDeliver(router.initDeliverOptions(module, partial, param)).then(rawTmplParam => {
      let tmplParam = {}
      for (let key in rawTmplParam) {
        let dataResponse = rawTmplParam[key]
        if (dataResponse.error_response) {
          throw new Error(dataResponse.error_response.msg)
        } else {
          tmplParam[key] = (constant.ROPRequestType == 1) ? dataResponse : JSON.parse(dataResponse.rop_api_data_get_response.result)
        }
      }
      response.render(`${viewDir}/${mobileSwitch(module, request)}/partials/${partial}`, tmplParam, (error, html) => {
        renderErrorHandler(response, error, html)
      })
    }, why => {
      logger.info('Error in module Index, while delivering router /:module/:partial')
      logger.error(why)
      renderErrorHandler(response, why)
    })
  }, legacyRouter = function (req, res, next) {
    res.setHeader('Cache-Control', 'no-cache')
    var url = req.url ? req.url.toLowerCase() : ''
    if (req && req.headers && req.headers.host && new RegExp(`^\\w+\\.${constant.domain}(:(${constant.port}|${constant.optionPort})){0,1}$`).test(req.headers.host) && (!/^\/api\/.+\.html$/.test(req.url) && !/^\/_view(\/.*)*$/.test(req.url) && !/^\/_template(\/.*)*$/.test(req.url))) {
      return proxy_sponsor.api.apply(this, arguments)
    } else if (req && req.headers && req.headers.host && new RegExp(`^${constant.domain}(:(${constant.port}|${constant.optionPort})){0,1}$`).test(req.headers.host) && /^\/api\/apidetail-.+\.html$/.test(url)) {
      return proxy_sponsor.cat.apply(this, arguments)
    } else if (req && req.headers && req.headers.host && new RegExp(`^\\w+\\.${constant.domain}(:(${constant.port}|${constant.optionPort})){0,1}$`).test(req.headers.host) && /^\/api\/apilist$/.test(url)) {
      res.redirect(`${constant.protocol}://${req.headers.host}/supplier/document`)
    } else if (req && req.headers && req.headers.host && new RegExp(`^${constant.domain}(:(${constant.port}|${constant.optionPort})){0,1}$`).test(req.headers.host) && /^\/api\/apilist$/.test(url)) {
      res.redirect(`${constant.protocol}://${req.headers.host}/welcome/suppliers`)
    } else {
      next()
    }
  }, iframeRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    response.setHeader('Cache-Control', 'no-cache')
    let path = request.params ? request.params.path : ''
    if (path == 'apitool/index') {
      let sign = request.query && request.query.sign ? request.query.sign : ''
      response.redirect(`${constant.protocol}://${constant.legacyDomain}/${path}?sign=${sign}`)
    } else {
      if (!request.session.profile) {
        response.render(`${viewDir}/sso/domain_walker`, {domain: `${constant.protocol}://${constant.domain}`}, (error, html) => {
          renderErrorHandler(response, error, html)
        })
        return
      }
      let timestamp = Math.ceil(Date.now() / 1000),
        rawSign = `${secret + (request.session.profile ? 'session_id' + request.session.profile.login_user_id + 'sub_session_id' + request.session.profile.login_sub_user_id : '')}timestamp${timestamp}${secret}`
      response.redirect(`${constant.protocol}://${constant.legacyDomain}/${path}?timestamp=${timestamp}&sign=${rawSign.md5().toUpperCase()}${request.session.profile ? '&session_id=' + request.session.profile.login_user_id + '&sub_session_id=' + request.session.profile.login_sub_user_id : ''}`)
    }
  }, rootRouter = (request, response) => {
    //response.setHeader('Cache-Control', `public, max-age=120`)
    response.setHeader('Cache-Control', 'no-cache')
    response.render(`${viewDir}/${mobileSwitch('welcome', request)}/index`, {
      _session_id: request.session.id,
      _viewport: isMobile(request) ? '' : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
      _injection: constant.clientSideScript
    }, (error, html) => {
      renderErrorHandler(response, error, html)
    })
  }, socketRunner = (socket, interval) => {
    if (!socket.request.session.profile) {
      socket.conn.close()
      clearInterval(interval)
      return
    }
    let param = {}
    socket.request.session.profile && (param.session_id = socket.request.session.profile.login_user_id)
    socket.request.session.locale && (param.lang_flag = i18n.localeMap[socket.request.session.locale])
    deliver(router.deliverOption('common', 'common', 'tips', param)).then(rawBody => {
      if (rawBody.error_response) {
        var msg = `接口调用失败，原因:${rawBody.error_response}`
        socket.emit('error', {success: false, msg: msg, error: rawBody.error_response})
        return
      }
      let body = (constant.ROPRequestType == 1) ? rawBody : JSON.parse(rawBody.rop_api_data_get_response.result)
      socket.emit('message', {
        id: socket.request.session.id,
        login_user_name: socket.request.session.profile.login_user_name,
        body: body
      })
    }, why => {
      //var msg = `接口调用失败，原因:${why && why.message || why}`
      var codeMessage = why.message && socket.request.session.locale && errorMap[why.message.code] ? errorMap[why.message.code][socket.request.session.locale] : errorMap.ECOMMON[socket.request.session.locale],
        msg = `${codeMessage}`
      errLogger.error(why)
      socket.emit('error', {success: false, msg: msg, error: why && why.stack || why})
    })
  }, moduleRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    let module = request.params.module ? request.params.module : 'welcome'
    /*if (module != 'console') {
      response.setHeader('Cache-Control', `public, max-age=120`)
    } else {
      response.setHeader('Cache-Control', 'no-cache')
    }*/
    response.setHeader('Cache-Control', 'no-cache')
    if (constant.moduleList.indexOf(module) == -1) {
      wrongwayErrorHandler(response)
      return
    }
    response.render(`${viewDir}/${mobileSwitch(module, request)}/index`, {
      _session_id: request.session.id,
      _isMobile: `isMobile=${!!isMobile(request)}`,
      _injection: constant.clientSideScript
    }, (error, html) => {
      renderErrorHandler(response, error, html)
    })
  }, moduleViewRouter = (request, response, next) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    let module = request.params.module ? request.params.module : 'welcome'
    /*if (module != 'console') {
      response.setHeader('Cache-Control', `public, max-age=120`)
    } else {
      response.setHeader('Cache-Control', 'no-cache')
    }*/
    response.setHeader('Cache-Control', 'no-cache')
    if (module == '_view') {
      next()
      return
    }
    if (constant.moduleList.indexOf(module) == -1) {
      wrongwayErrorHandler(response)
      return
    }
    response.render(`${viewDir}/${mobileSwitch(module, request)}/index`, {
      _session_id: request.session.id,
      _isMobile: `isMobile=${!!isMobile(request)}`,
      _injection: constant.clientSideScript
    }, (error, html) => {
      renderErrorHandler(response, error, html)
    })
  }, agentRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=30')
    if (request.body) {
      // 拷贝请求参数
      let param = {}
      for (let prop in request.body.param) {
        param[prop] = request.body.param[prop]
      }
      // 注入session和sub session信息到请求参数中
      if (request.session.profile) {
        param.session_id = request.session.profile.login_user_id
        param.sub_session_id = request.session.profile.login_sub_user_id || ''
      }
      // 注入locale信息
      request.session.locale && (param.lang_flag = i18n.localeMap[request.session.locale])
      try {
        deliver(router.deliverOption(request.body.module, request.body.partial, request.body.api, param)).then(rawBody => {
          if (rawBody.error_response) {
            renderJSONErrorHandler(response, rawBody.error_response.msg)
            return
          }
          let body = (constant.ROPRequestType == 1) ? rawBody : JSON.parse(rawBody.rop_api_data_get_response.result)
          body._expired = !request.session.profile
          response.send(body)
        }, error => {
          logger.info('POST Error, while delivering router /agent')
          logger.error(error)
          renderJSONErrorHandler(response, error)
        })
      } catch (e) {
        logger.info('POST Error, while delivering router /agent')
        logger.error(e)
        renderJSONErrorHandler(response, e)
      }
    }
  }, loginRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    if (request.body) {
      // 如果是登录，需要检查是否是机器人，如果频繁登录，则等待时间不断增加，密码破解也逐渐难度增大
      if (request.session && request.session.bannedTill && (request.session.bannedTill > Date.now())) {
        delete request.session.profile
        !request.session.robotPossibility && (request.session.robotPossibility = 1)
        request.session.bannedTill = Math.max(Number(request.session.bannedTill), Date.now()) + 10000 + Math.round(Math.random() * request.session.robotPossibility * 1000)
        var time = Math.round((request.session.bannedTill - Date.now()) / 1000)
        response.send({is_success: false, msg: `登录出错过多，请于${time}秒后重试`})
        return
      }

      // 拷贝请求参数
      let param = {}
      for (let prop in request.body.param) {
        param[prop] = request.body.param[prop]
      }
      // 注入session和sub session信息到请求参数中
      if (request.session.profile) {
        param.session_id = request.session.profile.login_user_id
        param.sub_session_id = request.session.profile.login_sub_user_id || ''
      }
      // 注入locale信息
      request.session.locale && (param.lang_flag = i18n.localeMap[request.session.locale])

      let userAgent = request.headers['user-agent'], xForwardFor = request.headers['x-forwarded-for']
      param.login_session_id = request.session.id
      param.login_browser = etc.getBrowserType(userAgent)
      param.login_type = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? 1 : 0
      param.login_ip = xForwardFor || request.connection.remoteAddress
      param.login_proxy_ip = !xForwardFor ? '' : request.connection.remoteAddress

      try {
        deliver(router.deliverOption('sso', 'session', 'login', param)).then(rawBody => {
          if (rawBody.error_response) {
            renderJSONErrorHandler(response, rawBody.error_response.msg)
            return
          }
          let body = (constant.ROPRequestType == 1) ? rawBody : JSON.parse(rawBody.rop_api_data_get_response.result)

          if ((typeof body.is_success == 'boolean' && body.is_success) || (typeof body.is_success == 'string' && body.is_success == 'true')) {
            let temp = JSON.parse(JSON.stringify(body))
            temp.id = request.session.id
            temp.sign = temp.login_user_id.md5()
            delete temp.login_user_id
            request.session.profile = body
            response.send(temp)
            return
          } else {
            delete request.session.profile
            body._expired = true

            if (request.session.robotPossibility) {
              request.session.robotPossibility += 1
            } else {
              request.session.robotPossibility = 1
            }
            if (request.session.robotPossibility > 2) {
              if (request.session.bannedTill) {
                request.session.bannedTill = Math.max(Number(request.session.bannedTill), Date.now()) + 10000
              } else {
                request.session.bannedTill = Date.now() + 10000
              }
            } else if (request.session.robotPossibility > 49) {
              request.session.bannedTill = Date.now() + 3600000 * 2
            }
            response.send(body)
          }
        }, error => {
          logger.info('POST Error, while delivering router /login')
          logger.error(error)
          renderJSONErrorHandler(response, error)
        })
      } catch (e) {
        logger.info('POST Error, while delivering router /login')
        logger.error(e)
        renderJSONErrorHandler(response, e)
      }
    }
  }, logoutRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    delete request.session.profile
    response.send({is_success: true})
  }, quitRouter = (request, response) => {
    //response.setHeader('Cache-Control', 'public, max-age=120')
    delete request.session.profile
    request.session.destroy()
    response.send({is_success: true})
  }, uploadRouter = (request, response) => {
    if (!request.files || !request.files.length) {
      renderJSONErrorHandler(response, '无任何可上传文件，上传取消')
      return
    }
    // 拷贝请求参数
    let param = {}
    for (let prop in request.body.param) {param[prop] = request.body.param[prop]}

    // 注入session和sub session信息到请求参数中
    if (request.session.profile) {
      param.session_id = request.session.profile.login_user_id
      param.sub_session_id = request.session.profile.login_sub_user_id || ''
    }
    // 注入locale信息
    request.session.locale && (param.lang_flag = i18n.localeMap[request.session.locale])

    try {
      // 注入session和sub session信息到请求参数中
      var massParam = {}
      request.files.forEach((r, i) => {
        massParam[i] = router.deliverOption(request.body.module, request.body.partial, request.body.api, Object.assign(param, {
          image_url: r.path.replace(path.resolve(`${__dirname}/..`), ''),
          image_name: path.basename(r.originalname, path.extname(r.originalname)),
          image_ext: path.extname(r.originalname),
          image_base: `${constant.protocol}://${constant.domain}/temp/${r.filename}`
        }))
      })
      massDeliver(massParam).then(results => {
        var body = {is_success: false, msg: ''}
        if (!request.session.profile) {
          body._expired = true
        }
        for (var i in results) {
          var data = results[i]
          if (((typeof data.is_success == 'boolean') && data.is_success) || ((typeof data.is_success == 'string') && (data.is_success == 'true'))) {
            body.is_success = true
            /*if (fs.existsSync(request.files[i].path)) {
             fs.unlinkSync(request.files[i].path)
             }*/
          } else {
            body.is_success = (body.is_success || false)
            body.msg += `${data.msg}\n`
          }
        }
        response.send(body)
      }, why => {
        logger.info('POST Error, while delivering router /upload')
        logger.error(why)
        renderJSONErrorHandler(response, why)
      })
    } catch (e) {
      logger.info('POST Error, while delivering router /upload')
      logger.error(e)
      renderJSONErrorHandler(response, e)
    }
  }, clearRouter = (request, response) => {
    var message = '无效操作', is_success = false
    if (request.body) {
      var files = request.body.files, result = 0, message = '删除失败'
      if (files && files.length) {
        files.forEach(r => {
          var localPath = path.resolve(`${__dirname}/..${r}`)
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath)
            result++
          }
        })
        if (result == files.length) {
          is_success = true
          message = '删除成功'
        } else if ((result > 0) && (result < files.length)) {
          is_success = true
          message = '删除部分成功'
        }
      }
    }
    response.send({is_success: is_success, message: message})
  }, overallErrorSalvation = (err, req, res, next) => {
    if (err) {
      logger.info('Error in overallErrorSalvation, while delivering salvation')
      logger.error(err)
      overallErrorHandler(req, res, err)
    } else {
      wrongwayErrorHandler(res)
    }
  }, overallProcessRecorder = err => {
    errLogger.info('UncaughtException in overallProcessRecorder for process scope exception')
    errLogger.error(err)
  }
export {
  deliver,
  massDeliver,
  getHtml,
  logger,
  errLogger,
  renderJSONErrorHandler,
  renderErrorHandler,
  overallErrorHandler,
  wrongwayErrorHandler,
  randomRGBColor,
  randomHSLColor,
  randomString,
  isMobile,
  mobileSwitch,
  overallReqestErrorHandler,
  tempFileHandler,
  imageSalvation,
  textSalvation,
  fileSalvation,
  urlLettercaseRedirector,
  legacyWelcomeDoc,
  legacyWelcomeDocWithID,
  templateRouter,
  viewRouter,
  legacyRouter,
  iframeRouter,
  rootRouter,
  socketRunner,
  moduleRouter,
  moduleViewRouter,
  agentRouter,
  loginRouter,
  logoutRouter,
  quitRouter,
  uploadRouter,
  clearRouter,
  overallErrorSalvation,
  overallProcessRecorder,
  proxy_legacy,
  proxy_legacypro,
  proxy_apitool,
  jumpToPC
}
