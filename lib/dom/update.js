'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertAtIndex = undefined;
exports.updateElement = updateElement;

var _setAttribute2 = require('./setAttribute');

var _element = require('../element');

var _diff = require('../diff');

var _reduceArray = require('@f/reduce-array');

var _reduceArray2 = _interopRequireDefault(_reduceArray);

var _create = require('./create');

var _toArray = require('@f/to-array');

var _toArray2 = _interopRequireDefault(_toArray);

var _foreach = require('@f/foreach');

var _foreach2 = _interopRequireDefault(_foreach);

var _noop = require('@f/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Modify a DOM element given an array of actions.
 */

function updateElement(dispatch, context) {
  return function (DOMElement, action) {
    _diff.Actions.case({
      sameNode: _noop2.default,
      setAttribute: function setAttribute(name, value, previousValue) {
        (0, _setAttribute2.setAttribute)(DOMElement, name, value, previousValue);
      },
      removeAttribute: function removeAttribute(name, previousValue) {
        (0, _setAttribute2.removeAttribute)(DOMElement, name, previousValue);
      },
      insertBefore: function insertBefore(index) {
        insertAtIndex(DOMElement.parentNode, index, DOMElement);
      },
      updateChildren: function updateChildren(changes) {
        _updateChildren(DOMElement, changes, dispatch, context);
      },
      updateThunk: function updateThunk(prev, next, path) {
        DOMElement = _updateThunk(DOMElement, prev, next, path, dispatch, context);
      },
      replaceNode: function replaceNode(prev, next, path) {
        var newEl = (0, _create.createElement)(next, path, dispatch, context);
        var parentEl = DOMElement.parentNode;
        if (parentEl) parentEl.replaceChild(newEl, DOMElement);
        DOMElement = newEl;
        removeThunks(prev, dispatch);
      },
      removeNode: function removeNode(prev) {
        removeThunks(prev);
        DOMElement.parentNode.removeChild(DOMElement);
        DOMElement = null;
      }
    }, action);

    return DOMElement;
  };
}

/**
 * Update all the children of a DOMElement using an array of actions
 */

function _updateChildren(DOMElement, changes, dispatch, context) {
  // Create a clone of the children so we can reference them later
  // using their original position even if they move around
  var childNodes = (0, _toArray2.default)(DOMElement.childNodes);
  changes.forEach(function (change) {
    _diff.Actions.case({
      insertChild: function insertChild(vnode, index, path) {
        insertAtIndex(DOMElement, index, (0, _create.createElement)(vnode, path, dispatch, context));
      },
      removeChild: function removeChild(index) {
        DOMElement.removeChild(childNodes[index]);
      },
      updateChild: function updateChild(index, actions) {
        var _update = updateElement(dispatch, context);
        actions.forEach(function (action) {
          return _update(childNodes[index], action);
        });
      }
    }, change);
  });
}

/**
 * Update a thunk and only re-render the subtree if needed.
 */

function _updateThunk(DOMElement, prev, next, path, dispatch, context) {
  var props = next.props;
  var children = next.children;
  var onUpdate = next.options.onUpdate;

  var prevNode = prev.state.vnode;
  var model = {
    children: children,
    props: props,
    path: path,
    dispatch: dispatch,
    context: context
  };
  var nextNode = next.fn(model);
  var changes = (0, _diff.diffNode)(prevNode, nextNode, (0, _element.createPath)(path, '0'));
  DOMElement = (0, _reduceArray2.default)(updateElement(dispatch, context), DOMElement, changes);
  if (onUpdate) dispatch(onUpdate(model));
  next.state = {
    vnode: nextNode,
    model: model
  };
  return DOMElement;
}

/**
 * Recursively remove all thunks
 */

function removeThunks(vnode, dispatch) {
  while ((0, _element.isThunk)(vnode)) {
    var onRemove = vnode.options.onRemove;
    var model = vnode.state.model;

    if (onRemove) dispatch(onRemove(model));
    vnode = vnode.state.vnode;
  }
  if (vnode.children) {
    (0, _foreach2.default)(vnode.children, function (child) {
      return removeThunks(child, dispatch);
    });
  }
}

/**
 * Slightly nicer insertBefore
 */

var insertAtIndex = exports.insertAtIndex = function insertAtIndex(parent, index, el) {
  var target = parent.childNodes[index];
  if (target) {
    parent.insertBefore(el, target);
  } else {
    parent.appendChild(el);
  }
};