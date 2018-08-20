"use strict";define(["chartJs","../../services"],function(cta){return["$rootScope","$scope","$q","$location","$mdDialog","ROPDateUtil",function($rootScope,$scope,$q,$location,$mdDialog,ROPDateUtil){var modeArray=[{id:1,tab:0,sort:10},{id:2,tab:0},{id:3,tab:0}],secureNumber=function(value){return"string"==typeof value?Number.parseInt(value):"number"==typeof value?value:0},apicallSorter=function(item1,item2){var count1="string"==typeof item1.callcount?Number.parseInt(item1.callcount):"number"==typeof item1.callcount?item1.callcount:0,count2="string"==typeof item2.callcount?Number.parseInt(item2.callcount):"number"==typeof item2.callcount?item2.callcount:0;return count1>count2?-1:count1<count2?1:0},appcallSorter=function(item1,item2){var count1=secureNumber(item1.all_count),count2=secureNumber(item2.all_count);return count1>count2?-1:count1<count2?1:0},daycallSorter=function(item1,item2){var count1=secureNumber(item1.content.replace(/^.+\s(.+)/,"$1")),count2=secureNumber(item2.content.replace(/^.+\s(.+)/,"$1"));return count1<count2?-1:count1>count2?1:0},updateBarChartConfig=function(log_list){var barChartConfigClone={type:"bar",data:{labels:["114.132.134.13"],datasets:[{type:"bar",label:"调用次数",backgroundColor:"rgba(0,197,163,0.4)",hoverBackgroundColor:"#00C5A3",data:[],yAxisID:"y-axis-0"},{type:"bar",label:"成功次数",backgroundColor:"rgba(0,145,120,0.4)",hoverBackgroundColor:"#009178",data:[],yAxisID:"y-axis-0"},{type:"line",label:"占比",data:[],borderWidth:2,borderColor:"#00C5A3",backgroundColor:"rgba(255,255,255,0.2)",fill:!0,lineTension:.1,pointRadius:3,pointHoverRadius:4,pointBorderColor:"#fff",pointHoverBorderWidth:1,pointBorderWidth:1,pointBackgroundColor:"#009178",pointHitRadius:3.5,yAxisID:"y-axis-1"}]},options:{responsive:!0,maintainAspectRatio:!1,showLines:!0,legend:{display:!1},title:{display:!0,text:"调用数",fontSize:14,padding:16,fontFamily:'"lanting","Helvetica Neue","Microsoft YaHei"1'},elements:{rectangle:{borderWidth:1.5,borderColor:"#009178",borderSkipped:"bottom"}},hover:{mode:"single",animationDuration:400},animation:{duration:400,easing:"easeOutQuart"},scales:{yAxes:[{id:"y-axis-0",ticks:{beginAtZero:!0,maxTicksLimit:5}},{id:"y-axis-1",display:!0,position:"right",ticks:{maxTicksLimit:5,beginAtZero:!0,callback:function(label,index){return Math.round(10*label)/10+"%"}},gridLines:{display:!0,lineWidth:1,color:"rgba(255,255,255,0.3)",zeroLineWidth:1}}],xAxes:[{ticks:{beginAtZero:!0},gridLines:{}}]}}},labels=[],data=[[],[],[]],total=0;return[].concat.apply([],log_list.sort(apicallSorter).map(function(r,i){return i<$scope.mode.sort?[r]:[]})).forEach(function(r){var callcount=secureNumber(r.callcount);total+=callcount,labels.push(r.content),data[0].push(callcount),data[1].push(secureNumber(r.successcount));var percent=0;data[0].forEach(function(r1,i1){percent+=r1}),data[2].push(percent)}),barChartConfigClone.data.labels=labels,barChartConfigClone.data.datasets[0].data=data[0],barChartConfigClone.data.datasets[1].data=data[1],barChartConfigClone.data.datasets[2].data=data[2].map(function(r){return Math.floor(1e4*r/total)/100}),barChartConfigClone},updateLineChartConfig=function(log_list){var lineChartConfigClone={type:"line",data:{labels:["7:00"],datasets:[{label:"实时调用量",data:[5],borderWidth:2,borderColor:"#fff",backgroundColor:"rgba(255,255,255,0.2)",fill:!0,lineTension:.1,pointRadius:3,pointHoverRadius:4,pointBorderColor:"#fff",pointHoverBorderWidth:1,pointBorderWidth:1,pointBackgroundColor:"#009178",pointHitRadius:3.5}]},options:{responsive:!0,maintainAspectRatio:!1,showLines:!0,title:{display:!0,text:"实时调用量",fontColor:"#fff",padding:14,fontSize:13,fontFamily:'"lanting","Helvetica Neue","Microsoft YaHei"',fontStyle:"normal"},legend:{display:!1},tooltips:{mode:"label",callbacks:{}},hover:{mode:"single"},scales:{xAxes:[{id:"x-axis-0",gridLines:{display:!1,lineWidth:1,color:"rgba(255,255,255,0.3)",zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"},ticks:{fontColor:"#fff",beginAtZero:!0,autoSkip:!1,callback:function(label,index){return index%Math.ceil(log_list.length/8)==0?label:null}}}],yAxes:[{id:"y-axis-0",display:!0,ticks:{maxTicksLimit:5,beginAtZero:!0,fontColor:"#fff",padding:5},gridLines:{display:!0,lineWidth:1,color:"rgba(255,255,255,0.3)",zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"}}]}}},labels=[],data=[];return log_list.forEach(function(r){labels.push(r.calldatehour?r.calldatehour.replace(/.*\s(.*)/,"$1:00"):"00:00"),data.push(r.all_count)}),lineChartConfigClone.data.labels=labels,lineChartConfigClone.data.datasets[0].data=data,lineChartConfigClone};$scope.summary={},$scope.selectMode=function(mode){$scope.lock||($scope.mode=modeArray[mode-1],$scope.listAPI())},$scope.listAPI=function(){if(!$scope.lock)return $scope.lock=!0,$scope.ajax("log_get",{search_type:$scope.mode.id,search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),api_name:$scope.api_name,user_id:$scope.user_id,app_id:$scope.app_id},function(data){$scope.log_list=data.log_list,$scope.propertyName="content",$scope.sortBy($scope.propertyName,!0),$scope.log_summary={callcount:0,successcount:0,failcount:0,sysfailcount:0,averagetime:0,avgroptime:0,avgsuppliertime:0,f_success_num:0,f_faild_num:0,f_num:0,a_success_num:0,a_faild_num:0,a_num:0,b_success_num:0,b_faild_num:0,b_num:0,c_success_num:0,c_faild_num:0,c_num:0,d_success_num:0,d_faild_num:0,d_num:0,e_success_num:0,e_faild_num:0,e_num:0},$scope.log_list.forEach(function(r){$scope.log_summary.callcount+=Number.parseInt(r.callcount),$scope.log_summary.successcount+=Number.parseInt(r.successcount),$scope.log_summary.failcount+=Number.parseInt(r.failcount),$scope.log_summary.sysfailcount+=Number.parseInt(r.sysfailcount),$scope.log_summary.averagetime+=Number.parseFloat(r.averagetime)*Number.parseInt(r.callcount),$scope.log_summary.avgroptime+=Number.parseFloat(r.avgroptime)*Number.parseInt(r.callcount),$scope.log_summary.avgsuppliertime+=Number.parseFloat(r.avgsuppliertime)*Number.parseInt(r.callcount),$scope.log_summary.f_success_num+=Number.parseInt(r.f_success_num),$scope.log_summary.f_faild_num+=Number.parseInt(r.f_faild_num),$scope.log_summary.f_num+=Number.parseInt(r.f_num),$scope.log_summary.a_success_num+=Number.parseInt(r.a_success_num),$scope.log_summary.a_faild_num+=Number.parseInt(r.a_faild_num),$scope.log_summary.a_num+=Number.parseInt(r.a_num),$scope.log_summary.b_success_num+=Number.parseInt(r.b_success_num),$scope.log_summary.b_faild_num+=Number.parseInt(r.b_faild_num),$scope.log_summary.b_num+=Number.parseInt(r.b_num),$scope.log_summary.c_success_num+=Number.parseInt(r.c_success_num),$scope.log_summary.c_faild_num+=Number.parseInt(r.c_faild_num),$scope.log_summary.c_num+=Number.parseInt(r.c_num),$scope.log_summary.d_success_num+=Number.parseInt(r.d_success_num),$scope.log_summary.d_faild_num+=Number.parseInt(r.d_faild_num),$scope.log_summary.d_num+=Number.parseInt(r.d_num),$scope.log_summary.e_success_num+=Number.parseInt(r.e_success_num),$scope.log_summary.e_faild_num+=Number.parseInt(r.e_faild_num),$scope.log_summary.e_num+=Number.parseInt(r.e_num)}),$scope.log_summary.successrate=0!=$scope.log_summary.callcount?(100*$scope.log_summary.successcount/$scope.log_summary.callcount).toFixed(4):0,$scope.log_summary.failrate=0!=$scope.log_summary.callcount?(100*$scope.log_summary.sysfailcount/$scope.log_summary.callcount).toFixed(4):0,$scope.log_summary.sysfailrate=0!=$scope.log_summary.failcount?(100*$scope.log_summary.sysfailcount/$scope.log_summary.failcount).toFixed(4):0,$scope.log_summary.averagetime=$scope.log_summary.callcount?($scope.log_summary.averagetime/$scope.log_summary.callcount).toFixed(4):0,$scope.log_summary.avgroptime=$scope.log_summary.callcount?($scope.log_summary.avgroptime/$scope.log_summary.callcount).toFixed(4):0,$scope.log_summary.avgsuppliertime=$scope.log_summary.callcount?($scope.log_summary.avgsuppliertime/$scope.log_summary.callcount).toFixed(4):0})["finally"](function(){$scope.lock=!1})},$scope.listHourAPI=function(){return $scope.mindate=$scope.maxdate,$scope.listAPI()},$scope.showLog=function(){if(!$scope.lock)return $scope.lock=!0,$scope.ajax("log_get",{search_type:$scope.mode.id,search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),api_name:$scope.api_name,search_key:$scope.mode.log.content,user_id:$scope.user_id,app_id:$scope.app_id},function(data){if(data&&data.log_list&&data.log_list.length){if($scope.mode.log=data.log_list[0],$scope.mode.showingDetail){if(1==$scope.mode.id)return $scope.selectAPITab();if(2==$scope.mode.id)return $scope.selectIPTab();if(3==$scope.mode.id)return $scope.selectHourTab()}}else $scope.mode.log={content:$scope.mode.log.content},$scope.mode.data.log_list=[],$scope.mode.data.error_list&&($scope.mode.data.error_list=[]),1==$scope.mode.id&&$scope.updateChart()})["finally"](function(){$scope.lock=!1})},$scope.showHourLog=function(){return $scope.mindate=$scope.maxdate,$scope.showLog()},$scope.realtimeAPIs=function(){var today=ROPDateUtil.freeFormatDate(new Date,"yyyy-MM-dd");return $scope.ajax("realtime_apis",{search_begin:today,search_end:today,api_name:$scope.mode.log.content},function(data){return $scope.reatimeAPIs=data&&data.log_list&&data.log_list.length?data.log_list:[],$scope.reatimeAPIs})};var getAPIDetail=function(){return $scope.ajax("api_detail",{search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),api_name:$scope.mode.log.content},function(data){return $scope.mode.data=data,data})},getAppDetail=function(){return $scope.ajax("api_app",{search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),api_name:$scope.mode.log.content},function(data){return $scope.mode.data=data,data})},getIPDetail=function(){return $scope.ajax("ip_detail",{search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),api_name:$scope.mode.log.content},function(data){return $scope.mode.data=data,data})},getHourDetail=function(){return $scope.ajax("hour_api",{search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),search_hour:$scope.mode.log.content},function(data){return $scope.mode.data=data,data})},getHourIPDetail=function(){return $scope.ajax("hour_ip",{search_begin:ROPDateUtil.freeFormatDate($scope.mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate($scope.maxdate,"yyyy-MM-dd"),search_hour:$scope.mode.log.content},function(data){return $scope.mode.data=data,data})};$scope.updateChart=function(dataNumber){dataNumber&&($scope.mode.sort=dataNumber),$scope.barChart&&$scope.barChart.destroy(),$scope.lineChart&&$scope.lineChart.destroy();var ctx=$(".hero-canvas canvas")[0].getContext("2d");$scope.barChart=new Chart(ctx,updateBarChartConfig($scope.mode.data.log_list));var ctx1=$(".line-canvas canvas")[0].getContext("2d");$scope.lineChart=new Chart(ctx1,updateLineChartConfig($scope.reatimeAPIs))},$scope.selectAPITab=function(tab){void 0!==tab&&($scope.mode.tab=tab),$scope.mode.data=null,$scope.mode.belly=null,$scope.sublock=!0;var q=tab?getAppDetail():getAPIDetail();return $q.all([q,$scope.realtimeAPIs()]).then(function(data){$scope.sublock=!1,$rootScope.nextTick(function(){$scope.updateChart()})})},$scope.selectIPTab=function(tab){return $scope.sublock=!0,getIPDetail().then(function(){$scope.sublock=!1})},$scope.selectHourTab=function(tab){return $scope.mode.data=null,$scope.sublock=!0,(tab?getHourIPDetail():getHourDetail()).then(function(){void 0!==tab&&($scope.mode.tab=tab),$scope.sublock=!1})},$scope.reset=function(){$scope.now=new Date,$scope.mindate=new Date($scope.now.getFullYear(),$scope.now.getMonth(),$scope.now.getDate()),$scope.maxdate=new Date,$scope.mode=modeArray[0],$scope.mode.showingDetail=!1,$scope.api_name="",$scope.user_id="",$scope.app_id="",$scope.propertyName=null,$scope.reverse=!1,$scope.listAPI()},$scope.enterDetail=function(log){if(!$scope.lock)return $scope.mode.log=log,$scope.mode.isGrid=void 0===$scope.mode.isGrid||$scope.mode.isGrid,$scope.mode.showingDetail=!0,$rootScope.globalBack=globalBack,1==$scope.mode.id?$scope.selectAPITab(0):2==$scope.mode.id?$scope.selectIPTab(0):3==$scope.mode.id?$scope.selectHourTab(0):void 0},$scope.exitDetail=function(mode){$scope.barChart&&$scope.barChart.destroy(),$scope.lineChart&&$scope.lineChart.destroy(),$scope.lineChart1&&$scope.lineChart1.destroy(),$scope.mode.showingDetail=!1,$scope.mode.cta=null,$scope.mode.log=null,$scope.mode.belly=null,$scope.listAPI(),$rootScope.globalBack=null},$scope.reset(),$scope.expandRow=function(log){log._expand_status=2,$scope.mode.expanded=log},$scope.collapseRow=function(log){log._expand_status=null,$scope.mode.expanded=void 0},$scope.updateBellyTable=function(region,log){$scope.mode&&$scope.mode.belly&&log===$scope.mode.belly.log?$scope.mode.belly=null:$scope.mode.belly={region:region,log:log}},$scope.getBellyTableTitle=function(){return $scope.mode.belly?$scope.mode.belly.region+": "+$scope.mode.belly.log.content+" 错误原因":"API: "+$scope.mode.log.content+" 错误原因"},$scope.showAPICall=function(mindate,maxdate){return $scope.ajax("api_call",{search_begin:ROPDateUtil.freeFormatDate(mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate(maxdate,"yyyy-MM-dd")},function(data){return data.log_list})},$scope.showAppCall=function(mindate,maxdate){return $scope.ajax("app_call",{search_begin:ROPDateUtil.freeFormatDate(mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate(maxdate,"yyyy-MM-dd")},function(data){return data.log_list})},$scope.showDayCall=function(mindate,maxdate){return $scope.ajax("log_get",{search_type:3,search_begin:ROPDateUtil.freeFormatDate(mindate,"yyyy-MM-dd"),search_end:ROPDateUtil.freeFormatDate(maxdate,"yyyy-MM-dd")},function(data){return data.log_list})},$scope.showCountCall=function(){return $scope.ajax("count_call",{},function(data){return data.log_list})};var updateGraphicLineChartConfig=function(log_list){var lineChartConfigClone={type:"line",data:{labels:[],datasets:[{label:"API调用总量",data:[],borderWidth:2,borderColor:"#00C5A3",backgroundColor:"rgba(0,197,163,0.1)",fill:!0,lineTension:.1,pointRadius:3,pointHoverRadius:4,pointBorderColor:"#fff",pointHoverBorderWidth:1,pointBorderWidth:1,pointBackgroundColor:"#00C5A3",pointHitRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,showLines:!0,title:{display:!0,text:"API调用数量",padding:16,fontFamily:'"lanting","Helvetica Neue","Microsoft YaHei"'},legend:{display:!1},tooltips:{mode:"label",callbacks:{}},hover:{mode:"single"},scales:{xAxes:[{id:"x-axis-0",gridLines:{display:!0,lineWidth:1,zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"},ticks:{autoSkip:!1,beginAtZero:!1,callback:function(label,index){return index%Math.ceil(log_list.length/12)==0?label:null}}}],yAxes:[{id:"y-axis-0",display:!0,ticks:{maxTicksLimit:10},gridLines:{display:!0,lineWidth:1,zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"}}]}}},labels=[],data=[];return log_list.forEach(function(r){labels.push(r.calldate),data.push(secureNumber(r.all_count))}),1==log_list.length&&(labels.push(""),data.push(null),labels.splice(0,0,""),data.splice(0,0,null)),lineChartConfigClone.data.labels=labels,lineChartConfigClone.data.datasets[0].data=data,lineChartConfigClone},apiCallDialogMaxdate=ROPDateUtil.incrementDays($scope.now,-1),apiCallDialogMindate=ROPDateUtil.incrementDays(apiCallDialogMaxdate,-30),APICallDialogController=function(scope,$mdDialog){scope.mindate=apiCallDialogMindate,scope.maxdate=apiCallDialogMaxdate,scope.mode=1,scope.log_list=[];var logSlicer=function(log_list){var trunk=log_list;if(2==scope.mode){var maxDayIndex=scope.maxdate.getDay(),firstDayOfTheMaxDateWeek=ROPDateUtil.incrementDays(scope.maxdate,1-(maxDayIndex||7)),minDayIndex=scope.mindate.getDay(),firstDayOfTheMinDateWeek=ROPDateUtil.incrementDays(scope.mindate,1-(minDayIndex||7)),lastDayOfTheMinDateWeek=ROPDateUtil.incrementDays(firstDayOfTheMinDateWeek,6),front={all_count:0,calldate:ROPDateUtil.freeFormatDate(scope.mindate,"yyyy-MM-dd")},rear={all_count:0,calldate:ROPDateUtil.freeFormatDate(scope.maxdate,"yyyy-MM-dd")};trunk=[front],log_list.forEach(function(r,i){var targetDate=ROPDateUtil.createDateAtMidnight(r.calldate);if(scope.mindate<=targetDate&&targetDate<=lastDayOfTheMinDateWeek)front.all_count+=secureNumber(r.all_count);else if(scope.maxdate>=targetDate&&targetDate>=firstDayOfTheMaxDateWeek)rear.all_count+=secureNumber(r.all_count);else{var dayIndex=targetDate.getDay(),firstDayOfTheWeek=ROPDateUtil.incrementDays(targetDate,1-(dayIndex||7)),lastDayOfTheWeek=ROPDateUtil.incrementDays(firstDayOfTheWeek,6),stackedDate=ROPDateUtil.createDateAtMidnight(trunk[trunk.length-1].calldate);firstDayOfTheWeek<=stackedDate&&stackedDate<=lastDayOfTheWeek?trunk[trunk.length-1].all_count+=secureNumber(r.all_count):trunk.push({all_count:secureNumber(r.all_count),calldate:r.calldate})}}),firstDayOfTheMinDateWeek.getTime()!=firstDayOfTheMaxDateWeek.getTime()&&trunk.push(rear)}else if(3==scope.mode){var firstDateOfTheMaxDateMonth=ROPDateUtil.getFirstDateOfMonth(scope.maxdate),lastDayOfTheMinDateMonth=ROPDateUtil.getLastDateOfMonth(scope.mindate),front={all_count:0,calldate:ROPDateUtil.freeFormatDate(scope.mindate,"yyyy-MM")},rear={all_count:0,calldate:ROPDateUtil.freeFormatDate(scope.maxdate,"yyyy-MM")};trunk=[front],log_list.forEach(function(r,i){var targetDate=ROPDateUtil.createDateAtMidnight(r.calldate);if(scope.mindate<=targetDate&&targetDate<=lastDayOfTheMinDateMonth)front.all_count+=secureNumber(r.all_count);else if(scope.maxdate>=targetDate&&targetDate>=firstDateOfTheMaxDateMonth)rear.all_count+=secureNumber(r.all_count);else{var firstDayOfTheMonth=ROPDateUtil.getFirstDateOfMonth(targetDate),lastDayOfTheMonth=ROPDateUtil.getLastDateOfMonth(targetDate),stackedDate=ROPDateUtil.createDateAtMidnight(trunk[trunk.length-1].calldate);firstDayOfTheMonth<=stackedDate&&stackedDate<=lastDayOfTheMonth?trunk[trunk.length-1].all_count+=secureNumber(r.all_count):trunk.push({all_count:secureNumber(r.all_count),calldate:ROPDateUtil.freeFormatDate(targetDate,"yyyy-MM")})}}),!ROPDateUtil.isSameMonthAndYear(firstDateOfTheMaxDateMonth,lastDayOfTheMinDateMonth)&&trunk.push(rear)}scope.barChart&&scope.barChart.destroy();var ctx=document.querySelector("#api-call").getContext("2d");return scope.barChart=new Chart(ctx,updateGraphicLineChartConfig(trunk)),trunk};scope.showAPICall=function(){$scope.showAPICall(scope.mindate,scope.maxdate).then(function(log_list){return scope.log_list=log_list,logSlicer(log_list)})},scope.selectMode=function(mode){return scope.mode=mode,logSlicer(scope.log_list)},scope.closeDialog=function(){$mdDialog.hide()},scope.showAPICall()},showAPICallDialog=function(ev){$rootScope.defer();$mdDialog.show({controller:APICallDialogController,parent:angular.element("#partials>md-content"),template:'\n                            <div class="head cap">\n                                <div class="left">\n                                    <h5 class="api">API调用统计</h5>\n                                    <rop-date-range-picker ng-model="searchdate" min-date="mindate" max-date="maxdate" callback="showAPICall" placeholder="请输入日期" class="md-primary" ></rop-date-range-picker>\n                                </div>\n                                <div class="right">\n                                    <md-button class="md-raised text shrink-button" ng-class="{\'fill\':(mode == 3),\'line\':(mode != 3)}" aria-label="data control" ng-click="selectMode(3)">\n                                        <span>按月统计</span>\n                                    </md-button>\n                                    <md-button class="md-raised text shrink-button" ng-class="{\'fill\':(mode == 2),\'line\':(mode != 2)}" aria-label="data control" ng-click="selectMode(2)">\n                                        <span>按周统计</span>\n                                    </md-button>\n                                    <md-button class="md-raised text shrink-button" ng-class="{\'fill\':(mode == 1),\'line\':(mode != 1)}" aria-label="data control" ng-click="selectMode(1)">\n                                        <span>按天统计</span>\n                                    </md-button>\n                                    <md-button class="md-raised text line" aria-label="data control" ng-click="closeDialog()">\n                                        <span>关闭</span>\n                                    </md-button>\n                                </div>\n                            </div>\n\n                            <div class="line-canvas">\n                                <canvas width="100%" id="api-call"></canvas>\n                            </div>\n                        ',fullscreen:!0,targetEvent:ev,openFrom:ev.target,clickOutsideToClose:!0})};$scope.showAPICall(apiCallDialogMaxdate,apiCallDialogMaxdate).then(function(log_list){$scope.summary.apiCalls=0,log_list.forEach(function(r){try{$scope.summary.apiCalls+=Number.parseInt(r.all_count)}catch(e){}}),$scope.showAPICallDialog=showAPICallDialog});var updateGraphicBarChartConfig=function(log_list){var barChartConfigClone={type:"bar",data:{labels:["114.132.134.13"],datasets:[{type:"bar",label:"调用次数",backgroundColor:"rgba(0,197,163,0.4)",hoverBackgroundColor:"#00C5A3",data:[],yAxisID:"y-axis-0"},{type:"bar",label:"成功次数",backgroundColor:"rgba(0,145,120,0.4)",hoverBackgroundColor:"#009178",data:[],yAxisID:"y-axis-0"},{type:"line",label:"占比",data:[],borderWidth:2,borderColor:"#00C5A3",backgroundColor:"rgba(255,255,255,0.2)",fill:!0,lineTension:.1,pointRadius:3,pointHoverRadius:4,pointBorderColor:"#fff",pointHoverBorderWidth:1,pointBorderWidth:1,pointBackgroundColor:"#009178",pointHitRadius:3.5,yAxisID:"y-axis-1"}]},options:{responsive:!0,maintainAspectRatio:!1,legend:{display:!1},title:{display:!0,text:"开发者应用调用数统计",fontSize:14,padding:16,fontFamily:'"lanting","Helvetica Neue","Microsoft YaHei"'},elements:{rectangle:{borderWidth:1.5,borderColor:"#009178",borderSkipped:"bottom"}},hover:{mode:"single",animationDuration:400},animation:{duration:400,easing:"easeOutQuart"},scales:{yAxes:[{id:"y-axis-0",ticks:{beginAtZero:!0,maxTicksLimit:5}},{id:"y-axis-1",display:!0,position:"right",ticks:{maxTicksLimit:5,beginAtZero:!0,callback:function(label,index){return Math.round(10*label)/10+"%"}},gridLines:{display:!0,lineWidth:1,color:"rgba(255,255,255,0.3)",zeroLineWidth:1}}],xAxes:[{ticks:{beginAtZero:!0},gridLines:{}}]}}},labels=[],data=[[],[],[]],appTotal=0;return log_list.sort(appcallSorter).forEach(function(r){var callcount=secureNumber(r.all_count);appTotal+=callcount,labels.push(r.app_name),data[0].push(callcount),data[1].push(secureNumber(r.true_count));var percent=0;data[0].forEach(function(r1,i1){percent+=r1}),data[2].push(percent)}),barChartConfigClone.data.labels=labels,barChartConfigClone.data.datasets[0].data=data[0],barChartConfigClone.data.datasets[1].data=data[1],barChartConfigClone.data.datasets[2].data=data[2].map(function(r){return Math.floor(1e4*r/appTotal)/100}),barChartConfigClone},appCallDialogMindate=new Date($scope.now.getFullYear(),$scope.now.getMonth(),1),appCallDialogMaxdate=new Date,AppCallDialogController=function(scope,$mdDialog){scope.mindate=appCallDialogMindate,scope.maxdate=appCallDialogMaxdate,scope.showAppCall=function(){$scope.showAppCall(scope.mindate,scope.maxdate).then(function(log_list){scope.log_list=log_list,scope.barChart&&scope.barChart.destroy();var ctx=document.querySelector("#app-call").getContext("2d");return scope.barChart=new Chart(ctx,updateGraphicBarChartConfig(log_list)),log_list})},scope.closeDialog=function(){$mdDialog.hide()},scope.showAppCall()},showAppCallDialog=function(ev){$mdDialog.show({controller:AppCallDialogController,parent:angular.element("#partials>md-content"),template:'\n                            <div class="head cap">\n                                <div class="left">\n                                    <h5 class="api">开发者应用调用统计</h5>\n                                    <rop-date-range-picker ng-model="searchdate" min-date="mindate" max-date="maxdate" callback="showAppCall" placeholder="请输入日期" class="md-primary" ></rop-date-range-picker>\n                                </div>\n                                <div class="right">\n                                    <md-button class="md-raised text line" aria-label="data control" ng-click="closeDialog()">\n                                        <span>关闭</span>\n                                    </md-button>\n                                </div>\n                            </div>\n\n                            <div class="line-canvas">\n                                <canvas width="100%" id="app-call"></canvas>\n                            </div>\n                        ',fullscreen:!0,targetEvent:ev,openFrom:ev.target,clickOutsideToClose:!0})};$scope.showAppCall(appCallDialogMindate,appCallDialogMaxdate).then(function(log_list){$scope.summary.appCalls=log_list.sort(appcallSorter).slice(0,3),$scope.showAppCallDialog=showAppCallDialog});var updateGraphicRealtimeChartConfig=function(log_list){var lineChartConfigClone={type:"line",data:{labels:["7:00"],datasets:[{label:"实时调用量",data:[5],borderWidth:2,borderColor:"#00C5A3",backgroundColor:"rgba(0,197,163,0.1)",fill:!0,lineTension:.1,pointRadius:3,pointHoverRadius:4,pointBorderColor:"#fff",pointHoverBorderWidth:1,pointBorderWidth:1,pointBackgroundColor:"#00C5A3",pointHitRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,showLines:!0,title:{display:!0,text:"实时API调用统计",padding:16},legend:{display:!1},tooltips:{mode:"label",callbacks:{}},hover:{mode:"single"},scales:{xAxes:[{id:"x-axis-0",gridLines:{display:!0,lineWidth:1,zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"},ticks:{beginAtZero:!1}}],yAxes:[{id:"y-axis-0",display:!0,ticks:{maxTicksLimit:10},gridLines:{display:!0,lineWidth:1,zeroLineWidth:0,zeroLineColor:"rgba(255,255,255,0)"}}]}}},labels=[],data=[];return log_list.sort(daycallSorter).forEach(function(r){labels.push(r.content?r.content.replace(/.*\s(.*)/,"$1:00"):"00:00"),data.push(secureNumber(r.callcount))}),lineChartConfigClone.data.labels=labels,lineChartConfigClone.data.datasets[0].data=data,lineChartConfigClone},dayCallDialogMindate=new Date,DayCallDialogController=(new Date,function(scope,$mdDialog){scope.searchdate=dayCallDialogMindate,scope.maxdate=new Date,scope.showDayCall=function(){$scope.showDayCall(scope.searchdate,scope.searchdate).then(function(log_list){scope.log_list=log_list,scope.barChart&&scope.barChart.destroy();var ctx=document.querySelector("#day-call").getContext("2d");return scope.barChart=new Chart(ctx,updateGraphicRealtimeChartConfig(log_list)),log_list})},scope.closeDialog=function(){$mdDialog.hide()},scope.showDayCall()}),showDayCallDialog=function(ev){$mdDialog.show({controller:DayCallDialogController,parent:angular.element("#partials>md-content"),template:'\n                            <div class="head cap">\n                                <div class="left">\n                                    <h5 class="api">实时API调用统计</h5>\n                                    <rop-date-picker ng-model="searchdate" callback="showDayCall" max-date="maxdate" placeholder="请输入日期" class="md-primary" ></rop-date-picker>\n                                </div>\n                                <div class="right">\n                                    <md-button class="md-raised text line" aria-label="data control" ng-click="closeDialog()">\n                                        <span>关闭</span>\n                                    </md-button>\n                                </div>\n                            </div>\n\n                            <div class="line-canvas">\n                                <canvas width="100%" id="day-call"></canvas>\n                            </div>\n                        ',fullscreen:!0,targetEvent:ev,openFrom:ev.target,clickOutsideToClose:!0})};$scope.showDayCall($scope.now,$scope.now).then(function(log_list){var apiCalls=0;log_list&&log_list.length&&log_list.forEach(function(r){apiCalls+=secureNumber(r.callcount)}),$scope.summary.dayCalls=apiCalls,$scope.showDayCallDialog=showDayCallDialog}),$scope.showCountCall().then(function(data){$scope.summary.countCalls=data.api_count}),$scope.sortBy=function(propertyName,reverse){$scope.reverse=void 0!==reverse?reverse:$scope.propertyName===propertyName&&!$scope.reverse,$scope.propertyName=propertyName,$scope.log_list.sort(function(a,b){var nameA="",nameB="";if(void 0===a[$scope.propertyName]||void 0===b[$scope.propertyName])return 0;if("content"===propertyName&&1===$scope.mode.id)nameA=a[$scope.propertyName].toUpperCase(),nameB=b[$scope.propertyName].toUpperCase();else if("content"===propertyName&&2===$scope.mode.id){nameA=a[$scope.propertyName],nameB=b[$scope.propertyName];var arrA=nameA.split("."),arrB=nameB.split(".");if(nameA===nameB||4!=arrA.length||4!=arrB.length)return 0;for(var i=0;i<4;i++){if(Number.parseInt(arrA[i])<Number.parseInt(arrB[i]))return $scope.reverse?-1:1;if(Number.parseInt(arrA[i])>Number.parseInt(arrB[i]))return $scope.reverse?1:-1}}else if("content"===propertyName&&3===$scope.mode.id){var strA=a[$scope.propertyName].toUpperCase(),strB=b[$scope.propertyName].toUpperCase();nameA=Number.parseFloat(strA.slice(-2,strA.length)),nameB=Number.parseFloat(strB.slice(-2,strB.length))}else Number.isNaN(Number.parseFloat(a[$scope.propertyName]))||(nameA=Number.parseFloat(a[$scope.propertyName]),nameB=Number.parseFloat(b[$scope.propertyName]));return nameA<nameB?$scope.reverse?-1:1:nameA>nameB?$scope.reverse?1:-1:0})},window.test=$scope;var globalBack=function(){$scope.lock||$scope.exitDetail()};$scope.$on("$destroy",function(event){$scope.barChart&&$scope.barChart.destroy(),$scope.lineChart&&$scope.lineChart.destroy(),$scope.lineChart1&&$scope.lineChart1.destroy(),$rootScope.globalBack=null})}]});