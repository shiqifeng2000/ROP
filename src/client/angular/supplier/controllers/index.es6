/**
 * Created by robin on 22/11/2016.
 */
define(['swiper', '../../services'], function (Swiper, Holder) {
  'use strict'
  return ['$rootScope', '$scope', '$http', '$timeout', '$q',
    ($rootScope, $scope, $http, $timeout, $q) => {
      $('a[href^="#"]', '#partials').click(e => {e.preventDefault()})
      $('.transitionEndBubbleStop').off('transitionend')
      $('.transitionEndBubbleStop').bind('transitionend', e => {e.stopPropagation()})

      $rootScope.preloadComplete.finally(() => {
        $scope.nextTick(() => {
          $scope.calcFeatureColspan = () => ($scope.user_info && $scope.user_info.feature_model_flag == '1') && ($scope.user_info.user_feature && $scope.user_info.user_feature.length) ? Math.round(60 / $scope.user_info.user_feature.length) : 1
          $scope.bannerSwiper = new window.Swiper('#banner', {
            pagination: '.swiper-pagination',
            autoplay: 6000,
            speed: 800,
            slidesPerView: 1,
            paginationClickable: true,
            spaceBetween: 0,
            keyboardControl: true,
            preloadImages: false,
            lazyLoading: true
          })
          $scope.isvSwiper = new window.Swiper('#isv', {
            autoplay: 1000,
            speed: 800,
            slidesPerView: $scope.user_info && $scope.user_info.isv_list && $scope.user_info.isv_list.length && ($scope.user_info.isv_list.length < 4) ? $scope.user_info.isv_list.length : 4,
            spaceBetween: 16
          })
          $scope.removeLoading()
        })
      })

      window.test = $scope
    }]
})
