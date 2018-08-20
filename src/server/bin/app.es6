let express = require('express'),
  agent = require('./agent'),
  router = require('./router'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  multer = require('multer'),
  session = require('express-session'),
  app = express(),
  compress = require('compression'),
  fs = require('fs'),
  constant = require('./constant'),
  i18n = require('./i18n'),
  captcha = require('./etc/captcha'),
  couchbase = require('./couchbase'),
  path = require('path'),
  uuidv4 = require('uuid/v4'),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${__dirname}/../${constant.uploadPath}`)
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + path.extname(file.originalname))
    }
  }),
  upload = multer({storage: storage})

// https 签名设置，token设置，token暂时用于清理缓存
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.token = uuidv4()

// 环境设置
if (constant.env == 'pro') {
  process.env.NODE_ENV = 'production'
  app.settings.env = 'production'
} else {
  process.env.NODE_ENV = 'development'
  app.settings.env = 'development'
}

// 全局设置
app.set('port', process.env.PORT || constant.port)
app.set('views', `${__dirname}/../${constant.viewsPath}`)
app.set('view engine', 'ejs')
app.use(compress())
app.use(express.static(`${__dirname}/../${constant.staticPath}`, {etag: true, maxage: '24h'}))
app.use(bodyParser.json({limit: '50mb'})) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'})) // for parsing application/x-www-form-urlencoded
app.use(cookieParser('shiqifeng2000@gmail.com'))

// http server session，socketio session以及国际化处理
app.use(i18n.initLocale)
app.use(couchbase.session)
io.use((socket, next) => {couchbase.session(socket.request, socket.request.res, next)})
app.use(i18n.updateSession)

//app.use(require('prerender-node').set('prerenderToken', 'PbpbDJvgjWsCiSZVu7BE'));

// socketio连接路由
io.on('connection', (socket) => {
  let interval = setInterval(() => {agent.socketRunner(socket, interval)}, 45000)
  agent.socketRunner(socket, interval)
  socket.on('disconnect', () => {
    socket.conn.close()
    clearInterval(interval)
  })
  server.on('close', () => {
    socket.conn.close()
    clearInterval(interval)
  })
})

// 全局错误处理，http访问登录
app.use(agent.overallReqestErrorHandler)
app.use(captcha({url: '/captcha', color: '#00C5A3', background: 'rgba(0,0,0,0)', canvasWidth: 350}))
// 临时文件访问路由
app.get('/temp/:file', agent.tempFileHandler)
// 假如图片既不在临时文件区，又不在公共文件区，则返回404图片
app.get('(/\\w*)*.(png|jpeg|psd|ico|gif|jpg)', agent.imageSalvation)
// 假如文本文件既不在临时文件区，又不在公共文件区，则返回提示文本
app.get('(/\\w*)*.((?!html)\\w)*', agent.textSalvation)
// 假如任何文件既不在临时文件区，又不在公共文件区，则返回提示文本
app.use(agent.urlLettercaseRedirector)
// 供应商文档路由，情况特殊，脱离下方路由规则进行特殊处理
app.use('/supplier/document', agent.proxy_legacypro)

// 首页文档，用于向后兼容历史路由
app.get('/welcome/doc', agent.legacyWelcomeDoc)
app.get('/welcome/doc/:id', agent.legacyWelcomeDocWithID)
// 控件模板路由
app.get('/_template/:path', agent.templateRouter)
// angular模板路由
app.get('/_view/:module/:partial', agent.viewRouter)
// TODO 关键路由，用于对各种http请求做判断是否要做历史路由规则的处理
app.use(agent.legacyRouter)
app.use('/api', agent.proxy_legacy)
app.use('/apitool/index', agent.proxy_apitool)

// 历史页面iframe嵌套路由
app.get('/frame/:path([\\/\\w]*)', agent.iframeRouter)
app.get('(/\\w*)*.(\\w)+', agent.fileSalvation)
// 假如访问地址里有大写字母，则返回301让用户访问全小写地址
// 首页路由
app.get('/', agent.rootRouter)
// 模块路由
app.get('/:module', agent.moduleRouter)
app.get('/:module/*', agent.moduleViewRouter)
// 各种操作路由
app.post('/agent', agent.agentRouter)
app.post('/agentQ', agent.agentRouter)
app.post('/login', agent.loginRouter)
app.post('/logout', agent.logoutRouter)
app.post('/quit', agent.quitRouter)
app.post('/upload', upload.array('files'), agent.uploadRouter)
app.post('/clear', agent.clearRouter)

// 全局错误拯救机制
app.use(agent.overallErrorSalvation)
// 未知错误记录
process.on('uncaughtException', agent.overallProcessRecorder)

export { app, server }
