'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createApp = createApp;

var _dom = require('../dom');

var dom = _interopRequireWildcard(_dom);

var _diff = require('../diff');

var _emptyElement = require('@f/empty-element');

var _emptyElement2 = _interopRequireDefault(_emptyElement);

var _noop = require('@f/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

function createApp(container) {
  var handler = arguments.length <= 1 || arguments[1] === undefined ? _noop2.default : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var oldVnode = null;
  var node = null;
  var rootId = options.id || '0';
  var dispatch = function dispatch(effect) {
    return effect && handler(effect);
  };

  if (container) {
    (0, _emptyElement2.default)(container);
  }

  var update = function update(newVnode, context) {
    var changes = (0, _diff.diffNode)(oldVnode, newVnode, rootId);
    node = changes.reduce(dom.updateElement(dispatch, context), node);
    oldVnode = newVnode;
    return node;
  };

  var create = function create(vnode, context) {
    node = dom.createElement(vnode, rootId, dispatch, context);
    if (container) container.appendChild(node);
    oldVnode = vnode;
    return node;
  };

  return function (vnode) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return node !== null ? update(vnode, context) : create(vnode, context);
  };
}