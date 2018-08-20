/**
 * Check out https://googlechrome.github.io/sw-toolbox/docs/master/index.html for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */


'use strict';
importScripts('/sw-toolbox');

self.toolbox.options.cache = {
  name: 'rop-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    '/vendor/jquery/dist/jquery.min.js',
    '/vendor/angular/angular.min.js',
    '/vendor/angular-cookies/angular-cookies.js',
    '/vendor/angular-messages/angular-messages.js',
    '/vendor/angular-ui-router/release/angular-ui-router.min.js',
    '/vendor/angular-animate/angular-animate.js',
    '/vendor/angular-aria/angular-aria.js',
    '/vendor/oclazyload/dist/ocLazyLoad.require.js',
    '/vendor/angular-material/angular-material.min.js',
    '/vendor/Snap.svg/dist/snap.svg-min.js',
    '/vendor/bootstrap/dist/js/bootstrap.min.js',
    '/vendor/Swiper/dist/js/swiper.min.js',
    '/vendor/requirejs/require.js',

    '/vendor/font-awesome/css/font-awesome.min.css',
    '/vendor/bootstrap/dist/css/bootstrap.min.css',
    '/vendor/font-awesome-animation/dist/font-awesome-animation.min.css',
    '/vendor/angular-material/angular-material.min.css',
    '/vendor/Swiper/dist/css/swiper.min.css',
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.cacheFirst);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;
