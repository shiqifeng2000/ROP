/**
 * Created by robin on 7/1/16.
 */
let express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  multer = require('multer'),
  app = express(),
  compress = require('compression'),
  fs = require('fs'),
  constant = require('./bin/constant'),
  path = require('path'),
  server = require('http').createServer(app),
  viewDir = 'pages'

// https 签名设置，token设置，token暂时用于清理缓存
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// 全局设置
app.set('port', process.env.PORT || constant.port)
app.set('views', path.resolve(`${__dirname}/${constant.viewsPath}`))
app.set('view engine', 'ejs')
app.use(compress())
//app.use(express.static(`${__dirname}/../${constant.staticPath}`, {etag: true, maxage: '24h'}))
//app.use(bodyParser.json({limit: '50mb'})) // for parsing application/json
//app.use(bodyParser.urlencoded({extended: true, limit: '50mb'})) // for parsing application/x-www-form-urlencoded
//app.use(cookieParser('shiqifeng2000@gmail.com'))

app.get("/*",(request, response) => {
  response.render(`${viewDir}/maintain`)
})
server.listen(app.get('port'))
