"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _immutable = require("immutable");

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _utils = require("./utils");

var _context = require("./context");

var _context2 = _interopRequireDefault(_context);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

var Slots = (function () {
    function Slots() {
        var rules = arguments[0] === undefined ? {} : arguments[0];
        var state = arguments[1] === undefined ? {} : arguments[1];
        var aliases = arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, Slots);

        this.rules = Object.keys(rules).reduce(function (res, key) {
            res[key] = Slots.normalizeRule(rules[key]);
            return res;
        }, {});
        this.state = (0, _immutable.fromJS)(state);
        this.optimisticState = this.state;
        this.contexts = [];
        this.listeners = {};
    }

    _createClass(Slots, [{
        key: "reset",
        value: function reset() {
            this.state = (0, _immutable.fromJS)({});
            this.listeners = {};
        }
    }, {
        key: "setState",
        value: function setState(value) {
            return this.set([], value);
        }
    }, {
        key: "set",
        value: function set() {
            var path = arguments[0] === undefined ? [] : arguments[0];
            var value = arguments[1] === undefined ? {} : arguments[1];
            var mergeValue = arguments[2] === undefined ? true : arguments[2];

            var ctx = new _context2["default"](this);
            this.contexts.push(ctx);
            ctx.set(path, value, mergeValue);
            return ctx;
        }
    }, {
        key: "commit",
        value: function commit(ctx) {
            var prevState = this.state;
            this._fire("willCommit", ctx.state);
            log("COMMIT %s", (0, _utils.insp)(ctx.state));
            this.state = ctx.state;
            this._fire("didCommit", prevState);
            this._checkPromises();
            log("LISTENERS DONE", (0, _utils.insp)(ctx.state));
            return ctx;
        }
    }, {
        key: "on",
        value: function on(eventName, fn) {
            if (this.listeners[eventName] === undefined) {
                this.listeners[eventName] = [];
            }
            if (this.listeners[eventName].filter(function (f) {
                return f.toString() === fn.toString();
            }).length) {
                return this.listeners[eventName].length;
            }
            return this.listeners[eventName].push(fn);
        }
    }, {
        key: "_fire",
        value: function _fire(eventName) {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var listeners = this.listeners[eventName];
            if (!listeners) {
                return;
            }
            listeners.forEach(function (fn) {
                return fn.apply(_this, args);
            });
        }
    }, {
        key: "_checkPromises",
        value: function _checkPromises() {
            if (this.contexts.filter(function (context) {
                return context.hasPromises();
            }).length) {
                return;
            }
            this._fire("allPromisesDone");
        }
    }, {
        key: "onWillSet",
        value: function onWillSet(fn) {
            return this.on("willSet", fn);
        }
    }, {
        key: "onDidSet",
        value: function onDidSet(fn) {
            return this.on("didSet", fn);
        }
    }, {
        key: "onWillCommit",
        value: function onWillCommit(fn) {
            return this.on("willCommit", fn);
        }
    }, {
        key: "onDidCommit",
        value: function onDidCommit(fn) {
            return this.on("didCommit", fn);
        }
    }, {
        key: "onAllPromisesDone",
        value: function onAllPromisesDone(fn) {
            return this.on("allPromisesDone", fn);
        }
    }, {
        key: "getContexts",
        value: function getContexts() {
            return this.contexts;
        }
    }, {
        key: "getState",
        value: function getState() {
            return this.state;
        }
    }, {
        key: "get",
        value: function get() {
            var path = arguments[0] === undefined ? null : arguments[0];
            var state = arguments[1] === undefined ? null : arguments[1];

            state = state || this.state;
            if (!path) {
                return state.toJS();
            }
            path = Slots.makePath(path);
            var value = state.getIn(path);
            return (0, _utils.toJS)(value);
        }
    }, {
        key: "getRule",
        value: function getRule(path) {
            path = Slots.makePath(path);
            return this.rules[Slots.makeDottedPath(path)];
        }
    }, {
        key: "getSetRule",
        value: function getSetRule(path) {
            var rule = this.getRule(path);
            return rule && rule.set;
        }
    }, {
        key: "getDeps",
        value: function getDeps(path) {
            var rule = this.getRule(path);
            return rule && rule.deps;
        }
    }, {
        key: "isEqual",
        value: function isEqual(state) {
            return (0, _immutable.is)((0, _immutable.fromJS)(state), this.state);
        }
    }], [{
        key: "normalizeRule",
        value: function normalizeRule(rule) {
            if ((0, _utils.isFunction)(rule)) {
                var fn = rule;
                rule = {
                    "set": fn
                };
            }
            if (!rule.deps) {
                rule.deps = [];
            }
            if (!(0, _utils.isArray)(rule.deps)) {
                throw new Error("Invalid rule");
            }
            return rule;
        }
    }, {
        key: "makePath",
        value: function makePath(path) {
            if (path === null) {
                return null;
            }
            if (path.toArray) {
                path = path.toArray();
            }
            return (0, _utils.isArray)(path) && path || ((0, _utils.isString)(path) || (0, _utils.isNumber)(path)) && path.toString().split(".") || (function () {
                throw new Error("path should be an array or dot-separated string or null,\n                    " + Object.prototype.toString.call(path) + " given");
            })();
        }
    }, {
        key: "makeDottedPath",
        value: function makeDottedPath(path) {
            return Slots.makePath(path).join(".");
        }
    }]);

    return Slots;
})();

exports["default"] = Slots;
module.exports = exports["default"];
//# sourceMappingURL=slots.js.map