"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _service = require("./service");

var _service2 = _interopRequireDefault(_service);

exports["default"] = {
    "request": function request(_ref) {
        var url = _ref.url;

        var route = {};
        if (url == "Help") {
            route.params = { id: 1 };
            route.name = "page";
            return this.set("route", route);
        }
    },

    "route": {
        set: function set(_ref2, _ref3) {
            var name = _ref2.name;
            var params = _ref2.params;
            var url = _ref3.url;

            params = params || { id: 1 };
            this.set("url", url);
            this.set(name, _service2["default"][name](params.id));
        },
        deps: ["request"]
    }
};
module.exports = exports["default"];
//# sourceMappingURL=deps.js.map