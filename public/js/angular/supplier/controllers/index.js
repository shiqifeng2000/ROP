"use strict";define(["swiper","../../services"],function(Swiper,Holder){return["$rootScope","$scope","$http","$timeout","$q",function($rootScope,$scope,$http,$timeout,$q){$('a[href^="#"]',"#partials").click(function(e){e.preventDefault()}),$(".transitionEndBubbleStop").off("transitionend"),$(".transitionEndBubbleStop").bind("transitionend",function(e){e.stopPropagation()}),$rootScope.preloadComplete["finally"](function(){$scope.nextTick(function(){$scope.calcFeatureColspan=function(){return $scope.user_info&&"1"==$scope.user_info.feature_model_flag&&$scope.user_info.user_feature&&$scope.user_info.user_feature.length?Math.round(60/$scope.user_info.user_feature.length):1},$scope.bannerSwiper=new window.Swiper("#banner",{pagination:".swiper-pagination",autoplay:6e3,speed:800,slidesPerView:1,paginationClickable:!0,spaceBetween:0,keyboardControl:!0,preloadImages:!1,lazyLoading:!0}),$scope.isvSwiper=new window.Swiper("#isv",{autoplay:1e3,speed:800,slidesPerView:$scope.user_info&&$scope.user_info.isv_list&&$scope.user_info.isv_list.length&&$scope.user_info.isv_list.length<4?$scope.user_info.isv_list.length:4,spaceBetween:16}),$scope.removeLoading()})}),window.test=$scope}]});