'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderString = renderString;

var _isValidAttr = require('@f/is-valid-attr');

var _isValidAttr2 = _interopRequireDefault(_isValidAttr);

var _isNull = require('@f/is-null');

var _isNull2 = _interopRequireDefault(_isNull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Turn an object of key/value pairs into a HTML attribute string. This
 * function is responsible for what attributes are allowed to be rendered and
 * should handle any other special cases specific to deku.
 */

function attributesToString(attributes) {
  var str = '';
  for (var name in attributes) {
    var value = attributes[name];
    if (name === 'innerHTML') continue;
    if ((0, _isValidAttr2.default)(value)) str += ' ' + name + '="' + attributes[name] + '"';
  }
  return str;
}

/**
 * Render a virtual element to a string. You can pass in an option state context
 * object that will be given to all components.
 */

function renderString(vnode, context) {
  var path = arguments.length <= 2 || arguments[2] === undefined ? '0' : arguments[2];

  switch (vnode.type) {
    case 'text':
      return renderTextNode(vnode);
    case 'empty':
      return renderEmptyNode();
    case 'thunk':
      return renderThunk(vnode, path, context);
    case 'native':
      return renderHTML(vnode, path, context);
  }
}

function renderTextNode(vnode) {
  return vnode.nodeValue;
}

function renderEmptyNode() {
  return '<noscript></noscript>';
}

function renderThunk(vnode, path, context) {
  var props = vnode.props;
  var children = vnode.children;

  var output = vnode.fn({ children: children, props: props, path: path, context: context });
  return renderString(output, context, path);
}

function renderHTML(vnode, path, context) {
  var attributes = vnode.attributes;
  var tagName = vnode.tagName;
  var children = vnode.children;

  var innerHTML = attributes.innerHTML;
  var str = '<' + tagName + attributesToString(attributes) + '>';

  if (innerHTML) {
    str += innerHTML;
  } else {
    str += children.map(function (child, i) {
      return renderString(child, context, path + '.' + ((0, _isNull2.default)(child.key) ? i : child.key));
    }).join('');
  }

  str += '</' + tagName + '>';
  return str;
}