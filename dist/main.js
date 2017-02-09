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
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const ClarityTransactionDispatcher_1 = __webpack_require__(1);
exports.ClarityTransactionDispatcher = ClarityTransactionDispatcher_1.default;
//# sourceMappingURL=main.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Class that organizes systems to respond to data transactions.
 * The dispatcher manages the life-cycle of data entities. They can be
 * added, updated, removed, and read. The dispatcher is not responsible
 * for anything beyond this. It will notify the systems when any entity
 * has been added, updated, removed, and read. This allows the dispatcher
 * to remain unopinionated about tasks to run when a certain entity is
 * added, updated, or removed.
 *
 * The idea behind the dispatcher is to handle the complexity of the IoT.
 * There are many systems, devices, and other technologies that need to
 * communicate for a company to run smoothly. We believe that answer to
 * these needs is a data dispatcher which lets all independent systems know
 * about data changes.
 *
 * The dispatcher will also notify the system when components on the entity
 * have been added updated or removed. This is critical for the systems to
 * fulfill their responsibilities efficiently.
 */
class ClarityTransactionDispatcher {
    /**
     * Create a Dispatcher.
     * @constructor
     */
    constructor() {
    }
    /**
     * Add an Entity to the datastore. This will record
     * a transaction as well as maintain the current
     * state of the entity.
     * @param {object} entity - The entity you want add.
     * @return {Promise}
     */
    addEntityAsync(entity) { }
    /**
     * Add a service for systems to use. Services could be HTTP services,
     * or governance that needs to be shared acrossed systems.
     * @param {string} name - The name by which the systems will request the service.
     * @param {object} service - The service.
     * @return {Promise}
     */
    addServiceAsync(name, service) { }
    /**
     * Add a system to the dispatcher. The systems are really where the work
     * is done. They listen to the life-cycle of the entity and react based
     * on the composition of components.
     *
     * For example an Image Thumbnail System will look to see if the entity has the
     * component of image
     * #### Required
     * - getGuid()
     * - getName()
     *
     * #### Optional
     *  - activatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - disposeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - deactivatedAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     *  - entityAddedAsync(entity: any)
     *  - entityUpdatedAsync(entity: any)
     *  - entityRemovedAsync(entity: any)
     *  - entityContentUpdatedAsync(entity: any)
     *  - entityComponentAddedAsync(entity: any, component: any)
     *  - entityComponentUpdatedAsync(entity: any, component: any)
     *  - entityComponentRemovedAsync(entity: any, component: any)
     *  - initializeAsync(clarityTransactionDispatcher: ClarityTransactionDispatcher)
     * @param {ISystem} system - The system to add.
     * @return {Promise} - An undefined Promise.
     */
    addSystemAsync(system) { }
    /**
     * Get an entity by its id.
     * @param {string} id - The id of the desired entity.
     * @return {Promise<Entity>} - A Promise resolved with the entity or null.
     */
    getEntityByIdAsync(id) {
    }
    /**
     * Get a stream of the content of the entity.
     * @param {object} entity - The entity you want to get the content of.
     * @returns {stream} - Node read stream.
     */
    getEntityContentStream(entity) {
    }
    /**
     * Get a stream of the content of the entity.
     * @param {string} id - The id of the entity you want to get the content of.
     * @returns {stream} - Node read stream.
     */
    getEntityContentStreamById(id) {
    }
    /**
     * Get a range of entities.
     * @param {number} skip - The amount of entities you want to skip.
     * @param {number} take - The amount of entities you want to take.
     * @return {Promise<Array<object>>} - The range of entities.
     */
    getEntitiesAsync(skip, take) {
    }
    /**
     * Get a service by the name given.
     * @param {string} name - The name of the desired service.
     * @returns {object} - Null or the desired service.
     */
    getService(name) {
    }
    /**
     * Pauses the dispatcher.
     */
    pause() { }
    /**
     * Removes an entity.
     * @param {object} entity - The entity to be removed.
     * @returns {Promise<undefined>}
     */
    removeEntityAsync(entity) { }
    /**
     * Removes a service by its name.
     * @param {string} name - The name of the service to be removed.
     * @returns {undefined}
     */
    removeService(name) { }
    /**
     * Removes a system.
     * @param {system} - The system to be removed.
     * @returns {Promise<undefined>} - Resolves when the system is disposed.
     */
    removeSystemAsync(system) { }
    /**
     * Starts the dispatcher.
     */
    start() { }
    /**
     * Updated an entity.
     * @param {object} entity - The updated entity.
     * @returns {Promise<undefined>} - Resolves when the entity is saved.
     */
    updateEntityAsync(entity) { }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClarityTransactionDispatcher;
//# sourceMappingURL=ClarityTransactionDispatcher.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});