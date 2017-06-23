"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EntityUtility = function () {
    function EntityUtility(entity) {
        _classCallCheck(this, EntityUtility);

        this.entity = entity || null;
    }

    _createClass(EntityUtility, [{
        key: "_assertHasEntity",
        value: function _assertHasEntity() {
            if (this.entity == null) {
                throw new Error("The utility needs to have an entity to act on.");
            }
        }
    }, {
        key: "getComponent",
        value: function getComponent(type) {
            this._assertHasEntity();

            return this.getComponents(type)[0] || null;
        }
    }, {
        key: "getComponents",
        value: function getComponents(type) {
            this._assertHasEntity();

            return this.entity.components.filter(function (component) {
                return component.type === type;
            });
        }
    }, {
        key: "hasComponent",
        value: function hasComponent(type) {
            this._assertHasEntity();

            return this.getComponent(type) != null ? true : false;
        }
    }, {
        key: "hasTypeComposition",
        value: function hasTypeComposition(types) {
            var _this = this;

            this._assertHasEntity();

            return types.every(function (type) {
                return _this.hasComponent(type);
            });
        }
    }]);

    return EntityUtility;
}();

exports.default = EntityUtility;
//# sourceMappingURL=EntityUtility.js.map