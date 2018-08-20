"use strict";var controllerModule=angular.module("supplier.controllers",[]);controllerModule.controller("IndexCtrl",["$rootScope","$scope","$http","$timeout","$q","$injector",function($rootScope,$scope,$http,$timeout,$q,$injector){$rootScope.tab="index",$scope.scrollToContent=function(cb){$("body").animate({scrollTop:$(window).height()},cb)},$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()}),document.body.scrollTop=0,$(".transitionEndBubbleStop").off("transitionend"),$(".transitionEndBubbleStop").bind("transitionend",function(e){e.stopPropagation()});var getCatQ=$http.post("/agent",{module:"supplier",partial:"document",api:"get_ssv_cat",param:{ssv_user_id:$rootScope.ssv_user_id}}).then(function(body){body.data.cat_list&&body.data.cat_list.length&&($scope.catList=body.data.cat_list)});$rootScope.preloadComplete["finally"](function(){getCatQ.then($scope.removeLoading),$scope.nextTick(function(){$scope.bannerSwiper=new Swiper("#banner",{pagination:".swiper-pagination",autoplay:6e3,speed:800,paginationClickable:!0,spaceBetween:30,keyboardControl:!0,preloadImages:!1,lazyLoading:!0})})}),$scope.openApi=function(api){window.open(Constant.protocol+"://"+Constant.host+"/api/apipreview-"+api.api_id+".html","_blank")}}]).controller("LoginCtrl",["$rootScope","$scope","$http","$cookies","$stateParams",function($rootScope,$scope,$http,$cookies,$stateParams){$rootScope.tab="login",$scope.contentHeight=Math.max($rootScope.screenRect.height,$rootScope.screenRect.width)+"px";var fromState=$stateParams.fromState||"index";$scope.login=$rootScope.throttle(function(){if($scope.loginForm.$invalid)return void($scope.loginForm.$error.required&&$scope.loginForm.$error.required.forEach(function(r){r.$setDirty(!0)}));var OSName="Unknown OS";navigator.appVersion.indexOf("Win")!=-1&&(OSName="Windows"),navigator.appVersion.indexOf("Mac")!=-1&&(OSName="MacOS"),navigator.appVersion.indexOf("X11")!=-1&&(OSName="UNIX"),navigator.appVersion.indexOf("Linux")!=-1&&(OSName="Linux");var myParam={user_account:$scope.user_account?$scope.user_account.trim():"",password:$scope.password?$scope.password.trim():"",login_system:OSName};$scope.refreshing=!0,$http.post("/login",{param:myParam}).then(function(body){"boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success?($rootScope.profile=body.data,$cookies.put("_session",JSON.stringify(body.data),{path:"/",domain:""+(Constant.nosubdomain?"":".")+Constant.host}),window.rxStream&&window.rxStream.trackSignup(myParam.user_account,"rop_sign_up",{subject:{o_rop_user_name:$rootScope.profile&&$rootScope.profile.login_user_name||"",o_rop_user_type:$rootScope.profile&&$rootScope.profile.login_user_type&&("2"==$rootScope.profile.login_user_type?"供应商":"1"==$rootScope.profile.login_user_type?"开发者":"管理员")||""}}),$rootScope.getSystemHints.call(),$rootScope.go(fromState)):($scope.login_msg=body.data.msg,$rootScope.alert(body.data.msg))},function(why){$scope.login_msg=why})["finally"](function(){$scope.refreshing=!1})},800),$scope.clearMsg=function(){$scope.login_msg=""},$scope.toPlatform=$rootScope.toPlatform,$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]);