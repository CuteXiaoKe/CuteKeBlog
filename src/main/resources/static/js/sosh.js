(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("sosh", [], factory);
	else if(typeof exports === 'object')
		exports["sosh"] = factory();
	else
		root["sosh"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Shim For Webpack Addstyle
	if(!Function.prototype.bind){
	  Function.prototype.bind = function(){
	    var fn = this,
	    args = [].slice.call(arguments),
	    object = args.shift();
	    return function(){
	      return fn.apply(object,args.concat([].slice.call(arguments)));
	    }
	  }
	}

	if (!Array.prototype.filter){
	  Array.prototype.filter = function(fun /*, thisp*/){
	    var len = this.length;
	    if (typeof fun != "function") throw new TypeError();
	    var res = new Array();
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++){
	      if (i in this){
	        var val = this[i]; // in case fun mutates this
	        if (fun.call(thisp, val, i, this)) res.push(val);
	      }
	    }
	    return res;
	  }
	}

	__webpack_require__(5);
	var extend = __webpack_require__(14);
	var classlist = __webpack_require__(3);
	var QRCode = __webpack_require__(15);
	var sitesObj = __webpack_require__(16);

	var doc = document;
	var body = doc.body;
	var docElem = doc.documentElement;
	var datasetRegexp = /^data\-(.+)$/i;
	var templateStr =
	  '<div class="sosh-item {{site}}" data-site="{{site}}" title="分享到{{name}}">' +
	    '<span class="sosh-item-icon">' +
	      '<img src="{{icon}}" alt="{{name}}">' +
	    '</span>' +
	    '<span class="sosh-item-text">{{name}}</span>' +
	  '</div>';

	// Sosh Default Configs
	var metaDesc = doc.getElementsByName('description')[0];
	var firstImg = doc.getElementsByTagName('img')[0];
	var defaults = {
	  'title': doc.title,
	  'url': location.href,
	  'digest': metaDesc && metaDesc.content || '',
	  'pic': firstImg && firstImg.src || '',
	  'sites': ['weixin', 'weibo', 'yixin', 'qzone']
	};

	var pop = doc.createElement('div');
	pop.className = 'sosh-pop';
	pop.innerHTML =
	  '<div class="sosh-qrcode-pic"></div>' +
	  '<div class="sosh-qrcode-text">用微信扫描二维码<br>分享至好友和朋友圈</div>' +
	  '<a href="javascript:;" target="_self" class="sosh-pop-close">&#10799;</a>';

	body.appendChild(pop);

	var qrcodePic = $('.sosh-qrcode-pic')[0];
	var qrcodeClose = $('.sosh-pop-close')[0];

	// 初始化二维码
	var qrcode = new QRCode(qrcodePic, {
	  text: location.href,
	  width: 120,
	  height: 120
	});

	// 二维码扫码弹窗添加关闭事件
	addEvent(qrcodeClose, 'click', function() {
	  classlist(pop).remove('sosh-pop-show');
	});

	var sosh = function(selector, opts) {
	  if (typeof selector === 'string') {
	    var elems = $(selector);
	    for(var i = 0, length = elems.length; i < length; i++) {
	      var elem = elems[i];
	      var status = elem.getAttribute('sosh-status');

	      if (status !== 'initialized') {
	        var config = extend(defaults, opts, parseDataset(elem));

	        elem.innerHTML = getSitesHtml(config.sites);

	        handlerClick(elem, config);

	        elem.setAttribute('sosh-status', 'initialized');

	        classlist(elem).add('sosh');
	      }
	    }
	  }
	}

	/**
	 * 分享按钮点击事件处理函数
	 * @param  {Element} agent    [初始化分享组件元素]
	 * @param  {Object} shareData [分享的数据]
	 */
	function handlerClick(agent, shareData) {
	  delegate(agent, 'sosh-item', 'click', function() {
	    var api = sitesObj[this.getAttribute('data-site')].api;
	    if (api) {
	      for(var k in shareData) {
	        api = api.replace(new RegExp('{{' + k + '}}', 'g'), encodeURIComponent(shareData[k]));
	      }
	      window.open(api, '_blank');
	    } else {
	      // 微信弹出二维码扫码气泡
	      if(classlist(this).contains('weixin')) {
	        var offset = getOffsetRect(this);
	        pop.style.top = offset.top + this.offsetHeight + 10 + 'px';
	        pop.style.left = offset.left + 'px';
	        classlist(pop).add('sosh-pop-show');

	        // 重新渲染二维码
	        qrcode.clear();
	        qrcode.makeCode(shareData.url);
	      }
	    }
	  });
	}

	/**
	 * 简易选择器
	 * @param  {String} selector [ID或者单个类名选择器]
	 * @return {Array}          [元素数组]
	 */
	function $(selector) {
	  var str = selector.substr(1);

	  if (selector.indexOf('#') === 0) {
	    var elem = doc.getElementById(str);
	    return elem ? [elem] : [];
	  }

	  return getElementsByClassName(str);
	}

	/**
	 * 通过选择器的classname获取元素数组
	 * @param  {String} classname [类名]
	 * @return {Array}            [元素数组]
	 */
	function getElementsByClassName(classname) {
	  var elements;
	  var pattern;
	  var i;
	  var results = [];

	  if (doc.querySelectorAll) { // IE8
	    return doc.querySelectorAll('.' + classname);
	  }

	  if (doc.evaluate) { // IE6, IE7
	    pattern = './/*[contains(concat(" ", @class, " "), " " + classname + " ")]';
	    elements = doc.evaluate(pattern, d, null, 0, null);
	    while ((i = elements.iterateNext())) {
	      results.push(i);
	    }
	  } else {
	    elements = doc.getElementsByTagName('*');
	    pattern = new RegExp('(^|\\s)' + classname + '(\\s|$)');
	    for (var i = 0, length = elements.length; i < length; i++) {
	      if (pattern.test(elements[i].className)) {
	        results.push(elements[i]);
	      }
	    }
	  }

	  return results;
	}

	/**
	 * 解析元素的[data-*]属性成hashmap对象
	 * @param  {Element} elem [html元素]
	 * @return {Object}
	 */
	function parseDataset(elem) {
	  var dataset = {};
	  var attrs = elem.attributes;
	  for (var i = 0, length = attrs.length; i < length; i++){
	    var attr = attrs[i];
	    var attrName = attr.nodeName;

	    if(datasetRegexp.test(attrName)) {
	      dataset[attrName.replace(datasetRegexp, '$1')] = attr.nodeValue;
	    }

	    if(attrName === 'data-sites') {
	      dataset['sites'] = attr.nodeValue.split(',');
	    }
	  }
	  return dataset;
	}

	/**
	 * 转换sites对象配置为html字符串
	 * @param  {Object} sites [分享站点配置]
	 * @return {string}       [html字符串]
	 */
	function getSitesHtml(sites) {
	  var html = '';
	  for(var i = 0, length = sites.length; i < length; i++) {
	    var key = sites[i];
	    var siteObj = sitesObj[key];
	    if (siteObj) {
	      html += templateStr
	        .replace(/\{\{site\}\}/g, key)
	        .replace(/\{\{icon\}\}/g, siteObj.icon)
	        .replace(/\{\{name\}\}/g, siteObj.name);
	    } else {
	      console.warn('site [' + key + '] not exist.');
	    }
	  }
	  return html;
	}

	/**
	 * 事件绑定
	 * @param {Element}   elem [html元素]
	 * @param {String}   event [事件名称]
	 * @param {Function} fn    [事件处理函数]
	 */
	function addEvent(elem, event, fn) {
	  if (elem.addEventListener) {
	    return elem.addEventListener(event, fn, false);
	  } else {
	    return elem.attachEvent('on'+event, function(){fn.call(elem)});
	  }
	}

	/**
	 * 事件委托
	 * @param  {Element}   agent    [被委托的html元素]
	 * @param  {String}   classname [类名]
	 * @param  {String}   event     [事件名称]
	 * @param  {Function} fn        [事件处理函数]
	 */
	function delegate(agent, classname, event, fn) {
	  addEvent(agent, event, function(e) {
	    e = e || window.event;
	    var target = e.target || e.srcElement;
	    while (target && target !== this) {
	      if (classlist(target).contains(classname)) {
	        typeof fn === 'function' && fn.call(target, e);
	        return;
	      }
	      target = target.parentNode;
	    }
	  });
	}

	/**
	 * 获取html元素的左上角位置数值
	 * @param  {Element} elem [html元素]
	 * @return {Object}      [带有top和left属性的对象]
	 */
	function getOffsetRect(elem) {
	  var box = elem.getBoundingClientRect()

	  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

	  var clientTop = docElem.clientTop || body.clientTop || 0;
	  var clientLeft = docElem.clientLeft || body.clientLeft || 0;

	  var top  = box.top +  scrollTop - clientTop;
	  var left = box.left + scrollLeft - clientLeft;

	  return {
	    top: Math.round(top),
	    left: Math.round(left)
	  };
	}

	module.exports = sosh;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(2)();
	// imports


	// module
	exports.push([module.id, ".sosh{*zoom:1;text-align:center}.sosh:after,.sosh:before{content:\" \";display:table}.sosh:after{clear:both}.sosh-item{float:left;margin:0 2px;cursor:pointer}.sosh-item-icon{display:inline-block;*display:inline;*zoom:1;box-sizing:content-box;width:20px;height:20px;padding:5px;margin:0;vertical-align:middle;border-radius:50%}.sosh-item-icon img{vertical-align:top;height:100%;width:100%;margin:0;padding:0}.sosh-item-text{display:none;font-size:14px;color:#666}.sosh-item.weixin .sosh-item-icon{background:#49b233}.sosh-item.weixin:hover .sosh-item-icon{background:#398a28}.sosh-item.yixin .sosh-item-icon{background:#23cfaf}.sosh-item.yixin:hover .sosh-item-icon{background:#1ca38a}.sosh-item.weibo .sosh-item-icon{background:#f04e59}.sosh-item.weibo:hover .sosh-item-icon{background:#ec1f2d}.sosh-item.qzone .sosh-item-icon{background:#fdbe3d}.sosh-item.qzone:hover .sosh-item-icon{background:#fcad0b}.sosh-item.renren .sosh-item-icon{background:#1f7fc9}.sosh-item.renren:hover .sosh-item-icon{background:#18639d}.sosh-item.tieba .sosh-item-icon{background:#5b95f0}.sosh-item.tieba:hover .sosh-item-icon{background:#2c77ec}.sosh-item.douban .sosh-item-icon{background:#228a31}.sosh-item.douban:hover .sosh-item-icon{background:#186122}.sosh-item.tqq .sosh-item-icon{background:#97cbe1}.sosh-item.tqq:hover .sosh-item-icon{background:#6fb7d6}.sosh-item.qq .sosh-item-icon{background:#4081e1}.sosh-item.qq:hover .sosh-item-icon{background:#2066ce}.sosh-item.weixintimeline .sosh-item-icon{background:#1cb526}.sosh-item.weixintimeline:hover .sosh-item-icon{background:#15891d}.sosh-pop{display:none;position:absolute;padding:20px;background:#fff;border:1px solid #eee;box-shadow:0 0 8px #cdcdcd;z-index:999}.sosh-pop-show{display:block}.sosh-pop-close{color:#bbb;position:absolute;width:10px;height:10px;line-height:6px;right:10px;top:10px;font-size:20px;font-weight:400;font-family:monospace;text-decoration:none}.sosh-pop-close:hover{text-decoration:none;color:#666}.sosh-qrcode-pic{width:120px;height:120px;overflow:hidden;float:left}.sosh-qrcode-pic img{height:100%;width:100%;margin:0;padding:0;border:0;vertical-align:top}.sosh-qrcode-text{color:#666;float:left;font-size:14px;line-height:30px;margin-left:20px}", ""]);

	// exports


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module === 'object' && module.exports) {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.classList = factory();
	  }
	}(this, function () {

	  function ClassList(elem) {
	    if (!elem || elem.nodeType !== 1) {
	      throw new Error('A DOM Element reference is required');
	    }
	    this.elem = elem;
	    return this;
	  }

	  function trim(str) {
	    if (typeof str !== 'string') return str;
	    return str.replace(/(^\s+|\s+$)/g, '');
	  }

	  ClassList.prototype = {
	    constructor: ClassList,
	    /**
	     * Add specified class values. If these classes already exist in
	     * attribute of the element, then they are ignored.
	     *
	     * @parame {[String]} ...
	     * @return {[Context]}
	     * @example add( String [, String] )
	     */
	    add: function() {
	      for(var i=0, len=arguments.length; i<len; i++) {
	        var className = trim(arguments[i] + '');
	        if (!this.contains(className)) {
	          this.elem.className += (this.elem.className === '' ? '' : ' ') + className;
	        }
	      }
	      return this;
	    },
	    /**
	     * Remove specified class values.
	     *
	     * @parame {[String]} ...
	     * @return {[Context]}
	     * @example remove( String [, String] )
	     */
	    remove: function() {
	      var newClass = ' ' + this.elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
	      for (var i=0, len=arguments.length; i<len; i++) {
	        var className = trim(arguments[i] + '');
	        if (this.contains(className)) {
	          while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
	            newClass = newClass.replace(' ' + className + ' ', ' ');
	          }
	          this.elem.className = trim(newClass);
	        }
	      }
	      return this;
	    },
	    /**
	     * When only one argument is present: Toggle class value;
	     * i.e., if class exists then remove it, if not, then add it.
	     *
	     * When a second argument is present: If the second argument is true,
	     * add specified class value, and if it is false, remove it.
	     *
	     * @param  {[String]} str
	     * @param  {[Boolean]} force
	     * @return {[Context]}
	     */
	    toggle: function(str, force) {
	      str += '';
	      if (force === true) return this.add(str);
	      if (force === false) return this.remove(str);

	      return this[this.contains(str) ? 'remove' : 'add'](str);
	    },
	    /**
	     * Checks if specified class value exists in class attribute of the element.
	     *
	     * @param  {[String]} specified class value
	     * @return {[Boolean]}
	     */
	    contains: function(str) {
	      return new RegExp(' ' + trim(str) + ' ').test(' ' + this.elem.className + ' ');
	    }
	  }

	  // Just return a value to define the module export.
	  // This example returns an object, but the module
	  // can return a function as the exported value.
	  return function(elem) {
	    return new ClassList(elem);
	  };
	}));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(1);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js!./index.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/postcss-loader/index.js!./../../node_modules/sass-loader/index.js!./index.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAIPDgv0BegH/AoDCPzxBvsNFNiOYAAAC3SURBVHhe7dbNCoQwDATgabttV+tf3v9lF+rJRJr2sojkO0oYBg1BPIhx3zEJTKQxE04WIJnBLZSoz/T6AD81KAH6kv4twAIswH8a1AC7B7lPwvulzwJp80tBh7J4IooQdiIKu4PmPLwrhND5X1CoSmASVRGqXAcDmKOzALCFuwqOFWiJdxVm/lB/j0kpoFZYZYEDDXK8iAIOTXx+5om5ub0Xnh1HqtbLTGEff1h8W0DMwxwew/wAniVLWfHYFrQAAAAASUVORK5CYII="

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEVHcEz///////////////////////////////////////////////////////////////////////////////9KjZoYAAAAFHRSTlMAYECgEPAwwH8/4NAgUJCwcM+fr0RbN4IAAAGVSURBVHhe7ZbdkoMgDIUVE2ARf7o97/+s22k7pZmAUJnZq36XmBwPJgGHf+CLQ+zKN8DUJbABXRYi0GdhArosRNy5dhoAzMl8whN3UsADXRaI0WfBA30WGOiyMOKd8XOBIATCGQNdFoghCXSiBAJ/YgoEXJgp+5PjCs1Vh9H9yOjA3gRoVcuzK5KtjHVqu27db/Y0vyLKvtZ35AjOjz+itE74tEPCMBJa5hFKF5EvHdoAiX5XFPkTDRKaUWK7x1oW+YOCJuRZB5lfHoysAo9tsy2idKlGtZZnST7Fpxa9Fgr5aafqU/0qzTI0q62SyHc0HJOajU2mfeCHVoE55vKx1QSC7DTLkFxqAtJp1DPSdJ/yksZs34I6Qw4waXgStHjHjZecKVbKjuvcUIYdYF/GVf+YPGq42k9NDa71URX6SIB3MaH1MkAykb44xnaB8HyZnZvHySLBb5E7N5bBvMVF0Yxb2zgtL/eL0g540tJHng4e2qqAK4TER5GXShvwQZ2WUCmDA9bDTqP1eJz8ZoYKVoX08uUPi2Bapj4cFIsAAAAASUVORK5CYII="

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAMNCgYIDAEPBAULAgkHDf4FyRdXUAAAG8SURBVHhezZbdcoQgDEbDn4ki6vf+L9tOZ2dSuoSsXvXcaeAYCHGgfwvn1PRpSXmnO+QKAPoMAPHgj6efwLsAkPRRGtsJjAUAkpvFXoGJAJKd7AUDAUPBwmTCCRgJVvwmBjP9iE8EkI2GBMFcoKzOfFcgg1VwhCNwDAvuCBCZeg7cE6BRR8BdATZnAa7gZFJW3BegkHI+EQj3A3yBnUJ9JjjpxY5HAi3E8VSQtIZzAcHACfuCVRN8JjimWxB9Qf2JFoxZrJOuxGm0+gJMo0UFxRfYx8TfZ4wRUkhmdYzmMVOSswRDrmz3BRd1yERQ7Rp4dbjsmDB1sNhnbZskoBR71G4l4KeQ6YfLjBBxoBcZ77w+0yZ9VM9JQ0SryLLr7xK7vYiDXlxmFzQgmRcAdRfrELN0+5mtfmerCQ6t1cCwjosc/5ZOeGxYxkWu/OZtpGSj2/KoicNoaNYd6IhaGH03vApsYjfLFUihBgy/FuLwprcCrZNms7e4QV8oW+gf35tD2Q/yCIKZ4cb8Z4YswFOD7t9zQ4NBYpqhZTY5A/lwERhIYfqIvGDApdN99qOiI7ZAdwm5tOWbUnKgf8wXi3+FNpeg8ZMAAAAASUVORK5CYII="

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAMPCggL8QwD9/4NCQsHDPYFAr85NjAAABBklEQVR4Xu3V3Y6DIBCG4QFxoP5u5/4vdrM4+2kTaoD+eMJ7QtvUJxHHQF+sFbboabdkhGTrOSDJyoEGWI9sFeAJ+csAjzUJhD2uAY6FK4AG1M9BAxrQawr02nQOdDsg6fw54K4E1lcBeRHgNDA4NJwD97guByBxYJwBXVxXpsn/lQsgthKbSSsFFtFcHcCD/PdTBThB1lQARg4NXArgBnQj+2JgltjIKnSFQIcT546NLAE62Udg0s8Go3xDQxrgVbYsH3eDc18msz4emQH/ywTswwTiJkaTCyyCjdfG+DwoF6BZr0dGv+UCbPV65BYqASjg/UGFk+gMVQLoM0CIGUIGP7yr1i+rL2X5ejXICAAAAABJRU5ErkJggg=="

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAoLAwwECAEPAg0HDgYFCQv48OkrAuAAAB90lEQVR4Xu2UXZOjIBBFG+RTQJPz/3/sbqKxnZCpcczD1lblPNGl3Kb70sj/xochXG2Y5CzTBUiQgpyiUEu86TjGKL8nYB/b2k8KUXoGrAaN+butzVaAZFuWL9i0lzVotCMbFMxeIi85r3CN97BIT0gA1RnjRgCusuHx9z7ColRtf3oL1LKmzaUCl6gtvC0dQL3FznX7R0ghilIS2u3AvREA42sBC2l4avwIoyxM9xKGBEy3OD2XMEONr041r8tlMczYxdT21H/NvycnGNRGNdA+22igyAsaXL5epIwR8YTuAHUXeV277QgNE5dcXvLczYnWNFXAxEcE83aadDM5phSlt4C8+XUnPWI1QrwDavT0o6R/eVYuWoNs5BLml8MIVru5krcTdfZ0CgMETbjiNwHfm5PStI/9cQG9pDbvQi0h8CA+CfSje9EP4PTyLgQ1SF6S56SXb2T1dttvZCVR5RtiizpKtMdI5eBG27Q6jPzMsPg+9SNlYJIDjCASUzdSHqocYXDlns31D8IkR/HLBCgqeYwLT1MeDaQoB+nLHUbt6REMNFEGw4H9/aMUjQlTC9cK4KIcpywWFjZqk98wQl7fYYBkJvkVGey68n/J8lsKNDmNPqvnqVR5hwxGTqOv4nkKeHmH8K6AA/kIfAQKSd6jePl3fPgDOtEg/yPlfh8AAAAASUVORK5CYII="

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAPFBMVEVHcEz///////////////////////////////////////////////////////////////////////////+PybD1AAAAE3RSTlMAoGAw0PCAEEDAIHDfsJBQ4I+vnt3bXwAAAkdJREFUeF7tVtuCqyAMLAghAfHG///rqW0xwWjd9nHPzgsWyGQgF3r7v/CHzrhSiieau+8I+rKhn8MXBEXCp88JqDRwn4tIkBAtZM8MXwKJGb7E+FBBb3YEa4jI4GlMHwzpVKMpL5ggrdzqdo4bgz8+RFwKYzjIhEcWwKkEKA2EEy9DGKY1o3hRyGyBvDaUCnP/ZdcPldXWlx1Aslu0ptLGdbQ7+7kooPJRJbjnKPFkP7wDvEPs8vcxcypoexkFhOV1/8vjyOP6eR9hT7AUDZ/a2ZUBFQH7v0Sul/AyoM/sW899k2e2/JgAn+GLTSp2P7R3j4iArXcZa/H1aicNAIbIq6BIn3QcgGxFhsbRNFFggHf1J0rXNujmMNV2jFcdm3jHSY24FN8U8HmzjlylHnYaQ2V3Hc+NAKlVY05belLTtrqTTTHUSVVDr4Wp2qOM6SxOcVLknZzTOUmHzS7rE9QUGVVBH0nwgiA3jSN6kYzPkcM2iZpgUKNpkCphJ4EOm7VreicLgHqcngneKBjFjU4WMZe+q8mjCNo4ZhkD3OKZxYXplE8qCpYJUv1ibypA8dbkBzf4sImJ+mkx8mXan6HnY0KbNT5w0YsplYqw7fLYyE26a41szLH3kXU6ckpt0FMMJ4vRtIl8ac+rLqoX2mE9Zq/tNYPfCjKvHG7AugzquVcMz7yh7mgNWNKEF//cymJDaz0aL9zz4htHNFvE+86IaabC8EO8vUdIU9GQ78U1OqCiMRnLzq+BFjIR+TIRkYGE4fbb8Yd/KxZhLtPWraEAAAAASUVORK5CYII="

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAMOCwQGDQ8IAQkFAgn79wwKDPjjl1AAABuUlEQVR4Xu3VwXKFIAwF0IsASVBR8/8f27IBnSeitatOz455w30kSsTf9G8amW1KMy9O8JifSXdCNHhgiqQfBi+4R6KeowV3jKRNwaAr6qXeIcRqx4xLSfVVwqw3RDR5rQbNTtcjGoT2vZJNi+AAUyJIcK7uYGT1Tw0AjGW54dSkhUO2lgMgEy0mnGEtPLJQ1gIArtfHQQtyABYtrACStKBWBVWag+5QmgfdMfg0ah/ZxaGFtSd4gYyc0qCUEo/yLGDwEB90z/oHAVHAdJJ6N8DDDZ0Rwdf7uTsi3OX++cYF1ybO+/sJVhsCvF7zyLw2uIm0w5TLcGKt95w8xlAKE1MOna5e5nGqR92NnfVw4127C4R4nBOhXun6k0UmZ0XYXWl21yqSwxAUZIb0A09aJa6npDiTFg6tBOf0DkYrwS2PAiBBjxw/CShdrpx/GkA/6oFvzkYWvWM6fp+IR15JM4ugfeFQAbEgE/fNYHlWQdleCGnPgCKy/GDiO1zqdiGiw5BeWYFXCUHwKmEV3GFafdhwF3ceYN+0UeMdvk28rRlhi3mx4CHj+NviBPlMqitemVYVvOMMfsu/L0Ath0CgH1P9AAAAAElFTkSuQmCC"

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEVHcEz///////////////////////////////////////////////////////////////////////////////9KjZoYAAAAFHRSTlMAMMAgQGCgEPCAcNBQsOCQ37+Pr/HIP5wAAAI0SURBVHhetVfdeuwgCFyNfxhNTJb3f9Zz03aqYvS0X+du10AGGIS8/hjeGLP9zHSz7gr8gcvZ7f+s484tyr3sw7xZxpVWzNXFYxQzzdrNz3g/B6IKzxCe4rC8gnto73gNb79mv2eiSET64PbEz+2z9ThScZ97IAbYdbk2uvLgOvvEgBZLZapIqBVvwFkcaaQKspEU5BfUWpmDl05gP/dwvgAfevu5h02qwLTfTqkSPoDWFHtPAbyORh8qEbVXmuopwKmtqkblQ3Z2oNjwqYEvAlW6oAwuSC0exwujRKC+WML3o4yGaf7weChyA9WpHjHAH3TPQC+82i3SGntly92jkYSKkRFKBQRJd1T9FOUGJCEJeeBAswASMqQhjIpjYQFOdoDX7XDAErTgoMBBE8KcAVjnRQdxFAKhOzsdylq0AwfQgeceh1RlXVX1fBxyUYqQqogKHvHHQy/41qt0S6oHArbNiwYhQIV6GMozBL0BmmIigxJbPYMuKIgNZSQCuMK+MhY2eYrZwRT20E0b6i3zxwxBBPgTWrA7A9kP5gobabmI8b4CAzoN1xg92A6ihnxdM2uHGwLVkjGRCENtsGHk6uxY2OIU4kfFROkWO5ns0MBoFBUrsUjgyW62ZgYn7Ro2PyyKOzcIwneKj7Bv4eEBKG9Kn+VShq7HTcpnXsPuf7eua8kea8kU9HrCpifmhxnaothjBHotwB5Dc/9aQ3JCLjLEuwJzagb0mfwPP70p4fP7T/APapCRU7q26PsAAAAASUVORK5CYII="

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = extend

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {}

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }

	    return target
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module === 'object' && module.exports) {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.QRCode = factory();
	  }
	}(this, function () {
	  /**
	   * @fileoverview
	   * - Using the 'QRCode for Javascript library'
	   * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
	   * - this library has no dependencies.
	   *
	   * @author davidshimjs
	   * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
	   * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
	   */

	  //---------------------------------------------------------------------
	  // QRCode for JavaScript
	  //
	  // Copyright (c) 2009 Kazuhiko Arase
	  //
	  // URL: http://www.d-project.com/
	  //
	  // Licensed under the MIT license:
	  //   http://www.opensource.org/licenses/mit-license.php
	  //
	  // The word "QR Code" is registered trademark of
	  // DENSO WAVE INCORPORATED
	  //   http://www.denso-wave.com/qrcode/faqpatent-e.html
	  //
	  //---------------------------------------------------------------------
	  function QR8bitByte(data) {
	    this.mode = QRMode.MODE_8BIT_BYTE;
	    this.data = data;
	    this.parsedData = [];

	    // Added to support UTF-8 Characters
	    for (var i = 0, l = this.data.length; i < l; i++) {
	      var byteArray = [];
	      var code = this.data.charCodeAt(i);

	      if (code > 0x10000) {
	        byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
	        byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
	        byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
	        byteArray[3] = 0x80 | (code & 0x3F);
	      } else if (code > 0x800) {
	        byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
	        byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
	        byteArray[2] = 0x80 | (code & 0x3F);
	      } else if (code > 0x80) {
	        byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
	        byteArray[1] = 0x80 | (code & 0x3F);
	      } else {
	        byteArray[0] = code;
	      }

	      this.parsedData.push(byteArray);
	    }

	    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

	    if (this.parsedData.length != this.data.length) {
	      this.parsedData.unshift(191);
	      this.parsedData.unshift(187);
	      this.parsedData.unshift(239);
	    }
	  }

	  QR8bitByte.prototype = {
	    getLength: function (buffer) {
	      return this.parsedData.length;
	    },
	    write: function (buffer) {
	      for (var i = 0, l = this.parsedData.length; i < l; i++) {
	        buffer.put(this.parsedData[i], 8);
	      }
	    }
	  };

	  function QRCodeModel(typeNumber, errorCorrectLevel) {
	    this.typeNumber = typeNumber;
	    this.errorCorrectLevel = errorCorrectLevel;
	    this.modules = null;
	    this.moduleCount = 0;
	    this.dataCache = null;
	    this.dataList = [];
	  }

	  QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
	  return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
	  this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
	  if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
	  this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
	  return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
	  return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
	  this.modules[r][6]=(r%2==0);}
	  for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
	  this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
	  for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
	  for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
	  for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
	  this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
	  var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
	  this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
	  row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
	  var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
	  if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
	  +buffer.getLengthInBits()
	  +">"
	  +totalDataCount*8
	  +")");}
	  if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
	  while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
	  while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	  buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	  buffer.put(QRCodeModel.PAD1,8);}
	  return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
	  offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
	  var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
	  var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
	  for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
	  return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
	  return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
	  return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
	  return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
	  return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
	  for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
	  if(r==0&&c==0){continue;}
	  if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
	  if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
	  for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
	  for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
	  for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
	  var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
	  var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
	  return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
	  while(n>=256){n-=255;}
	  return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
	  for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
	  for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
	  function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
	  var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
	  this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
	  QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
	  return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
	  var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
	  for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
	  return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
	  QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
	  var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
	  return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
	  QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
	  if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
	  this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];

	  function _isSupportCanvas() {
	    return typeof CanvasRenderingContext2D != "undefined";
	  }

	  // android 2.x doesn't support Data-URI spec
	  function _getAndroid() {
	    var android = false;
	    var sAgent = navigator.userAgent;

	    if (/android/i.test(sAgent)) { // android
	      android = true;
	      var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

	      if (aMat && aMat[1]) {
	        android = parseFloat(aMat[1]);
	      }
	    }

	    return android;
	  }

	  var svgDrawer = (function() {

	    var Drawing = function (el, htOption) {
	      this._el = el;
	      this._htOption = htOption;
	    };

	    Drawing.prototype.draw = function (oQRCode) {
	      var _htOption = this._htOption;
	      var _el = this._el;
	      var nCount = oQRCode.getModuleCount();
	      var nWidth = Math.floor(_htOption.width / nCount);
	      var nHeight = Math.floor(_htOption.height / nCount);

	      this.clear();

	      function makeSVG(tag, attrs) {
	        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
	        for (var k in attrs)
	          if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
	        return el;
	      }

	      var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
	      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	      _el.appendChild(svg);

	      svg.appendChild(makeSVG("rect", {"fill": _htOption.colorLight, "width": "100%", "height": "100%"}));
	      svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));

	      for (var row = 0; row < nCount; row++) {
	        for (var col = 0; col < nCount; col++) {
	          if (oQRCode.isDark(row, col)) {
	            var child = makeSVG("use", {"x": String(col), "y": String(row)});
	            child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
	            svg.appendChild(child);
	          }
	        }
	      }
	    };
	    Drawing.prototype.clear = function () {
	      while (this._el.hasChildNodes())
	        this._el.removeChild(this._el.lastChild);
	    };
	    return Drawing;
	  })();

	  var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

	  // Drawing in DOM by using Table tag
	  var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
	    var Drawing = function (el, htOption) {
	      this._el = el;
	      this._htOption = htOption;
	    };

	    /**
	     * Draw the QRCode
	     *
	     * @param {QRCode} oQRCode
	     */
	    Drawing.prototype.draw = function (oQRCode) {
	            var _htOption = this._htOption;
	            var _el = this._el;
	      var nCount = oQRCode.getModuleCount();
	      var nWidth = Math.floor(_htOption.width / nCount);
	      var nHeight = Math.floor(_htOption.height / nCount);
	      var aHTML = ['<table style="border:0;border-collapse:collapse;">'];

	      for (var row = 0; row < nCount; row++) {
	        aHTML.push('<tr>');

	        for (var col = 0; col < nCount; col++) {
	          aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
	        }

	        aHTML.push('</tr>');
	      }

	      aHTML.push('</table>');
	      _el.innerHTML = aHTML.join('');

	      // Fix the margin values as real size.
	      var elTable = _el.childNodes[0];
	      var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
	      var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

	      if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
	        elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
	      }
	    };

	    /**
	     * Clear the QRCode
	     */
	    Drawing.prototype.clear = function () {
	      this._el.innerHTML = '';
	    };

	    return Drawing;
	  })() : (function () { // Drawing in Canvas
	    function _onMakeImage() {
	      this._elImage.src = this._elCanvas.toDataURL("image/png");
	      this._elImage.style.display = "block";
	      this._elCanvas.style.display = "none";
	    }

	    // Android 2.1 bug workaround
	    // http://code.google.com/p/android/issues/detail?id=5141
	    if (this._android && this._android <= 2.1) {
	        var factor = 1 / window.devicePixelRatio;
	          var drawImage = CanvasRenderingContext2D.prototype.drawImage;
	        CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
	          if (("nodeName" in image) && /img/i.test(image.nodeName)) {
	              for (var i = arguments.length - 1; i >= 1; i--) {
	                  arguments[i] = arguments[i] * factor;
	              }
	          } else if (typeof dw == "undefined") {
	            arguments[1] *= factor;
	            arguments[2] *= factor;
	            arguments[3] *= factor;
	            arguments[4] *= factor;
	          }

	            drawImage.apply(this, arguments);
	        };
	    }

	    /**
	     * Check whether the user's browser supports Data URI or not
	     *
	     * @private
	     * @param {Function} fSuccess Occurs if it supports Data URI
	     * @param {Function} fFail Occurs if it doesn't support Data URI
	     */
	    function _safeSetDataURI(fSuccess, fFail) {
	            var self = this;
	            self._fFail = fFail;
	            self._fSuccess = fSuccess;

	            // Check it just once
	            if (self._bSupportDataURI === null) {
	                var el = document.createElement("img");
	                var fOnError = function() {
	                    self._bSupportDataURI = false;

	                    if (self._fFail) {
	                        self._fFail.call(self);
	                    }
	                };
	                var fOnSuccess = function() {
	                    self._bSupportDataURI = true;

	                    if (self._fSuccess) {
	                        self._fSuccess.call(self);
	                    }
	                };

	                el.onabort = fOnError;
	                el.onerror = fOnError;
	                el.onload = fOnSuccess;
	                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
	                return;
	            } else if (self._bSupportDataURI === true && self._fSuccess) {
	                self._fSuccess.call(self);
	            } else if (self._bSupportDataURI === false && self._fFail) {
	                self._fFail.call(self);
	            }
	    };

	    /**
	     * Drawing QRCode by using canvas
	     *
	     * @constructor
	     * @param {HTMLElement} el
	     * @param {Object} htOption QRCode Options
	     */
	    var Drawing = function (el, htOption) {
	        this._bIsPainted = false;
	        this._android = _getAndroid();

	      this._htOption = htOption;
	      this._elCanvas = document.createElement("canvas");
	      this._elCanvas.width = htOption.width;
	      this._elCanvas.height = htOption.height;
	      el.appendChild(this._elCanvas);
	      this._el = el;
	      this._oContext = this._elCanvas.getContext("2d");
	      this._bIsPainted = false;
	      this._elImage = document.createElement("img");
	      this._elImage.alt = "Scan me!";
	      this._elImage.style.display = "none";
	      this._el.appendChild(this._elImage);
	      this._bSupportDataURI = null;
	    };

	    /**
	     * Draw the QRCode
	     *
	     * @param {QRCode} oQRCode
	     */
	    Drawing.prototype.draw = function (oQRCode) {
	            var _elImage = this._elImage;
	            var _oContext = this._oContext;
	            var _htOption = this._htOption;

	      var nCount = oQRCode.getModuleCount();
	      var nWidth = _htOption.width / nCount;
	      var nHeight = _htOption.height / nCount;
	      var nRoundedWidth = Math.round(nWidth);
	      var nRoundedHeight = Math.round(nHeight);

	      _elImage.style.display = "none";
	      this.clear();

	      for (var row = 0; row < nCount; row++) {
	        for (var col = 0; col < nCount; col++) {
	          var bIsDark = oQRCode.isDark(row, col);
	          var nLeft = col * nWidth;
	          var nTop = row * nHeight;
	          _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
	          _oContext.lineWidth = 1;
	          _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
	          _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

	          // 안티 앨리어싱 방지 처리
	          _oContext.strokeRect(
	            Math.floor(nLeft) + 0.5,
	            Math.floor(nTop) + 0.5,
	            nRoundedWidth,
	            nRoundedHeight
	          );

	          _oContext.strokeRect(
	            Math.ceil(nLeft) - 0.5,
	            Math.ceil(nTop) - 0.5,
	            nRoundedWidth,
	            nRoundedHeight
	          );
	        }
	      }

	      this._bIsPainted = true;
	    };

	    /**
	     * Make the image from Canvas if the browser supports Data URI.
	     */
	    Drawing.prototype.makeImage = function () {
	      if (this._bIsPainted) {
	        _safeSetDataURI.call(this, _onMakeImage);
	      }
	    };

	    /**
	     * Return whether the QRCode is painted or not
	     *
	     * @return {Boolean}
	     */
	    Drawing.prototype.isPainted = function () {
	      return this._bIsPainted;
	    };

	    /**
	     * Clear the QRCode
	     */
	    Drawing.prototype.clear = function () {
	      this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
	      this._bIsPainted = false;
	    };

	    /**
	     * @private
	     * @param {Number} nNumber
	     */
	    Drawing.prototype.round = function (nNumber) {
	      if (!nNumber) {
	        return nNumber;
	      }

	      return Math.floor(nNumber * 1000) / 1000;
	    };

	    return Drawing;
	  })();

	  /**
	   * Get the type by string length
	   *
	   * @private
	   * @param {String} sText
	   * @param {Number} nCorrectLevel
	   * @return {Number} type
	   */
	  function _getTypeNumber(sText, nCorrectLevel) {
	    var nType = 1;
	    var length = _getUTF8Length(sText);

	    for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
	      var nLimit = 0;

	      switch (nCorrectLevel) {
	        case QRErrorCorrectLevel.L :
	          nLimit = QRCodeLimitLength[i][0];
	          break;
	        case QRErrorCorrectLevel.M :
	          nLimit = QRCodeLimitLength[i][1];
	          break;
	        case QRErrorCorrectLevel.Q :
	          nLimit = QRCodeLimitLength[i][2];
	          break;
	        case QRErrorCorrectLevel.H :
	          nLimit = QRCodeLimitLength[i][3];
	          break;
	      }

	      if (length <= nLimit) {
	        break;
	      } else {
	        nType++;
	      }
	    }

	    if (nType > QRCodeLimitLength.length) {
	      throw new Error("Too long data");
	    }

	    return nType;
	  }

	  function _getUTF8Length(sText) {
	    var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	    return replacedText.length + (replacedText.length != sText ? 3 : 0);
	  }

	  /**
	   * @class QRCode
	   * @constructor
	   * @example
	   * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	   *
	   * @example
	   * var oQRCode = new QRCode("test", {
	   *    text : "http://naver.com",
	   *    width : 128,
	   *    height : 128
	   * });
	   *
	   * oQRCode.clear(); // Clear the QRCode.
	   * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	   *
	   * @param {HTMLElement|String} el target element or 'id' attribute of element.
	   * @param {Object|String} vOption
	   * @param {String} vOption.text QRCode link data
	   * @param {Number} [vOption.width=256]
	   * @param {Number} [vOption.height=256]
	   * @param {String} [vOption.colorDark="#000000"]
	   * @param {String} [vOption.colorLight="#ffffff"]
	   * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	   */
	  var QRCode = function (el, vOption) {
	    this._htOption = {
	      width : 256,
	      height : 256,
	      typeNumber : 4,
	      colorDark : "#000000",
	      colorLight : "#ffffff",
	      correctLevel : QRErrorCorrectLevel.H
	    };

	    if (typeof vOption === 'string') {
	      vOption = {
	        text : vOption
	      };
	    }

	    // Overwrites options
	    if (vOption) {
	      for (var i in vOption) {
	        this._htOption[i] = vOption[i];
	      }
	    }

	    if (typeof el == "string") {
	      el = document.getElementById(el);
	    }

	    if (this._htOption.useSVG) {
	      Drawing = svgDrawer;
	    }

	    this._android = _getAndroid();
	    this._el = el;
	    this._oQRCode = null;
	    this._oDrawing = new Drawing(this._el, this._htOption);

	    if (this._htOption.text) {
	      this.makeCode(this._htOption.text);
	    }
	  };

	  /**
	   * Make the QRCode
	   *
	   * @param {String} sText link data
	   */
	  QRCode.prototype.makeCode = function (sText) {
	    this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
	    this._oQRCode.addData(sText);
	    this._oQRCode.make();
	    this._el.title = sText;
	    this._oDrawing.draw(this._oQRCode);
	    this.makeImage();
	  };

	  /**
	   * Make the Image from Canvas element
	   * - It occurs automatically
	   * - Android below 3 doesn't support Data-URI spec.
	   *
	   * @private
	   */
	  QRCode.prototype.makeImage = function () {
	    if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
	      this._oDrawing.makeImage();
	    }
	  };

	  /**
	   * Clear the QRCode
	   */
	  QRCode.prototype.clear = function () {
	    this._oDrawing.clear();
	  };

	  /**
	   * @name QRCode.CorrectLevel
	   */
	  QRCode.CorrectLevel = QRErrorCorrectLevel;

	  return QRCode;
	}));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  weixin: {
	    name: '微信',
	    icon: __webpack_require__(12)
	  },
	  yixin: {
	    name: '易信',
	    icon: __webpack_require__(13),
	    api: 'http://open.yixin.im/share?url={{url}}&title={{title}}&pic={{pic}}&desc={{digest}}'
	  },
	  weibo: {
	    name: '微博',
	    icon: __webpack_require__(11),
	    api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  qzone: {
	    name: 'QQ空间',
	    icon: __webpack_require__(7),
	    api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}'
	  },
	  tqq: {
	    name: '腾讯微博',
	    icon: __webpack_require__(10),
	    api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
	  },
	  renren: {
	    name: '人人网',
	    icon: __webpack_require__(8),
	    api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
	  },
	  douban: {
	    name: '豆瓣',
	    icon: __webpack_require__(6),
	    api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
	  },
	  tieba: {
	    name: '百度贴吧',
	    icon: __webpack_require__(9),
	    api: 'http://tieba.baidu.com/f/commit/share/openShareApi?url={{url}}&title={{title}}&desc={{digest}}'
	  }
	};


/***/ }
/******/ ])
});
;