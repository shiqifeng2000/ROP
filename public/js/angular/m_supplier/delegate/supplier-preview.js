"use strict";var supplierApp=angular.module("SupplierApp",["ngRoute","ui.router","ngAnimate","ngCookies","ngMaterial","ngMessages"]);supplierApp.config(function($mdThemingProvider){var customBlueMap=$mdThemingProvider.extendPalette("indigo",{contrastDefaultColor:"light",contrastDarkColors:void 0,contrastLightColors:["50"],50:"ffffff"});$mdThemingProvider.definePalette("customBlue",customBlueMap),$mdThemingProvider.theme("default").primaryPalette("customBlue",{"default":"500","hue-1":"50","hue-3":"A400"}).accentPalette("pink"),$mdThemingProvider.theme("dracular","default").primaryPalette("grey",{"default":"500","hue-2":"800","hue-3":"900"}).accentPalette("deep-orange")}),supplierApp.config(function($mdIconProvider){$mdIconProvider.iconSet("action","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg",24).iconSet("alert","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-alert.svg",24).iconSet("av","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-av.svg",24).iconSet("communication","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-communication.svg",24).iconSet("content","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-content.svg",24).iconSet("device","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-device.svg",24).iconSet("editor","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-editor.svg",24).iconSet("file","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-file.svg",24).iconSet("hardware","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-hardware.svg",24).iconSet("image","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-image.svg",24).iconSet("maps","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-maps.svg",24).iconSet("navigation","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg",24).iconSet("notification","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-notification.svg",24).iconSet("social","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-social.svg",24).iconSet("toggle","/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-toggle.svg",24).defaultIconSet("/vendor/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg",24)}),supplierApp.controller("SupplierCtrl",["$scope","$route","$http","$location","$rootScope","$window","$state","$cookies","$mdDialog","$filter","$q","$timeout",function($scope,$route,$http,$location,$rootScope,$window,$state,$cookies,$mdDialog,$filter,$q,$timeout){$scope.go=function(tab){$rootScope.scrollToTop(function(){$state.go(tab)})},$rootScope.locate=function(url){$window.location.href=url},$rootScope.toPlatform=function(path){$scope.locate(Constant.protocol+"://"+Constant.host+(path||""))},$rootScope.scrollToTop=function(cb){"Firefox"==getBrowserType()?$("html").animate({scrollTop:0},cb):$("body").animate({scrollTop:0},cb)},$rootScope.alert=function(msg){$mdDialog.show($mdDialog.alert().clickOutsideToClose(!0).title("出错了").textContent(msg).ariaLabel(msg).ok("了解"))},$rootScope.removeLoading=function(){angular.element(".loading").hasClass("out")||$(".loading").fadeOut(0,function(){$(".loading").addClass("out")})},$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()});var _lang=$cookies.get("_lang"),beforeClipboardCopy="zh-cn"==_lang?"复制文档地址":"Copy to Clipboard";$scope.breadcrumbs=[],$scope.selectedEntry=0,$scope.defaultDetails={api_name:"API名字"},$scope.apiDetails=$scope.defaultDetails,$scope.domainDetails=$scope.defaultDetails,$scope.clipboardHints=beforeClipboardCopy,$scope.makeDebugUrl=function(api){return Constant.protocol+"://"+Constant.host+"/ApiTool/index?sign="+api},$scope.makeSDKUrl=function(api){return Constant.protocol+"://"+Constant.host+"/welcome/sdkTool"};var domainDetailQ=function(domain_id,cat_id){return cat_id&&($scope.apiCategoryId=cat_id),$scope.apiDetails=$scope.defaultDetails,$http.post("/agent",{module:"supplier",partial:"document",api:"domain_detail_preview",param:{domain_id:window.ssv_info.id}}).then(function(body){return body.data&&body.data.data_list&&body.data.data_list.length?$scope.domainDetails=body.data.data_list[0]:$scope.domainDetails=$scope.defaultDetails,cat_id&&($scope.breadcrumbs=[$scope.domainDetails]),$scope.domainDetails.domain_desc&&($scope.domainDetails.domain_desc_expanded=!0),$scope.domainDetails.property&&($scope.domainDetails.property_expanded=!0),$scope.loading=!1,body},function(why){$rootScope.alert(why),$scope.loading=!1})};$scope.domainDetailQ=function(domain_id,cat_id){$scope.loading||($scope.loading=!0,cat_id&&($scope.apiCategoryId=cat_id),$rootScope.scrollToTop(function(){domainDetailQ(domain_id,cat_id)}))};var apiDetailQ=function(api_id,cat_id){return cat_id&&($scope.apiCategoryId=cat_id),$scope.domainDetails=$scope.defaultDetails,$rootScope.scrollToTop(),$http.post("/agent",{module:"supplier",partial:"document",api:"api_detail_preview",param:{api_id:window.ssv_info.id}}).then(function(body){body.data&&body.data.data_list&&body.data.data_list.length?$scope.apiDetails=body.data.data_list[0]:$scope.apiDetails=$scope.defaultDetails,$scope.breadcrumbs=[$scope.apiDetails],$scope.apiDetails.api_id=api_id,$scope.apiDetails.api_desc&&($scope.apiDetails.api_desc_expanded=!0),$scope.apiDetails.sysparam_expanded=!1,$scope.apiDetails.request_parameter_type&&($scope.apiDetails.request_parameter_type_expanded=!0),$scope.apiDetails.request_parameter_example&&($scope.apiDetails.request_parameter_example_expanded=!0),$scope.apiDetails.response_parameter_desc&&($scope.apiDetails.response_parameter_desc_expanded=!0),$scope.apiDetails.response_parameter_example&&($scope.apiDetails.response_parameter_example_expanded=!0),$scope.apiDetails.busparam&&$scope.apiDetails.busparam.length&&($scope.apiDetails.busparam_expanded=!0),$scope.apiDetails.result&&$scope.apiDetails.result.length&&($scope.apiDetails.result_expanded=!0),$scope.apiDetails.return_example_xml&&($scope.apiDetails.return_example_xml_expanded=!0),$scope.apiDetails.error_example_xml_expanded=!1,$scope.apiDetails.buserror&&($scope.apiDetails.buserror_expanded=!0),$scope.apiDetails.syserror_expanded=!1,$scope.apiDetails.debug_expanded=!0,setTimeout(function(){var return_example_xml=$filter("unescapeHtml")($scope.apiDetails.return_example_xml,"xml"),error_example_xml=$filter("unescapeHtml")($scope.apiDetails.error_example_xml,"xml"),return_example_json=$filter("unescapeHtml")($scope.apiDetails.return_example_json,"json"),error_example_json=$filter("unescapeHtml")($scope.apiDetails.error_example_json,"json");packageTree(return_example_xml||""),packageTreeError(error_example_xml||""),Process(return_example_json||"{}"),ProcessError(error_example_json||"{}")},400),$scope.loading=!1},function(why){$rootScope.alert(why),$scope.loading=!1})};$scope.apiDetailQ=function(api_id,cat_id){$scope.loading||(cat_id&&($scope.apiCategoryId=cat_id),$scope.loading=!0,$rootScope.scrollToTop(function(){apiDetailQ(api_id,cat_id)}))},$scope.init=function(info,param){window.ssv_info?($rootScope.ssv_user_id=window.ssv_info.ssv_id,$rootScope.ssv_info=window.ssv_info,"api"==window.ssv_info.method?apiDetailQ(window.ssv_info.id):domainDetailQ(window.ssv_info.id)):$window.location.href="/"},$scope.toSubDomain=function(id,details){window.open(Constant.protocol+"://"+Constant.host+"/api/ApiDomainPreview-"+id+".html","_blank")},$scope.copyToClipboard=function(details){var id=details.api_id?details.api_id:details.domain_id,method=details.api_id?"ApiPreview":"ApiDomainPreview";return Constant.protocol+"://"+Constant.host+"/api/"+method+"-"+id+".html"},setTimeout(function(){var _lang=$cookies.get("_lang"),cliperParam={};cliperParam.beforeClipboardCopy="zh-cn"==_lang?"复制文档地址":"Copy document URL",cliperParam.afterClipboardCopy="zh-cn"==_lang?"已复制":"Copied",cliperParam.workaroundSupportClipboard=function(action){var actionMsg=" 来"+("cut"===action?"剪切":"拷贝"),actionKey="cut"===action?"X":"C";return actionMsg=/iPhone|iPad/i.test(navigator.userAgent)?"暂不支持iPhone和iPad :(":/Mac/i.test(navigator.userAgent)?"请按 ⌘-"+actionKey+actionMsg:"请按 Ctrl-"+actionKey+actionMsg},$scope.clipboardHints=cliperParam.beforeClipboardCopy;var cliper=new Clipboard(".cliper");cliper.on("success",function(e){e.clearSelection(),$scope.clipboardHints=cliperParam.afterClipboardCopy,$timeout(function(){$scope.clipboardHints=cliperParam.beforeClipboardCopy},3e3)}),cliper.on("error",function(e){$scope.clipboardHints=cliperParam.workaroundSupportClipboard(e.action),$timeout(function(){$scope.clipboardHints=cliperParam.beforeClipboardCopy},5e3)})},1500),$rootScope.removeLoading()}]),supplierApp.filter("escapeHtml",function(){var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return function(str){return String(str).replace(/[&<>"'\/]/g,function(s){return entityMap[s]})}}),supplierApp.filter("unescapeHtml",function(){var entityMap={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#x2F;":"/"};return function(str,type){if(str){var rawStr=String(str).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;)/g,function(s){return entityMap[s]});if(str&&"undefined"!=str){if("json"==type)return JSON.stringify(JSON.parse(rawStr),null,2);if("xml"==type)return formatXml(rawStr)}return rawStr}}}),supplierApp.filter("parseYear",function(){return function(str,type){var year=str;try{year=new Date(str).getFullYear()}catch(e){console.log("warning, unable to parse the date string")}return year}}),supplierApp.filter("parseMonth",function(){return function(str,type){var month=str;try{month=new Date(str).getMonth()+1}catch(e){console.log("warning, unable to parse the date string")}return month}}),supplierApp.filter("parseDate",function(){return function(str,type){var date=str;try{date=new Date(str).getDate(),date<10&&(date="0"+date)}catch(e){console.log("warning, unable to parse the date string")}return date}}),supplierApp.filter("trusthtml",["$sce",function($sce){return function(t){return $sce.trustAsHtml(t)}}]);