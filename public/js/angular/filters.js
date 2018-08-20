"use strict";angular.module("rop.filters",[]).filter("escapeHtml",function(){var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return function(str){return String(str).replace(/[&<>"'\/]/g,function(s){return entityMap[s]})}}).filter("unescapeHtml",function(){var entityMap={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#x2F;":"/"};return function(str,type){if(str){var rawStr=String(str).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;)/g,function(s){return entityMap[s]});if(str&&"undefined"!=str){if("json"==type)return JSON.stringify(JSON.parse(rawStr),null,2);if("xml"==type)return formatXml(rawStr)}return rawStr}}}).filter("ellipsis",["$filter",function($filter){return function(){var result=$filter("limitTo").apply(this,arguments);return result+"......"}}]).filter("trusthtml",["$sce",function($sce){return function(t){return $sce.trustAsHtml(t)}}]).filter("parseYear",function(){return function(str,type){var year=str;try{year=new Date(str).getFullYear()}catch(e){}return year}}).filter("parseMonth",function(){return function(str,type){var month=str;try{month=new Date(str).getMonth()+1}catch(e){}return month}}).filter("parseDate",function(){return function(str,type){var date=str;try{date=new Date(str).getDate(),date<10&&(date="0"+date)}catch(e){}return date}}).filter("hiddenSecret",function(){return function(str){var myStr=String(str),tripleLength=Math.floor(myStr.length/5);return myStr.replace(/./g,function(match,i){return i>tripleLength&&i<myStr.length-tripleLength?"*":match})}});