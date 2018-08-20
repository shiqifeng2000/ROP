"use strict";var controllerModule=angular.module("welcome.controllers",[]);controllerModule.config(["$provide","$logProvider","$compileProvider",function($provide,$logProvider,$compileProvider){$logProvider.debugEnabled(!1),$compileProvider.debugInfoEnabled(!1)}]).controller("IndexCtrl",["$rootScope","$scope","$http","$q","$window",function($rootScope,$scope,$http,$q,$window){$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()});var swiperOpt={pagination:".swiper-pagination",autoplay:4e3,speed:400,slidesPerView:1,paginationClickable:!0,spaceBetween:30,keyboardControl:!0,effect:"fade",preloadImages:!1,onLazyImageReady:function(swiper,slide,image){},onProgress:function(swiper,progress){}};document.body.scrollTop=0,$(".transitionEndBubbleStop").off("transitionend"),$(".transitionEndBubbleStop").bind("transitionend",function(e){e.stopPropagation()}),window.test=$scope,$scope.$on("$viewContentLoaded",function(){$rootScope.removeLoading()["finally"](function(){!window.swiper&&(window.swiper=new Swiper(".swiper-container",swiperOpt))})})}]).controller("SuppliersCtrl",["$rootScope","$scope","$http",function($rootScope,$scope,$http){$scope.items=[],$scope.ssvs=[],$scope.pageindex=1,$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()}),$scope.load=function(){$scope.lock||($scope.lock=!0,$http.post("/agent",{module:"welcome",partial:"suppliers",api:"suppliers"}).then(function(body){if("boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success){$scope.items=body.data.data_list}else $rootScope.alert(body.data.msg);$scope.lock=!1},function(why){$rootScope.alert(why),$scope.lock=!1}))},$scope.toSsv=function(ssv){$scope.locate(Constant.protocol+"://"+ssv.user_domain+"."+Constant.host+":"+Constant.port)},$scope.isOdd=function(index){var isOdd=index%2;return isOdd},$scope.load(),$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("DocCtrl",["$rootScope","$scope","$http","$stateParams","$location","$q","$mdSidenav",function($rootScope,$scope,$http,$stateParams,$location,$q,$mdSidenav){var catQ=($stateParams.docId?$stateParams.docId:$location.search().doc,$q.when()),getCatQ=function(){return $scope.loading=!0,$rootScope.ajax("doc_cat",{}).then(function(body){$scope.rootTree=body.cat_list_level_1})["finally"](function(){$scope.loading=!1})},getDetailQ=function(doc_id){return $scope.refreshing?$q.reject():($scope.refreshing=!0,$scope.legacyDocument=null,$rootScope.ajax("doc_detail",{doc_id:doc_id}).then(function(data){var flag=!0;return catQ.then(function(){$scope.rootTree.every(function(trunk,i){return delete trunk._detail,!!flag&&(trunk.cat_list_level_2&&trunk.cat_list_level_2.length&&trunk.cat_list_level_2.every(function(branch,i){return delete branch._isOpen,(branch?branch.doc_id.toLowerCase():"")==(doc_id?doc_id.toLowerCase():"")&&(branch._isOpen=!0,$scope.currentTrunk=trunk,branch._detail=data,flag=!1),!0}),!0)}),flag&&($scope.legacyDocument=data)}),data})["finally"](function(){$scope.refreshing=!1}))};$scope.toggleDetail=function(trunk,branch){$scope.currentTrunk=[],$scope.checkoutDoc(trunk,branch)},$scope.checkoutDoc=function(trunk,branch){if($scope.refreshing)return $q.reject();if($scope.loading)return $q.reject();var trueBranch=branch;trueBranch||(trueBranch=trunk.cat_list_level_2[0]),trueBranch.doc_id&&($scope.docId&&trueBranch.doc_id&&$scope.docId.toLowerCase()==trueBranch.doc_id.toLowerCase()?$mdSidenav("doc_detail").open():$rootScope.go("document.details",{id:trueBranch.doc_id?trueBranch.doc_id.toLowerCase():""}))},$scope.getDetailQ=getDetailQ,$scope.getCatQ=getCatQ,$scope.closeDetail=function(){return $mdSidenav("doc_detail").close()},$scope.reset=function(){$scope.docId="",$scope.detail=null,catQ.then(function(){$scope.rootTree.every(function(trunk,i){delete trunk._detail,trunk.cat_list_level_2&&trunk.cat_list_level_2.length&&trunk.cat_list_level_2.every(function(branch,i){delete branch._isOpen})})})},!$scope.rootTree&&(catQ=$scope.getCatQ()),$scope.catQ=catQ,window.test=$scope,$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("DocDetailCtrl",["$rootScope","$scope","$stateParams","$timeout","$state","$q","$mdSidenav",function($rootScope,$scope,$stateParams,$timeout,$state,$q,$mdSidenav){var docId=$stateParams.id,detailQ=$scope.$parent.catQ.then(function(){return $scope.getDetailQ(docId)}).then(function(data){$scope.$parent.detail=data,window.rxStream&&window.rxStream.track("rop_document_visit",{properties:{b_rop_document_name:data.doc_name||"未知页面"}})}),tempElement=($mdSidenav("doc_detail"),document.createElement("i"));tempElement.style.width="1rem",tempElement.style.display="block",document.body.appendChild(tempElement);var rem=angular.element(tempElement).width();document.body.removeChild(tempElement),$scope.imageresizer=function(element){angular.element("img",element).each(function(i,img){var $img=angular.element(img),naturalWidth=$img.attr("width"),naturalHeight=$img.attr("height");naturalWidth&&naturalHeight&&$img.css({height:($rootScope.screenRect.width-9.87*rem-2)*naturalHeight/naturalWidth})})},$scope.$parent.docId=docId,detailQ.then(function(){$rootScope.nextTick(function(){$mdSidenav("doc_detail").toggle()})}),$scope.$on("$destroy",function(){"document.details"!=$state.current.name&&($mdSidenav("doc_detail").isOpen()&&$mdSidenav("doc_detail").close(),$scope.reset())}),$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("LoginCtrl",["$rootScope","$scope","$http","$cookies","$stateParams",function($rootScope,$scope,$http,$cookies,$stateParams){$scope.contentHeight=Math.max($rootScope.screenRect.height,$rootScope.screenRect.width)+"px";var fromState=$stateParams.fromState||"index";$scope.login=$rootScope.throttle(function(){if($scope.loginForm.$invalid)return void($scope.loginForm.$error.required&&$scope.loginForm.$error.required.forEach(function(r){r.$setDirty(!0)}));var OSName="Unknown OS";navigator.appVersion.indexOf("Win")!=-1&&(OSName="Windows"),navigator.appVersion.indexOf("Mac")!=-1&&(OSName="MacOS"),navigator.appVersion.indexOf("X11")!=-1&&(OSName="UNIX"),navigator.appVersion.indexOf("Linux")!=-1&&(OSName="Linux");var myParam={user_account:$scope.user_account?$scope.user_account.trim():"",password:$scope.password?$scope.password.trim():"",login_system:OSName};$scope.refreshing=!0,$http.post("/login",{param:myParam}).then(function(body){"boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success?($rootScope.profile=body.data,$cookies.put("_session",JSON.stringify(body.data),{path:"/",domain:""+(Constant.nosubdomain?"":".")+Constant.host}),window.rxStream&&window.rxStream.trackSignup(myParam.user_account,"rop_sign_up",{subject:{o_rop_user_name:$rootScope.profile&&$rootScope.profile.login_user_name||"",o_rop_user_type:$rootScope.profile&&$rootScope.profile.login_user_type&&("2"==$rootScope.profile.login_user_type?"供应商":"1"==$rootScope.profile.login_user_type?"开发者":"管理员")||""}}),$rootScope.getSystemHints.call(),$rootScope.go(fromState)):($scope.login_msg=body.data.msg,$rootScope.alert(body.data.msg))},function(why){$scope.login_msg=why})["finally"](function(){$scope.refreshing=!1})},800),$scope.clearMsg=function(){$scope.login_msg=""},$scope.toPlatform=$rootScope.toPlatform,$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("SDKToolCtrl",["$rootScope","$scope","$http","$stateParams",function($rootScope,$scope,$http,$stateParams){$scope.sdks=[{logo:"/resource/logo-dotnet.png",bg:"#33B5E5"},{logo:"/resource/logo-java.png",bg:"#AA66CC"},{logo:"/resource/logo-php.png",bg:"#00CC99"},{logo:"/resource/logo-js.png",bg:"#FFBB33"},{logo:"/resource/logo-android.png",bg:"#FF4444"}],$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()});$http.post("/agent",{module:"welcome",partial:"sdktool",api:"list",param:{sdk_type:1}}).then(function(body){if("boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success){$scope.sdkcontent=[];for(var prop in body.data.sdk)$scope.sdkcontent.push($.extend({_title:prop},body.data.sdk[prop]))}else $rootScope.alert(body.data.msg)},function(why){$rootScope.alert(why)});$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("FeaturesCtrl",["$rootScope","$scope","$http","$state",function($rootScope,$scope,$http,$state){$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()}),$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("APICtrl",["$rootScope","$scope","$http","$state",function($rootScope,$scope,$http,$state){var catQ=function(){return $http.post("/agent",{module:"welcome",partial:"api",api:"list"}).then(function(body){if($scope.originalCat={cat_list:body.data.cat_list,_selectedItem:0},body.data&&body.data.cat_list&&body.data.cat_list.length){if($scope.cat={cat_list:body.data.cat_list,_selectedItem:0},$scope.cat.cat_list)for(var j=0;j<$scope.cat.cat_list.length;j++)if($scope.cat.cat_list[j].group_list){$scope.cat.cat_list[j]._selectedItem=0;for(var i=0;i<$scope.cat.cat_list[j].group_list.length;i++)if($scope.cat.cat_list[j].group_list[i].api_list)for(var k=0;k<$scope.cat.cat_list[j].group_list[i].api_list.length;k++);}}else $scope.cat={cat_list:body.data.cat_list,_selectedItem:0},$rootScope.alert("当前供应商没有任何API发布")},function(why){$rootScope.alert(why)})};$scope.changeAPISearch=function(){var cat=JSON.parse(JSON.stringify($scope.originalCat));if(cat._selectedItem=$scope.cat._selectedItem,cat.cat_list)for(var j=0;j<cat.cat_list.length;j++)if(cat.cat_list[j]._selectedItem=$scope.cat.cat_list[j]._selectedItem,cat.cat_list[j].group_list)for(var i=0;i<cat.cat_list[j].group_list.length;i++)if(cat.cat_list[j].group_list[i].api_list)for(var k=cat.cat_list[j].group_list[i].api_list.length;k--;)cat.cat_list[j].group_list[i].api_list[k].api_name.indexOf($scope.apiSearch)==-1&&cat.cat_list[j].group_list[i].api_list[k].api_title.indexOf($scope.apiSearch)==-1&&cat.cat_list[j].group_list[i].api_list.splice(k,1);$scope.cat=cat},catQ(),$scope.apiMethod=function(api){return Constant.protocol+"://"+Constant.host+"/api/ApiMethod-"+api.api_id+".html"},$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("DebugToolCtrl",["$rootScope","$scope","$http","$stateParams","$location",function($rootScope,$scope,$http,$stateParams,$location){var key=$stateParams.key?$stateParams.key:$location.search().key;$("#mainFrame").attr("src","/frame/ApiTool/index"+(key?"?sign="+key:"")),$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()}),$scope.$on("$viewContentLoaded",function(event){window._messageListener=function(event){event.origin==Constant.legacyDomain&&$("iframe").height(event.data+20)},window.addEventListener("message",window._messageListener),$rootScope._toolbarFeature=2,$rootScope.removeLoading()})}]).controller("ServicesCtrl",["$rootScope","$scope","$http","$mdDialog","$mdSidenav","$window",function($rootScope,$scope,$http,$mdDialog,$mdSidenav,$window){$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()});$http.post("/agent",{module:"welcome",partial:"services",api:"notice",param:{}}).then(function(body){body.data.data_list&&body.data.data_list.length&&($scope.notice_list=body.data.data_list)},function(why){$rootScope.alert(why)}),$http.post("/agent",{module:"welcome",partial:"services",api:"faq",param:{}}).then(function(body){body.data.data_list&&body.data.data_list.length&&($scope.faqs=body.data.data_list)},function(why){$rootScope.alert(why)});$scope.toggleSidenav=function(){return $mdSidenav("right").toggle()},$scope.askQuestion=function(e){return $scope.qaForm.$invalid?($mdDialog.show($mdDialog.alert().title("提示").textContent("请核对提交表单是否正确").ariaLabel("提交失败").ok("好的").targetEvent(e)),void($scope.qaForm.$error.required&&$scope.qaForm.$error.required.forEach(function(r){r.$setDirty(!0)}))):(e.preventDefault(),$http.post("/agent",{module:"welcome",partial:"services",api:"askQuestion",param:$scope.question}).then(function(body){"boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success?($mdDialog.show($mdDialog.alert().title("提交成功").textContent("我们收到了您的问题，会尽快回答，请次日登录帮助中心查看我们的回复.").ariaLabel("提交成功").ok("好的").targetEvent(e)),$mdSidenav("right").close()):$mdDialog.show($mdDialog.alert().title("提交失败").textContent(body.data.msg).ariaLabel("提交失败").ok("好的").targetEvent(e))},function(why){$rootScope.alert(why)}))},$scope.$on("$viewContentLoaded",$rootScope.removeLoading)}]).controller("SearchCtrl",["$rootScope","$scope","$http",function($rootScope,$scope,$http){$scope.searchCategory="all",$scope.hints=[],$scope.pageIndex=1,$scope.pageSize=new Number(10);var initial=!0;$scope.searcher=function(index,size){return initial?void(initial=!1):void $http.post("/agent",{module:"welcome",partial:"search",api:"search",param:{pageindex:index||$scope.pageIndex,pagesize:size||$scope.pageSize,searchflg:$scope.searchCategory,keyword:$("#bloodhound").val()}}).then(function(body){$scope.response=body.data.response,body.data.response&&body.data.response.docs&&body.data.response.docs.length?"all"==$scope.searchCategory?$scope.total=body.data.response.numFound:"api"==$scope.searchCategory?$scope.total=body.data.response.numFoundApi:"doc"==$scope.searchCategory?$scope.total=body.data.response.numFoundDoc:"sdk"==$scope.searchCategory?$scope.total=body.data.response.numFoundSdk:"tool"==$scope.searchCategory?$scope.total=body.data.response.numFoundTool:"other"==$scope.searchCategory?$scope.total=body.data.response.numFoundOther:$scope.total=0:$scope.total=0,setTimeout(function(){$(window).trigger("scroll")},100)},function(why){$rootScope.alert(why),$scope.total=0})},$http.post("/agent",{module:"welcome",partial:"search",api:"hints"}).then(function(body){"boolean"==typeof body.data.is_success&&body.data.is_success||"string"==typeof body.data.is_success&&"true"==body.data.is_success?($scope.rawHints=body.data.hint_list,require(["bloodhound","typeahead"],function(){var keyword=new Bloodhound({datumTokenizer:function(str){return str?str.split(""):[]},queryTokenizer:function(str){return str?str.split(""):[]},sorter:function(itemA,itemB){return itemA.indexOf($scope.keyword)>itemB.indexOf($scope.keyword)?-1:itemA.indexOf($scope.keyword)<itemB.indexOf($scope.keyword)?1:0},local:$scope.rawHints.map(function(r){return r.title})});$(".typeahead").typeahead({hint:!0,highlight:!0,minLength:1},{name:"keyword",source:keyword,limit:10}).on("typeahead:selected",function(event,selection){$scope.research($scope.searchCategory),$scope.$digest()})})):$rootScope.alert(body.data.msg)},function(why){$rootScope.alert(why)}),$scope.research=function(cat,key){$scope.hints=[],$scope.searchCategory=cat,$scope.pageIndex=1,$scope.pageSize=new Number(10)},$scope.$on("$viewContentLoaded",function(event){$rootScope.removeLoading()})}]);