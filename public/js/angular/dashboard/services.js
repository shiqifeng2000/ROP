"use strict";angular.module("dashboard.services",["ngMaterial","ngCookies","rop.services"]).factory("HttpObserver",["$q","$window","$cookies",function($q,$window,$cookies){var sessionInjector={response:function(config){return config.data&&config.data._expired?(window.rxStream&&window.rxStream.userIdentify(),$cookies.remove("_session",{path:"/",domain:""+(Constant.nosubdomain?"":".")+Constant.host}),window.location.href=Constant.protocol+"://"+Constant.host+":"+Constant.port+"/sso?from=dashboard",$q.defer().promise):config}};return sessionInjector}]).factory("LogProcessor",["$http","$mdDialog","$cookies","ScopeInitializer",function($http,$mdDialog,$cookies,ScopeInitializer){var LogController=function(scope,$mdDialog,$timeout,$mdUtil,recordkey,api,title){var _lang=ScopeInitializer._lang,beforeClipboardCopy="zh-cn"==_lang?"拷贝信息":"Copy",afterClipboardCopy="zh-cn"==_lang?"已复制":"Copied",workaroundSupportClipboard=function(action){var actionMsg=" 来"+("cut"===action?"剪切":"拷贝"),actionKey="cut"===action?"X":"C";return actionMsg=/iPhone|iPad/i.test(navigator.userAgent)?"暂不支持iPhone和iPad :(":/Mac/i.test(navigator.userAgent)?"请按 ⌘-"+actionKey+actionMsg:"请按 Ctrl-"+actionKey+actionMsg};scope.tableData=[],scope.research=function(){scope.pageIndex=1,scope.pageSize=new Number(10)},scope.title=void 0===title?"操作日志":title,scope.reset=function(e){scope.columns=[{text:"操作时间",name:"create_time",style:{width:"144px","text-align":"left"}},{text:"操作人",name:"create_user",style:{width:"144px","text-align":"center"}},{text:"动作",name:"log_content",tooltip:!0,style:{"text-align":"left"}}],scope.pageIndex=1,scope.pageSize=new Number(10)},scope.searcher=function(index,size){return $http.post("/agent",{module:"dashboard",partial:"common",api:api||"logger",param:{pageindex:index||scope.pageIndex,pagesize:size||scope.pageSize,recordkey:recordkey}}).then(function(body){"boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success?(scope.tableData=body.data.data_list,scope.total=body.data.list_count,$mdUtil.nextTick(function(){var cliper=new Clipboard(".cliper");cliper.on("success",function(e){e.clearSelection();var trigger=e.trigger;angular.element(trigger).find(".text")[0].innerHTML=afterClipboardCopy,$timeout(function(){angular.element(trigger).find(".text")[0].innerHTML=beforeClipboardCopy},5e3)}),cliper.on("error",function(e){var trigger=e.trigger;angular.element(trigger).find(".text")[0].innerHTML=workaroundSupportClipboard(e.action),$timeout(function(){angular.element(trigger).find(".text")[0].innerHTML=beforeClipboardCopy},5e3)})})):(ScopeInitializer.alert(body.data.msg),scope.total=0)},function(why){ScopeInitializer.alert(why),scope.total=0})},scope.closeLogger=function(){$mdDialog.hide()},scope.reset()};return{showLog:function(ev,recordkey,api,title){$mdDialog.show({controller:LogController,templateUrl:"/_template/logger",targetEvent:ev,parent:angular.element(document.querySelector("body>section>md-content")),clickOutsideToClose:!0,locals:{recordkey:recordkey,api:api,title:title}})}}}]).factory("MiscTool",["$http","$mdDialog","$cookies",function($http,$mdDialog,$cookies){return{append:function(list,scrollerSelector){if(list.push({}),scrollerSelector){var $el=angular.element(scrollerSelector);$el&&$el.animate({scrollTop:$el[0].scrollHeight})}},splice:function(list,target,scrollerSelector){if(list.splice(list.indexOf(target),1),scrollerSelector){var $el=angular.element(scrollerSelector);$el&&$el.animate({scrollTop:0})}}}}]);