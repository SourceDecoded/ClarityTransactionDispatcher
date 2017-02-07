(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["clarityDispatcher"] = factory();
	else
		root["clarityDispatcher"] = factory();
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

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const ClarityTransactionDispatcher_1 = __webpack_require__(2);
	exports.ClarityTransactionDispatcher = ClarityTransactionDispatcher_1.default;
	//# sourceMappingURL=main.js.map

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	class ClarityTransactionDispatcher {
	    constructor() {
	    }
	    addEntityAsync(entity) { }
	    addServiceAsync(name, service) { }
	    addSystemAsync(system) { }
	    getEntityByIdAsync() { }
	    getEntityContentStream() { }
	    getEntitiesAsync() { }
	    getService(name) { }
	    pause() { }
	    removeEntityAsync(entity) { }
	    removeServiceAsync(name) { }
	    removeSystemAsync(system) { }
	    start() { }
	    updateEntityAsync(entity) { }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ClarityTransactionDispatcher;
	//# sourceMappingURL=ClarityTransactionDispatcher.js.map

/***/ }
/******/ ])
});
;