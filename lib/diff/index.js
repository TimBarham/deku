'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Actions = undefined;
exports.diffAttributes = diffAttributes;
exports.diffChildren = diffChildren;
exports.diffNode = diffNode;

var _element = require('../element');

var _dift = require('dift');

var diffActions = _interopRequireWildcard(_dift);

var _isUndefined = require('@f/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isNull = require('@f/is-null');

var _isNull2 = _interopRequireDefault(_isNull);

var _unionType = require('union-type');

var _unionType2 = _interopRequireDefault(_unionType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Any = function Any() {
  return true;
};
var Path = function Path() {
  return String;
};

/**
 * Patch actions
 */

var Actions = exports.Actions = (0, _unionType2.default)({
  setAttribute: [String, Any, Any],
  removeAttribute: [String, Any],
  insertChild: [Any, Number, Path],
  removeChild: [Number],
  updateChild: [Number, Array],
  updateChildren: [Array],
  insertBefore: [Number],
  replaceNode: [Any, Any, Path],
  removeNode: [Any],
  sameNode: [],
  updateThunk: [Any, Any, Path]
});

/**
 * Diff two attribute objects and return an array of actions that represent
 * changes to transform the old object into the new one.
 */

function diffAttributes(previous, next) {
  var setAttribute = Actions.setAttribute;
  var removeAttribute = Actions.removeAttribute;

  var changes = [];
  var pAttrs = previous.attributes;
  var nAttrs = next.attributes;

  for (var name in nAttrs) {
    if (nAttrs[name] !== pAttrs[name]) {
      changes.push(setAttribute(name, nAttrs[name], pAttrs[name]));
    }
  }

  for (var _name in pAttrs) {
    if (!(_name in nAttrs)) {
      changes.push(removeAttribute(_name, pAttrs[_name]));
    }
  }

  return changes;
}

/**
 * Compare two arrays of virtual nodes and return an array of actions
 * to transform the left into the right. A starting path is supplied that use
 * recursively to build up unique paths for each node.
 */

function diffChildren(previous, next, parentPath) {
  var insertChild = Actions.insertChild;
  var updateChild = Actions.updateChild;
  var removeChild = Actions.removeChild;
  var insertBefore = Actions.insertBefore;
  var updateChildren = Actions.updateChildren;
  var CREATE = diffActions.CREATE;
  var UPDATE = diffActions.UPDATE;
  var MOVE = diffActions.MOVE;
  var REMOVE = diffActions.REMOVE;

  var previousChildren = (0, _element.groupByKey)(previous.children);
  var nextChildren = (0, _element.groupByKey)(next.children);
  var key = function key(a) {
    return a.key;
  };
  var changes = [];

  function effect(type, prev, next, pos) {
    var nextPath = next ? (0, _element.createPath)(parentPath, next.key == null ? next.index : next.key) : null;
    switch (type) {
      case CREATE:
        {
          changes.push(insertChild(next.item, pos, nextPath));
          break;
        }
      case UPDATE:
        {
          var actions = diffNode(prev.item, next.item, nextPath);
          if (actions.length > 0) {
            changes.push(updateChild(prev.index, actions));
          }
          break;
        }
      case MOVE:
        {
          var _actions = diffNode(prev.item, next.item, nextPath);
          _actions.push(insertBefore(pos));
          changes.push(updateChild(prev.index, _actions));
          break;
        }
      case REMOVE:
        {
          changes.push(removeChild(prev.index));
          break;
        }
    }
  }

  (0, diffActions.default)(previousChildren, nextChildren, effect, key);

  return changes.length ? updateChildren(changes) : changes;
}

/**
 * Compare two virtual nodes and return an array of changes to turn the left
 * into the right.
 */

function diffNode(prev, next, path) {
  var replaceNode = Actions.replaceNode;
  var setAttribute = Actions.setAttribute;
  var sameNode = Actions.sameNode;
  var removeNode = Actions.removeNode;
  var updateThunk = Actions.updateThunk;

  // No left node to compare it to
  // TODO: This should just return a createNode action

  if ((0, _isUndefined2.default)(prev)) {
    throw new Error('Left node must not be null or undefined');
  }

  // Bail out and skip updating this whole sub-tree
  if (prev === next) {
    return [sameNode()];
  }

  // Remove
  if (!(0, _isUndefined2.default)(prev) && (0, _isUndefined2.default)(next)) {
    return [removeNode(prev)];
  }

  // Replace with empty
  if (!(0, _isNull2.default)(prev) && (0, _isNull2.default)(next) || (0, _isNull2.default)(prev) && !(0, _isNull2.default)(next)) {
    return [replaceNode(prev, next, path)];
  }

  // Replace
  if (prev.type !== next.type) {
    return [replaceNode(prev, next, path)];
  }

  // Native
  if ((0, _element.isNative)(next)) {
    if (prev.tagName !== next.tagName) {
      return [replaceNode(prev, next, path)];
    }
    var changes = diffAttributes(prev, next);
    var childrenDiff = diffChildren(prev, next, path);
    if (childrenDiff.length) {
      changes.push(childrenDiff);
    }
    return changes;
  }

  // Text
  if ((0, _element.isText)(next)) {
    var _changes = [];
    if (prev.nodeValue !== next.nodeValue) {
      _changes.push(setAttribute('nodeValue', next.nodeValue, prev.nodeValue));
    }
    return _changes;
  }

  // Thunk
  if ((0, _element.isThunk)(next)) {
    var _changes2 = [];
    if ((0, _element.isSameThunk)(prev, next)) {
      _changes2.push(updateThunk(prev, next, path));
    } else {
      _changes2.push(replaceNode(prev, next, path));
    }
    return _changes2;
  }

  // Empty
  if ((0, _element.isEmpty)(next)) {
    return [];
  }

  return [];
}