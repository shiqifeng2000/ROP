"use strict";define([],function(){return["$rootScope","$scope","$mdDialog","$timeout",function($rootScope,$scope,$mdDialog,$timeout){var pageTotal=999999;$scope.init=function(){$scope.keyword="",$scope.keywordArray=[""],$scope.nextRowkey="",$scope.pageIndex=1,$scope.pageIndexClone=1,$scope.showMessage=!0,$scope.pageTotal=999999,$scope.infinite=!0,$scope.hasNext=!0,$scope.searchdate=new Date,$scope.endtime=$scope.searchdate.Format("HH:mm:ss"),$scope.begintime=new Date((new Date).setHours(Math.max($scope.searchdate.getHours()-1,0))).Format("HH:mm:ss"),$scope.mindate=new Date($scope.searchdate.getFullYear(),$scope.searchdate.getMonth(),$scope.searchdate.getDate()-60),$scope.maxdate=new Date,$scope.hasNext=!0},$scope.reset=function(){$scope.init(),$scope.pageSize=new Number(10)},$scope.searcher=function(index,size){$scope.showMessage&&($scope.showMessage=!1);var rowkey=index?index>$scope.pageIndexClone?$scope.keywordArray[$scope.pageIndexClone]:index<$scope.pageIndexClone?$scope.keywordArray[$scope.pageIndexClone-2]:$scope.keywordArray[$scope.pageIndexClone-1]:$scope.keywordArray[$scope.pageIndexClone-1],pageindex=index||$scope.pageIndex;return $scope.refreshing||pageTotal<pageindex?void $rootScope.nextTick(function(){$scope.pageIndex!=$scope.pageIndexClone&&($scope.pageIndex=$scope.pageIndexClone)}):($scope.refreshing=!0,$scope.tableData=[],$scope.ajax("list",{pageindex:pageindex,keyword:$scope.keyword,searchdate:$scope.searchdate.Format("yyyy-MM-dd"),begintime:$scope.begintime,endtime:$scope.endtime,rowkey:rowkey},function(data){"boolean"==typeof data.is_success&&data.is_success||"string"==typeof data.is_success&&"true"==data.is_success||data.log_list?($scope.tableData=data.log_list,data.rowkey&&(pageindex>=$scope.pageIndexClone&&data.rowkey>$scope.nextRowkey?$scope.keywordArray.push(data.rowkey):pageindex<=$scope.pageIndexClone&&data.rowkey<$scope.nextRowkey&&($scope.keywordArray&&$scope.keywordArray.length>2?$scope.keywordArray.splice(pageindex):$scope.keywordArray.splice(1))),"1"!=data.has_next?(pageTotal=pageindex,$scope.hasNext=!1):$scope.hasNext=!0,$scope.pageIndexClone=pageindex):$rootScope.alert(data.msg)},function(){})["finally"](function(){$scope.refreshing=!1}))},$scope.tableData=[],$scope.research=function(){$scope.pageIndex=1,$scope.hasNext=!0,pageTotal=999999,$scope.pageSize=new Number(10)},$scope.init(),$scope.infiniteEnd=function(index){return!$scope.hasNext},$scope.expandRow=function(row){$scope.tableData&&$scope.tableData.length&&$scope.tableData.forEach(function(r){r!==row&&(r._expand=!1)}),row._expand=!row._expand};var ParamController=function(scope,$mdDialog,data){scope.data=data,scope.tooltip="复制",scope.cliper=new Clipboard(".cliper",{text:function(){return angular.element("#myText")[0].innerText}}),scope.makeTag=function(row){return"<"+row.param_name+">"+row.param_value+"</"+row.param_name+">"},scope.copy=function(){scope.tooltip="已复制"},scope.resetTooltip=function(){$timeout(function(){scope.tooltip="复制"},100)},scope.closeDialog=function(){scope.cliper.destroy(),$mdDialog.hide()}};$scope.showParamDialog=function($event,rawData){var data=[];try{data=JSON.parse(angular.element("<div>"+rawData+"</div>")[0].innerHTML.replace(/'/g,'"'))}catch(e){return void $rootScope.alert("数据解析出现问题，请联系开发者")}$mdDialog.show({controller:ParamController,template:'<md-dialog aria-label="Mango (Fruit)">\n                      <md-button class="md-icon-button cliper" aria-label="复制" style="position: absolute; top: 10px; right: 10px;z-index: 10;" ng-click="copy()" ng-mouseleave="resetTooltip()">\n                          <md-icon class="" md-svg-icon="content:ic_content_copy_24px"></md-icon>\n                          <md-tooltip md-direction="down">{{tooltip}}</md-tooltip>\n                      </md-button>\n                      <md-dialog-content class="md-dialog-content param-viewer">\n\n                          <div class="md-dialog-content-body">\n                              <table class="md-datatable" cellspacing="0">\n                                  <tbody id="myText">\n                                      <tr><td colspan="3"><span>&lt;</span><span class="tag">LogDetails</span><span>&gt;</span></td></tr>\n                                      <tr><td></td><td colspan="2"><span>&lt;</span><span class="tag">Parameters</span><span>&gt;</span></td></tr>\n                                      <tr ng-repeat="row in data track by $index"><td></td><td></td><td><span>&lt;</span><span class="tag" ng-bind="row.param_name"></span><span>&gt;</span><span class="content" ng-bind="row.param_value"></span><span>&lt;/</span><span class="tag" ng-bind="row.param_name"></span><span>&gt;</span></td></tr>\n                                      <tr><td></td><td colspan="2"><span>&lt;/</span><span class="tag">Parameters</span><span>&gt;</span></td></tr>\n                                      <tr><td colspan="3"><span>&lt;/</span><span class="tag">LogDetails</span><span>&gt;</span></td></tr>\n                                  </tbody>\n                              </table>\n                          </div>\n                      </md-dialog-content>\n                  </md-dialog>',targetEvent:$event,parent:angular.element(document.querySelector("body>section>md-content")),clickOutsideToClose:!0,locals:{data:data}})},window.test=function(){return $scope}}]});