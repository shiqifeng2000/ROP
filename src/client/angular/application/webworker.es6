function load (setting) {
  var xhr, versions = [
    'MSXML2.XmlHttp.6.0',
    'MSXML2.XmlHttp.5.0',
    'MSXML2.XmlHttp.4.0',
    'MSXML2.XmlHttp.3.0',
    'MSXML2.XmlHttp.2.0',
    'Microsoft.XmlHttp'
  ], result
  for (var i = 0; i < versions.length; i++) {
    try {
      xhr = new ActiveXObject(versions[i])
      break
    } catch (e) {
    }
  }
  if ((!xhr) && (typeof XMLHttpRequest !== 'undefined')) {
    xhr = new XMLHttpRequest()
  }
  if (!xhr) {
    throw new Error('该浏览器不支持Ajax')
  }
  xhr.open('POST', setting.url, setting.async)
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var data
      try {
        data = JSON.parse(xhr.responseText)
      } catch (e) {
        //param.error.call(param.context, e.message)
        data = {success: false, message: '服务器出错'}
      }
      result = data
      if (xhr.status == 200) {
        setting && setting.success && setting.success.call(null, data)
      } else {
        setting && setting.error && setting.error.call(null, data)
      }
    }
  }
  xhr.send(setting && setting.data ? JSON.stringify(setting.data) : '')
  return result
}

setInterval(() => {
  load({
    url: '/agent',
    data: {'module': 'common', 'partial': 'common', 'api': 'tips'},
    success: (a)=>{
      console.log(a)
      postMessage(a)
    },
    error: postMessage
  })
}, 10000)
