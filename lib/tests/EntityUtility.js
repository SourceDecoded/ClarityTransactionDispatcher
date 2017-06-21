"use strict";

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _EntityUtility = require("./../EntityUtility");

var _EntityUtility2 = _interopRequireDefault(_EntityUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function Entity() {
    _classCallCheck(this, Entity);

    this.components = [];
    this.components.push({
        type: "test"
    }, {

        type: "test",
        prop: "secondTest"
    }, {
        type: "test-2",
        prop: "value"
    });
};

exports["EntityUtility.constructor"] = function () {
    var entityUtility = new _EntityUtility2.default();
    _assert2.default.equal(entityUtility.entity, null);

    var entity = new Entity();

    entityUtility = new _EntityUtility2.default(entity);

    _assert2.default.equal(entityUtility.entity, entity);
};

exports["EntityUtility.constructor: act without setting an entity."] = function () {
    _assert2.default.throws(function () {
        var entityUtility = new _EntityUtility2.default();
        entityUtility.hasComponent("test");
    });
};

exports["EntityUtility.getComponent"] = function () {
    var entity = new Entity();
    var entityUtility = new _EntityUtility2.default(entity);

    _assert2.default.equal(entityUtility.getComponent("test"), entity.components[0]);
};

exports["EntityUtility.getComponents"] = function () {
    var entity = new Entity();
    var entityUtility = new _EntityUtility2.default(entity);

    var components = entityUtility.getComponents("test");

    _assert2.default.equal(components[0], entity.components[0]);
    _assert2.default.equal(components[1], entity.components[1]);
    _assert2.default.equal(components.length, 2);
};

exports["EntityUtility.hasComponent"] = function () {
    var entity = new Entity();
    var entityUtility = new _EntityUtility2.default(entity);

    _assert2.default.equal(entityUtility.hasComponent("test"), true);
};

exports["EntityUtility.hasTypeComposition"] = function () {
    var entity = new Entity();
    var entityUtility = new _EntityUtility2.default(entity);

    var result = entityUtility.hasTypeComposition(["test", "test-2"]);

    _assert2.default.equal(result, true);
};
//# sourceMappingURL=EntityUtility.js.map