'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPath = exports.groupByKey = exports.isSameThunk = exports.isNative = exports.isEmpty = exports.isText = exports.isThunk = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.create = create;
exports.createTextElement = createTextElement;
exports.createEmptyElement = createEmptyElement;
exports.createThunkElement = createThunkElement;

var _isUndefined = require('@f/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _reduceArray = require('@f/reduce-array');

var _reduceArray2 = _interopRequireDefault(_reduceArray);

var _isString = require('@f/is-string');

var _isString2 = _interopRequireDefault(_isString);

var _isNumber = require('@f/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isNull = require('@f/is-null');

var _isNull2 = _interopRequireDefault(_isNull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' },
 *     element('span', {}, 'Google'),
 *     element('b', {}, 'Link')
 *   )
 * ])
 */

function create(type, attributes) {
  for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  if (!type) throw new TypeError('element() needs a type.');
  attributes = attributes || {};
  children = (0, _reduceArray2.default)(reduceChildren, [], children || []);

  var key = (0, _isString2.default)(attributes.key) || (0, _isNumber2.default)(attributes.key) ? attributes.key : null;

  delete attributes.key;

  if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {
    return createThunkElement(type.render, key, attributes, children, type);
  }

  if (typeof type === 'function') {
    return createThunkElement(type, key, attributes, children, type);
  }

  return {
    type: 'native',
    tagName: type,
    attributes: attributes,
    children: children,
    key: key
  };
}

/**
 * Cleans up the array of child elements.
 * - Flattens nested arrays
 * - Converts raw strings and numbers into vnodes
 * - Filters out undefined elements
 */

function reduceChildren(children, vnode) {
  if ((0, _isString2.default)(vnode) || (0, _isNumber2.default)(vnode)) {
    children.push(createTextElement(vnode));
  } else if ((0, _isNull2.default)(vnode)) {
    children.push(createEmptyElement());
  } else if (Array.isArray(vnode)) {
    children = [].concat(_toConsumableArray(children), _toConsumableArray(vnode.reduce(reduceChildren, [])));
  } else if ((0, _isUndefined2.default)(vnode)) {
    throw new Error('vnode can\'t be undefined. Did you mean to use null?');
  } else {
    children.push(vnode);
  }
  return children;
}

/**
 * Text nodes are stored as objects to keep things simple
 */

function createTextElement(text) {
  return {
    type: 'text',
    nodeValue: text
  };
}

/**
 * Text nodes are stored as objects to keep things simple
 */

function createEmptyElement() {
  return {
    type: 'empty'
  };
}

/**
 * Lazily-rendered virtual nodes
 */

function createThunkElement(fn, key, props, children, options) {
  return {
    type: 'thunk',
    fn: fn,
    children: children,
    props: props,
    options: options,
    key: key
  };
}

/**
 * Functional type checking
 */

var isThunk = exports.isThunk = function isThunk(node) {
  return node.type === 'thunk';
};

var isText = exports.isText = function isText(node) {
  return node.type === 'text';
};

var isEmpty = exports.isEmpty = function isEmpty(node) {
  return node.type === 'empty';
};

var isNative = exports.isNative = function isNative(node) {
  return node.type === 'native';
};

var isSameThunk = exports.isSameThunk = function isSameThunk(left, right) {
  return isThunk(left) && isThunk(right) && left.fn === right.fn;
};

/**
 * Group an array of virtual elements by their key, using index as a fallback.
 */

var groupByKey = exports.groupByKey = function groupByKey(children) {
  var iterator = function iterator(acc, child, i) {
    if (!(0, _isUndefined2.default)(child) && child !== false) {
      var key = (0, _isNull2.default)(child) ? i : child.key || i;
      acc.push({
        key: String(key),
        item: child,
        index: i
      });
    }
    return acc;
  };

  return (0, _reduceArray2.default)(iterator, [], children);
};

/**
 * Create a node path, eg. (23,5,2,4) => '23.5.2.4'
 */

var createPath = exports.createPath = function createPath() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return args.join('.');
};