'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = createElement;

var _createElement = require('@f/create-element');

var _createElement2 = _interopRequireDefault(_createElement);

var _element = require('../element');

var _setAttribute = require('./setAttribute');

var _isUndefined = require('@f/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isString = require('@f/is-string');

var _isString2 = _interopRequireDefault(_isString);

var _isNumber = require('@f/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isNull = require('@f/is-null');

var _isNull2 = _interopRequireDefault(_isNull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = {};

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

function createElement(vnode, path, dispatch, context) {
  switch (vnode.type) {
    case 'text':
      return createTextNode(vnode.nodeValue);
    case 'empty':
      return getCachedElement('noscript');
    case 'thunk':
      return createThunk(vnode, path, dispatch, context);
    case 'native':
      return createHTMLElement(vnode, path, dispatch, context);
  }
}

function getCachedElement(type) {
  var cached = cache[type];
  if ((0, _isUndefined2.default)(cached)) {
    cached = cache[type] = (0, _createElement2.default)(type);
  }
  return cached.cloneNode(false);
}

function createTextNode(text) {
  var value = (0, _isString2.default)(text) || (0, _isNumber2.default)(text) ? text : '';
  return document.createTextNode(value);
}

function createThunk(vnode, path, dispatch, context) {
  var props = vnode.props;
  var children = vnode.children;
  var onCreate = vnode.options.onCreate;

  var model = {
    children: children,
    props: props,
    path: path,
    dispatch: dispatch,
    context: context
  };
  var output = vnode.fn(model);
  var childPath = (0, _element.createPath)(path, output.key || '0');
  var DOMElement = createElement(output, childPath, dispatch, context);
  if (onCreate) dispatch(onCreate(model));
  vnode.state = {
    vnode: output,
    model: model
  };
  return DOMElement;
}

function createHTMLElement(vnode, path, dispatch, context) {
  var tagName = vnode.tagName;
  var attributes = vnode.attributes;
  var children = vnode.children;

  var DOMElement = getCachedElement(tagName);

  for (var name in attributes) {
    (0, _setAttribute.setAttribute)(DOMElement, name, attributes[name]);
  }

  children.forEach(function (node, index) {
    if ((0, _isNull2.default)(node) || (0, _isUndefined2.default)(node)) return;
    var childPath = (0, _element.createPath)(path, node.key || index);
    var child = createElement(node, childPath, dispatch, context);
    DOMElement.appendChild(child);
  });

  return DOMElement;
}