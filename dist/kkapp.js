/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/alpinejs/dist/module.esm.js":
/*!**************************************************!*\
  !*** ./node_modules/alpinejs/dist/module.esm.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alpine: () => (/* binding */ src_default),
/* harmony export */   "default": () => (/* binding */ module_default)
/* harmony export */ });
// packages/alpinejs/src/scheduler.js
var flushPending = false;
var flushing = false;
var queue = [];
var lastFlushedIndex = -1;
function scheduler(callback) {
  queueJob(callback);
}
function queueJob(job) {
  if (!queue.includes(job))
    queue.push(job);
  queueFlush();
}
function dequeueJob(job) {
  let index = queue.indexOf(job);
  if (index !== -1 && index > lastFlushedIndex)
    queue.splice(index, 1);
}
function queueFlush() {
  if (!flushing && !flushPending) {
    flushPending = true;
    queueMicrotask(flushJobs);
  }
}
function flushJobs() {
  flushPending = false;
  flushing = true;
  for (let i = 0; i < queue.length; i++) {
    queue[i]();
    lastFlushedIndex = i;
  }
  queue.length = 0;
  lastFlushedIndex = -1;
  flushing = false;
}

// packages/alpinejs/src/reactivity.js
var reactive;
var effect;
var release;
var raw;
var shouldSchedule = true;
function disableEffectScheduling(callback) {
  shouldSchedule = false;
  callback();
  shouldSchedule = true;
}
function setReactivityEngine(engine) {
  reactive = engine.reactive;
  release = engine.release;
  effect = (callback) => engine.effect(callback, { scheduler: (task) => {
    if (shouldSchedule) {
      scheduler(task);
    } else {
      task();
    }
  } });
  raw = engine.raw;
}
function overrideEffect(override) {
  effect = override;
}
function elementBoundEffect(el) {
  let cleanup2 = () => {
  };
  let wrappedEffect = (callback) => {
    let effectReference = effect(callback);
    if (!el._x_effects) {
      el._x_effects = /* @__PURE__ */ new Set();
      el._x_runEffects = () => {
        el._x_effects.forEach((i) => i());
      };
    }
    el._x_effects.add(effectReference);
    cleanup2 = () => {
      if (effectReference === void 0)
        return;
      el._x_effects.delete(effectReference);
      release(effectReference);
    };
    return effectReference;
  };
  return [wrappedEffect, () => {
    cleanup2();
  }];
}
function watch(getter, callback) {
  let firstTime = true;
  let oldValue;
  let effectReference = effect(() => {
    let value = getter();
    JSON.stringify(value);
    if (!firstTime) {
      queueMicrotask(() => {
        callback(value, oldValue);
        oldValue = value;
      });
    } else {
      oldValue = value;
    }
    firstTime = false;
  });
  return () => release(effectReference);
}

// packages/alpinejs/src/utils/dispatch.js
function dispatch(el, name, detail = {}) {
  el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      // Allows events to pass the shadow DOM barrier.
      composed: true,
      cancelable: true
    })
  );
}

// packages/alpinejs/src/utils/walk.js
function walk(el, callback) {
  if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
    Array.from(el.children).forEach((el2) => walk(el2, callback));
    return;
  }
  let skip = false;
  callback(el, () => skip = true);
  if (skip)
    return;
  let node = el.firstElementChild;
  while (node) {
    walk(node, callback, false);
    node = node.nextElementSibling;
  }
}

// packages/alpinejs/src/utils/warn.js
function warn(message, ...args) {
  console.warn(`Alpine Warning: ${message}`, ...args);
}

// packages/alpinejs/src/lifecycle.js
var started = false;
function start() {
  if (started)
    warn("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.");
  started = true;
  if (!document.body)
    warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
  dispatch(document, "alpine:init");
  dispatch(document, "alpine:initializing");
  startObservingMutations();
  onElAdded((el) => initTree(el, walk));
  onElRemoved((el) => destroyTree(el));
  onAttributesAdded((el, attrs) => {
    directives(el, attrs).forEach((handle) => handle());
  });
  let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
  Array.from(document.querySelectorAll(allSelectors().join(","))).filter(outNestedComponents).forEach((el) => {
    initTree(el);
  });
  dispatch(document, "alpine:initialized");
}
var rootSelectorCallbacks = [];
var initSelectorCallbacks = [];
function rootSelectors() {
  return rootSelectorCallbacks.map((fn) => fn());
}
function allSelectors() {
  return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
}
function addRootSelector(selectorCallback) {
  rootSelectorCallbacks.push(selectorCallback);
}
function addInitSelector(selectorCallback) {
  initSelectorCallbacks.push(selectorCallback);
}
function closestRoot(el, includeInitSelectors = false) {
  return findClosest(el, (element) => {
    const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
    if (selectors.some((selector) => element.matches(selector)))
      return true;
  });
}
function findClosest(el, callback) {
  if (!el)
    return;
  if (callback(el))
    return el;
  if (el._x_teleportBack)
    el = el._x_teleportBack;
  if (!el.parentElement)
    return;
  return findClosest(el.parentElement, callback);
}
function isRoot(el) {
  return rootSelectors().some((selector) => el.matches(selector));
}
var initInterceptors = [];
function interceptInit(callback) {
  initInterceptors.push(callback);
}
function initTree(el, walker = walk, intercept = () => {
}) {
  deferHandlingDirectives(() => {
    walker(el, (el2, skip) => {
      intercept(el2, skip);
      initInterceptors.forEach((i) => i(el2, skip));
      directives(el2, el2.attributes).forEach((handle) => handle());
      el2._x_ignore && skip();
    });
  });
}
function destroyTree(root) {
  walk(root, (el) => {
    cleanupAttributes(el);
    cleanupElement(el);
  });
}

// packages/alpinejs/src/mutation.js
var onAttributeAddeds = [];
var onElRemoveds = [];
var onElAddeds = [];
function onElAdded(callback) {
  onElAddeds.push(callback);
}
function onElRemoved(el, callback) {
  if (typeof callback === "function") {
    if (!el._x_cleanups)
      el._x_cleanups = [];
    el._x_cleanups.push(callback);
  } else {
    callback = el;
    onElRemoveds.push(callback);
  }
}
function onAttributesAdded(callback) {
  onAttributeAddeds.push(callback);
}
function onAttributeRemoved(el, name, callback) {
  if (!el._x_attributeCleanups)
    el._x_attributeCleanups = {};
  if (!el._x_attributeCleanups[name])
    el._x_attributeCleanups[name] = [];
  el._x_attributeCleanups[name].push(callback);
}
function cleanupAttributes(el, names) {
  if (!el._x_attributeCleanups)
    return;
  Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
    if (names === void 0 || names.includes(name)) {
      value.forEach((i) => i());
      delete el._x_attributeCleanups[name];
    }
  });
}
function cleanupElement(el) {
  if (el._x_cleanups) {
    while (el._x_cleanups.length)
      el._x_cleanups.pop()();
  }
}
var observer = new MutationObserver(onMutate);
var currentlyObserving = false;
function startObservingMutations() {
  observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
  currentlyObserving = true;
}
function stopObservingMutations() {
  flushObserver();
  observer.disconnect();
  currentlyObserving = false;
}
var queuedMutations = [];
function flushObserver() {
  let records = observer.takeRecords();
  queuedMutations.push(() => records.length > 0 && onMutate(records));
  let queueLengthWhenTriggered = queuedMutations.length;
  queueMicrotask(() => {
    if (queuedMutations.length === queueLengthWhenTriggered) {
      while (queuedMutations.length > 0)
        queuedMutations.shift()();
    }
  });
}
function mutateDom(callback) {
  if (!currentlyObserving)
    return callback();
  stopObservingMutations();
  let result = callback();
  startObservingMutations();
  return result;
}
var isCollecting = false;
var deferredMutations = [];
function deferMutations() {
  isCollecting = true;
}
function flushAndStopDeferringMutations() {
  isCollecting = false;
  onMutate(deferredMutations);
  deferredMutations = [];
}
function onMutate(mutations) {
  if (isCollecting) {
    deferredMutations = deferredMutations.concat(mutations);
    return;
  }
  let addedNodes = /* @__PURE__ */ new Set();
  let removedNodes = /* @__PURE__ */ new Set();
  let addedAttributes = /* @__PURE__ */ new Map();
  let removedAttributes = /* @__PURE__ */ new Map();
  for (let i = 0; i < mutations.length; i++) {
    if (mutations[i].target._x_ignoreMutationObserver)
      continue;
    if (mutations[i].type === "childList") {
      mutations[i].addedNodes.forEach((node) => node.nodeType === 1 && addedNodes.add(node));
      mutations[i].removedNodes.forEach((node) => node.nodeType === 1 && removedNodes.add(node));
    }
    if (mutations[i].type === "attributes") {
      let el = mutations[i].target;
      let name = mutations[i].attributeName;
      let oldValue = mutations[i].oldValue;
      let add2 = () => {
        if (!addedAttributes.has(el))
          addedAttributes.set(el, []);
        addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
      };
      let remove = () => {
        if (!removedAttributes.has(el))
          removedAttributes.set(el, []);
        removedAttributes.get(el).push(name);
      };
      if (el.hasAttribute(name) && oldValue === null) {
        add2();
      } else if (el.hasAttribute(name)) {
        remove();
        add2();
      } else {
        remove();
      }
    }
  }
  removedAttributes.forEach((attrs, el) => {
    cleanupAttributes(el, attrs);
  });
  addedAttributes.forEach((attrs, el) => {
    onAttributeAddeds.forEach((i) => i(el, attrs));
  });
  for (let node of removedNodes) {
    if (addedNodes.has(node))
      continue;
    onElRemoveds.forEach((i) => i(node));
    destroyTree(node);
  }
  addedNodes.forEach((node) => {
    node._x_ignoreSelf = true;
    node._x_ignore = true;
  });
  for (let node of addedNodes) {
    if (removedNodes.has(node))
      continue;
    if (!node.isConnected)
      continue;
    delete node._x_ignoreSelf;
    delete node._x_ignore;
    onElAddeds.forEach((i) => i(node));
    node._x_ignore = true;
    node._x_ignoreSelf = true;
  }
  addedNodes.forEach((node) => {
    delete node._x_ignoreSelf;
    delete node._x_ignore;
  });
  addedNodes = null;
  removedNodes = null;
  addedAttributes = null;
  removedAttributes = null;
}

// packages/alpinejs/src/scope.js
function scope(node) {
  return mergeProxies(closestDataStack(node));
}
function addScopeToNode(node, data2, referenceNode) {
  node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
  return () => {
    node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
  };
}
function closestDataStack(node) {
  if (node._x_dataStack)
    return node._x_dataStack;
  if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
    return closestDataStack(node.host);
  }
  if (!node.parentNode) {
    return [];
  }
  return closestDataStack(node.parentNode);
}
function mergeProxies(objects) {
  return new Proxy({ objects }, mergeProxyTrap);
}
var mergeProxyTrap = {
  ownKeys({ objects }) {
    return Array.from(
      new Set(objects.flatMap((i) => Object.keys(i)))
    );
  },
  has({ objects }, name) {
    if (name == Symbol.unscopables)
      return false;
    return objects.some(
      (obj) => Object.prototype.hasOwnProperty.call(obj, name)
    );
  },
  get({ objects }, name, thisProxy) {
    if (name == "toJSON")
      return collapseProxies;
    return Reflect.get(
      objects.find(
        (obj) => Object.prototype.hasOwnProperty.call(obj, name)
      ) || {},
      name,
      thisProxy
    );
  },
  set({ objects }, name, value, thisProxy) {
    const target = objects.find(
      (obj) => Object.prototype.hasOwnProperty.call(obj, name)
    ) || objects[objects.length - 1];
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (descriptor?.set && descriptor?.get)
      return Reflect.set(target, name, value, thisProxy);
    return Reflect.set(target, name, value);
  }
};
function collapseProxies() {
  let keys = Reflect.ownKeys(this);
  return keys.reduce((acc, key) => {
    acc[key] = Reflect.get(this, key);
    return acc;
  }, {});
}

// packages/alpinejs/src/interceptor.js
function initInterceptors2(data2) {
  let isObject2 = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
  let recurse = (obj, basePath = "") => {
    Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value, enumerable }]) => {
      if (enumerable === false || value === void 0)
        return;
      let path = basePath === "" ? key : `${basePath}.${key}`;
      if (typeof value === "object" && value !== null && value._x_interceptor) {
        obj[key] = value.initialize(data2, path, key);
      } else {
        if (isObject2(value) && value !== obj && !(value instanceof Element)) {
          recurse(value, path);
        }
      }
    });
  };
  return recurse(data2);
}
function interceptor(callback, mutateObj = () => {
}) {
  let obj = {
    initialValue: void 0,
    _x_interceptor: true,
    initialize(data2, path, key) {
      return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key);
    }
  };
  mutateObj(obj);
  return (initialValue) => {
    if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
      let initialize = obj.initialize.bind(obj);
      obj.initialize = (data2, path, key) => {
        let innerValue = initialValue.initialize(data2, path, key);
        obj.initialValue = innerValue;
        return initialize(data2, path, key);
      };
    } else {
      obj.initialValue = initialValue;
    }
    return obj;
  };
}
function get(obj, path) {
  return path.split(".").reduce((carry, segment) => carry[segment], obj);
}
function set(obj, path, value) {
  if (typeof path === "string")
    path = path.split(".");
  if (path.length === 1)
    obj[path[0]] = value;
  else if (path.length === 0)
    throw error;
  else {
    if (obj[path[0]])
      return set(obj[path[0]], path.slice(1), value);
    else {
      obj[path[0]] = {};
      return set(obj[path[0]], path.slice(1), value);
    }
  }
}

// packages/alpinejs/src/magics.js
var magics = {};
function magic(name, callback) {
  magics[name] = callback;
}
function injectMagics(obj, el) {
  Object.entries(magics).forEach(([name, callback]) => {
    let memoizedUtilities = null;
    function getUtilities() {
      if (memoizedUtilities) {
        return memoizedUtilities;
      } else {
        let [utilities, cleanup2] = getElementBoundUtilities(el);
        memoizedUtilities = { interceptor, ...utilities };
        onElRemoved(el, cleanup2);
        return memoizedUtilities;
      }
    }
    Object.defineProperty(obj, `$${name}`, {
      get() {
        return callback(el, getUtilities());
      },
      enumerable: false
    });
  });
  return obj;
}

// packages/alpinejs/src/utils/error.js
function tryCatch(el, expression, callback, ...args) {
  try {
    return callback(...args);
  } catch (e) {
    handleError(e, el, expression);
  }
}
function handleError(error2, el, expression = void 0) {
  error2 = Object.assign(
    error2 ?? { message: "No error message given." },
    { el, expression }
  );
  console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ""}`, el);
  setTimeout(() => {
    throw error2;
  }, 0);
}

// packages/alpinejs/src/evaluator.js
var shouldAutoEvaluateFunctions = true;
function dontAutoEvaluateFunctions(callback) {
  let cache = shouldAutoEvaluateFunctions;
  shouldAutoEvaluateFunctions = false;
  let result = callback();
  shouldAutoEvaluateFunctions = cache;
  return result;
}
function evaluate(el, expression, extras = {}) {
  let result;
  evaluateLater(el, expression)((value) => result = value, extras);
  return result;
}
function evaluateLater(...args) {
  return theEvaluatorFunction(...args);
}
var theEvaluatorFunction = normalEvaluator;
function setEvaluator(newEvaluator) {
  theEvaluatorFunction = newEvaluator;
}
function normalEvaluator(el, expression) {
  let overriddenMagics = {};
  injectMagics(overriddenMagics, el);
  let dataStack = [overriddenMagics, ...closestDataStack(el)];
  let evaluator = typeof expression === "function" ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);
  return tryCatch.bind(null, el, expression, evaluator);
}
function generateEvaluatorFromFunction(dataStack, func) {
  return (receiver = () => {
  }, { scope: scope2 = {}, params = [] } = {}) => {
    let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
    runIfTypeOfFunction(receiver, result);
  };
}
var evaluatorMemo = {};
function generateFunctionFromString(expression, el) {
  if (evaluatorMemo[expression]) {
    return evaluatorMemo[expression];
  }
  let AsyncFunction = Object.getPrototypeOf(async function() {
  }).constructor;
  let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(async()=>{ ${expression} })()` : expression;
  const safeAsyncFunction = () => {
    try {
      let func2 = new AsyncFunction(
        ["__self", "scope"],
        `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`
      );
      Object.defineProperty(func2, "name", {
        value: `[Alpine] ${expression}`
      });
      return func2;
    } catch (error2) {
      handleError(error2, el, expression);
      return Promise.resolve();
    }
  };
  let func = safeAsyncFunction();
  evaluatorMemo[expression] = func;
  return func;
}
function generateEvaluatorFromString(dataStack, expression, el) {
  let func = generateFunctionFromString(expression, el);
  return (receiver = () => {
  }, { scope: scope2 = {}, params = [] } = {}) => {
    func.result = void 0;
    func.finished = false;
    let completeScope = mergeProxies([scope2, ...dataStack]);
    if (typeof func === "function") {
      let promise = func(func, completeScope).catch((error2) => handleError(error2, el, expression));
      if (func.finished) {
        runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
        func.result = void 0;
      } else {
        promise.then((result) => {
          runIfTypeOfFunction(receiver, result, completeScope, params, el);
        }).catch((error2) => handleError(error2, el, expression)).finally(() => func.result = void 0);
      }
    }
  };
}
function runIfTypeOfFunction(receiver, value, scope2, params, el) {
  if (shouldAutoEvaluateFunctions && typeof value === "function") {
    let result = value.apply(scope2, params);
    if (result instanceof Promise) {
      result.then((i) => runIfTypeOfFunction(receiver, i, scope2, params)).catch((error2) => handleError(error2, el, value));
    } else {
      receiver(result);
    }
  } else if (typeof value === "object" && value instanceof Promise) {
    value.then((i) => receiver(i));
  } else {
    receiver(value);
  }
}

// packages/alpinejs/src/directives.js
var prefixAsString = "x-";
function prefix(subject = "") {
  return prefixAsString + subject;
}
function setPrefix(newPrefix) {
  prefixAsString = newPrefix;
}
var directiveHandlers = {};
function directive(name, callback) {
  directiveHandlers[name] = callback;
  return {
    before(directive2) {
      if (!directiveHandlers[directive2]) {
        console.warn(String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`);
        return;
      }
      const pos = directiveOrder.indexOf(directive2);
      directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf("DEFAULT"), 0, name);
    }
  };
}
function directives(el, attributes, originalAttributeOverride) {
  attributes = Array.from(attributes);
  if (el._x_virtualDirectives) {
    let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(vAttributes);
    vAttributes = vAttributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`
        };
      }
      return attribute;
    });
    attributes = attributes.concat(vAttributes);
  }
  let transformedAttributeMap = {};
  let directives2 = attributes.map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
  return directives2.map((directive2) => {
    return getDirectiveHandler(el, directive2);
  });
}
function attributesOnly(attributes) {
  return Array.from(attributes).map(toTransformedAttributes()).filter((attr) => !outNonAlpineAttributes(attr));
}
var isDeferringHandlers = false;
var directiveHandlerStacks = /* @__PURE__ */ new Map();
var currentHandlerStackKey = Symbol();
function deferHandlingDirectives(callback) {
  isDeferringHandlers = true;
  let key = Symbol();
  currentHandlerStackKey = key;
  directiveHandlerStacks.set(key, []);
  let flushHandlers = () => {
    while (directiveHandlerStacks.get(key).length)
      directiveHandlerStacks.get(key).shift()();
    directiveHandlerStacks.delete(key);
  };
  let stopDeferring = () => {
    isDeferringHandlers = false;
    flushHandlers();
  };
  callback(flushHandlers);
  stopDeferring();
}
function getElementBoundUtilities(el) {
  let cleanups = [];
  let cleanup2 = (callback) => cleanups.push(callback);
  let [effect3, cleanupEffect] = elementBoundEffect(el);
  cleanups.push(cleanupEffect);
  let utilities = {
    Alpine: alpine_default,
    effect: effect3,
    cleanup: cleanup2,
    evaluateLater: evaluateLater.bind(evaluateLater, el),
    evaluate: evaluate.bind(evaluate, el)
  };
  let doCleanup = () => cleanups.forEach((i) => i());
  return [utilities, doCleanup];
}
function getDirectiveHandler(el, directive2) {
  let noop = () => {
  };
  let handler4 = directiveHandlers[directive2.type] || noop;
  let [utilities, cleanup2] = getElementBoundUtilities(el);
  onAttributeRemoved(el, directive2.original, cleanup2);
  let fullHandler = () => {
    if (el._x_ignore || el._x_ignoreSelf)
      return;
    handler4.inline && handler4.inline(el, directive2, utilities);
    handler4 = handler4.bind(handler4, el, directive2, utilities);
    isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
  };
  fullHandler.runCleanups = cleanup2;
  return fullHandler;
}
var startingWith = (subject, replacement) => ({ name, value }) => {
  if (name.startsWith(subject))
    name = name.replace(subject, replacement);
  return { name, value };
};
var into = (i) => i;
function toTransformedAttributes(callback = () => {
}) {
  return ({ name, value }) => {
    let { name: newName, value: newValue } = attributeTransformers.reduce((carry, transform) => {
      return transform(carry);
    }, { name, value });
    if (newName !== name)
      callback(newName, name);
    return { name: newName, value: newValue };
  };
}
var attributeTransformers = [];
function mapAttributes(callback) {
  attributeTransformers.push(callback);
}
function outNonAlpineAttributes({ name }) {
  return alpineAttributeRegex().test(name);
}
var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
  return ({ name, value }) => {
    let typeMatch = name.match(alpineAttributeRegex());
    let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
    let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
    let original = originalAttributeOverride || transformedAttributeMap[name] || name;
    return {
      type: typeMatch ? typeMatch[1] : null,
      value: valueMatch ? valueMatch[1] : null,
      modifiers: modifiers.map((i) => i.replace(".", "")),
      expression: value,
      original
    };
  };
}
var DEFAULT = "DEFAULT";
var directiveOrder = [
  "ignore",
  "ref",
  "data",
  "id",
  "anchor",
  "bind",
  "init",
  "for",
  "model",
  "modelable",
  "transition",
  "show",
  "if",
  DEFAULT,
  "teleport"
];
function byPriority(a, b) {
  let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
  let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
  return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
}

// packages/alpinejs/src/nextTick.js
var tickStack = [];
var isHolding = false;
function nextTick(callback = () => {
}) {
  queueMicrotask(() => {
    isHolding || setTimeout(() => {
      releaseNextTicks();
    });
  });
  return new Promise((res) => {
    tickStack.push(() => {
      callback();
      res();
    });
  });
}
function releaseNextTicks() {
  isHolding = false;
  while (tickStack.length)
    tickStack.shift()();
}
function holdNextTicks() {
  isHolding = true;
}

// packages/alpinejs/src/utils/classes.js
function setClasses(el, value) {
  if (Array.isArray(value)) {
    return setClassesFromString(el, value.join(" "));
  } else if (typeof value === "object" && value !== null) {
    return setClassesFromObject(el, value);
  } else if (typeof value === "function") {
    return setClasses(el, value());
  }
  return setClassesFromString(el, value);
}
function setClassesFromString(el, classString) {
  let split = (classString2) => classString2.split(" ").filter(Boolean);
  let missingClasses = (classString2) => classString2.split(" ").filter((i) => !el.classList.contains(i)).filter(Boolean);
  let addClassesAndReturnUndo = (classes) => {
    el.classList.add(...classes);
    return () => {
      el.classList.remove(...classes);
    };
  };
  classString = classString === true ? classString = "" : classString || "";
  return addClassesAndReturnUndo(missingClasses(classString));
}
function setClassesFromObject(el, classObject) {
  let split = (classString) => classString.split(" ").filter(Boolean);
  let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? split(classString) : false).filter(Boolean);
  let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? split(classString) : false).filter(Boolean);
  let added = [];
  let removed = [];
  forRemove.forEach((i) => {
    if (el.classList.contains(i)) {
      el.classList.remove(i);
      removed.push(i);
    }
  });
  forAdd.forEach((i) => {
    if (!el.classList.contains(i)) {
      el.classList.add(i);
      added.push(i);
    }
  });
  return () => {
    removed.forEach((i) => el.classList.add(i));
    added.forEach((i) => el.classList.remove(i));
  };
}

// packages/alpinejs/src/utils/styles.js
function setStyles(el, value) {
  if (typeof value === "object" && value !== null) {
    return setStylesFromObject(el, value);
  }
  return setStylesFromString(el, value);
}
function setStylesFromObject(el, value) {
  let previousStyles = {};
  Object.entries(value).forEach(([key, value2]) => {
    previousStyles[key] = el.style[key];
    if (!key.startsWith("--")) {
      key = kebabCase(key);
    }
    el.style.setProperty(key, value2);
  });
  setTimeout(() => {
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  });
  return () => {
    setStyles(el, previousStyles);
  };
}
function setStylesFromString(el, value) {
  let cache = el.getAttribute("style", value);
  el.setAttribute("style", value);
  return () => {
    el.setAttribute("style", cache || "");
  };
}
function kebabCase(subject) {
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// packages/alpinejs/src/utils/once.js
function once(callback, fallback = () => {
}) {
  let called = false;
  return function() {
    if (!called) {
      called = true;
      callback.apply(this, arguments);
    } else {
      fallback.apply(this, arguments);
    }
  };
}

// packages/alpinejs/src/directives/x-transition.js
directive("transition", (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "function")
    expression = evaluate2(expression);
  if (expression === false)
    return;
  if (!expression || typeof expression === "boolean") {
    registerTransitionsFromHelper(el, modifiers, value);
  } else {
    registerTransitionsFromClassString(el, expression, value);
  }
});
function registerTransitionsFromClassString(el, classString, stage) {
  registerTransitionObject(el, setClasses, "");
  let directiveStorageMap = {
    "enter": (classes) => {
      el._x_transition.enter.during = classes;
    },
    "enter-start": (classes) => {
      el._x_transition.enter.start = classes;
    },
    "enter-end": (classes) => {
      el._x_transition.enter.end = classes;
    },
    "leave": (classes) => {
      el._x_transition.leave.during = classes;
    },
    "leave-start": (classes) => {
      el._x_transition.leave.start = classes;
    },
    "leave-end": (classes) => {
      el._x_transition.leave.end = classes;
    }
  };
  directiveStorageMap[stage](classString);
}
function registerTransitionsFromHelper(el, modifiers, stage) {
  registerTransitionObject(el, setStyles);
  let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
  let transitioningIn = doesntSpecify || modifiers.includes("in") || ["enter"].includes(stage);
  let transitioningOut = doesntSpecify || modifiers.includes("out") || ["leave"].includes(stage);
  if (modifiers.includes("in") && !doesntSpecify) {
    modifiers = modifiers.filter((i, index) => index < modifiers.indexOf("out"));
  }
  if (modifiers.includes("out") && !doesntSpecify) {
    modifiers = modifiers.filter((i, index) => index > modifiers.indexOf("out"));
  }
  let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
  let wantsOpacity = wantsAll || modifiers.includes("opacity");
  let wantsScale = wantsAll || modifiers.includes("scale");
  let opacityValue = wantsOpacity ? 0 : 1;
  let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
  let delay = modifierValue(modifiers, "delay", 0) / 1e3;
  let origin = modifierValue(modifiers, "origin", "center");
  let property = "opacity, transform";
  let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
  let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
  let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
  if (transitioningIn) {
    el._x_transition.enter.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationIn}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.enter.start = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
    el._x_transition.enter.end = {
      opacity: 1,
      transform: `scale(1)`
    };
  }
  if (transitioningOut) {
    el._x_transition.leave.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationOut}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.leave.start = {
      opacity: 1,
      transform: `scale(1)`
    };
    el._x_transition.leave.end = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
  }
}
function registerTransitionObject(el, setFunction, defaultValue = {}) {
  if (!el._x_transition)
    el._x_transition = {
      enter: { during: defaultValue, start: defaultValue, end: defaultValue },
      leave: { during: defaultValue, start: defaultValue, end: defaultValue },
      in(before = () => {
      }, after = () => {
      }) {
        transition(el, setFunction, {
          during: this.enter.during,
          start: this.enter.start,
          end: this.enter.end
        }, before, after);
      },
      out(before = () => {
      }, after = () => {
      }) {
        transition(el, setFunction, {
          during: this.leave.during,
          start: this.leave.start,
          end: this.leave.end
        }, before, after);
      }
    };
}
window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
  const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
  let clickAwayCompatibleShow = () => nextTick2(show);
  if (value) {
    if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
      el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
    } else {
      el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
    }
    return;
  }
  el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
    el._x_transition.out(() => {
    }, () => resolve(hide));
    el._x_transitioning && el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
  }) : Promise.resolve(hide);
  queueMicrotask(() => {
    let closest = closestHide(el);
    if (closest) {
      if (!closest._x_hideChildren)
        closest._x_hideChildren = [];
      closest._x_hideChildren.push(el);
    } else {
      nextTick2(() => {
        let hideAfterChildren = (el2) => {
          let carry = Promise.all([
            el2._x_hidePromise,
            ...(el2._x_hideChildren || []).map(hideAfterChildren)
          ]).then(([i]) => i());
          delete el2._x_hidePromise;
          delete el2._x_hideChildren;
          return carry;
        };
        hideAfterChildren(el).catch((e) => {
          if (!e.isFromCancelledTransition)
            throw e;
        });
      });
    }
  });
};
function closestHide(el) {
  let parent = el.parentNode;
  if (!parent)
    return;
  return parent._x_hidePromise ? parent : closestHide(parent);
}
function transition(el, setFunction, { during, start: start2, end } = {}, before = () => {
}, after = () => {
}) {
  if (el._x_transitioning)
    el._x_transitioning.cancel();
  if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
    before();
    after();
    return;
  }
  let undoStart, undoDuring, undoEnd;
  performTransition(el, {
    start() {
      undoStart = setFunction(el, start2);
    },
    during() {
      undoDuring = setFunction(el, during);
    },
    before,
    end() {
      undoStart();
      undoEnd = setFunction(el, end);
    },
    after,
    cleanup() {
      undoDuring();
      undoEnd();
    }
  });
}
function performTransition(el, stages) {
  let interrupted, reachedBefore, reachedEnd;
  let finish = once(() => {
    mutateDom(() => {
      interrupted = true;
      if (!reachedBefore)
        stages.before();
      if (!reachedEnd) {
        stages.end();
        releaseNextTicks();
      }
      stages.after();
      if (el.isConnected)
        stages.cleanup();
      delete el._x_transitioning;
    });
  });
  el._x_transitioning = {
    beforeCancels: [],
    beforeCancel(callback) {
      this.beforeCancels.push(callback);
    },
    cancel: once(function() {
      while (this.beforeCancels.length) {
        this.beforeCancels.shift()();
      }
      ;
      finish();
    }),
    finish
  };
  mutateDom(() => {
    stages.start();
    stages.during();
  });
  holdNextTicks();
  requestAnimationFrame(() => {
    if (interrupted)
      return;
    let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
    let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
    if (duration === 0)
      duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
    mutateDom(() => {
      stages.before();
    });
    reachedBefore = true;
    requestAnimationFrame(() => {
      if (interrupted)
        return;
      mutateDom(() => {
        stages.end();
      });
      releaseNextTicks();
      setTimeout(el._x_transitioning.finish, duration + delay);
      reachedEnd = true;
    });
  });
}
function modifierValue(modifiers, key, fallback) {
  if (modifiers.indexOf(key) === -1)
    return fallback;
  const rawValue = modifiers[modifiers.indexOf(key) + 1];
  if (!rawValue)
    return fallback;
  if (key === "scale") {
    if (isNaN(rawValue))
      return fallback;
  }
  if (key === "duration" || key === "delay") {
    let match = rawValue.match(/([0-9]+)ms/);
    if (match)
      return match[1];
  }
  if (key === "origin") {
    if (["top", "right", "left", "center", "bottom"].includes(modifiers[modifiers.indexOf(key) + 2])) {
      return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(" ");
    }
  }
  return rawValue;
}

// packages/alpinejs/src/clone.js
var isCloning = false;
function skipDuringClone(callback, fallback = () => {
}) {
  return (...args) => isCloning ? fallback(...args) : callback(...args);
}
function onlyDuringClone(callback) {
  return (...args) => isCloning && callback(...args);
}
var interceptors = [];
function interceptClone(callback) {
  interceptors.push(callback);
}
function cloneNode(from, to) {
  interceptors.forEach((i) => i(from, to));
  isCloning = true;
  dontRegisterReactiveSideEffects(() => {
    initTree(to, (el, callback) => {
      callback(el, () => {
      });
    });
  });
  isCloning = false;
}
var isCloningLegacy = false;
function clone(oldEl, newEl) {
  if (!newEl._x_dataStack)
    newEl._x_dataStack = oldEl._x_dataStack;
  isCloning = true;
  isCloningLegacy = true;
  dontRegisterReactiveSideEffects(() => {
    cloneTree(newEl);
  });
  isCloning = false;
  isCloningLegacy = false;
}
function cloneTree(el) {
  let hasRunThroughFirstEl = false;
  let shallowWalker = (el2, callback) => {
    walk(el2, (el3, skip) => {
      if (hasRunThroughFirstEl && isRoot(el3))
        return skip();
      hasRunThroughFirstEl = true;
      callback(el3, skip);
    });
  };
  initTree(el, shallowWalker);
}
function dontRegisterReactiveSideEffects(callback) {
  let cache = effect;
  overrideEffect((callback2, el) => {
    let storedEffect = cache(callback2);
    release(storedEffect);
    return () => {
    };
  });
  callback();
  overrideEffect(cache);
}

// packages/alpinejs/src/utils/bind.js
function bind(el, name, value, modifiers = []) {
  if (!el._x_bindings)
    el._x_bindings = reactive({});
  el._x_bindings[name] = value;
  name = modifiers.includes("camel") ? camelCase(name) : name;
  switch (name) {
    case "value":
      bindInputValue(el, value);
      break;
    case "style":
      bindStyles(el, value);
      break;
    case "class":
      bindClasses(el, value);
      break;
    case "selected":
    case "checked":
      bindAttributeAndProperty(el, name, value);
      break;
    default:
      bindAttribute(el, name, value);
      break;
  }
}
function bindInputValue(el, value) {
  if (el.type === "radio") {
    if (el.attributes.value === void 0) {
      el.value = value;
    }
    if (window.fromModel) {
      if (typeof value === "boolean") {
        el.checked = safeParseBoolean(el.value) === value;
      } else {
        el.checked = checkedAttrLooseCompare(el.value, value);
      }
    }
  } else if (el.type === "checkbox") {
    if (Number.isInteger(value)) {
      el.value = value;
    } else if (!Array.isArray(value) && typeof value !== "boolean" && ![null, void 0].includes(value)) {
      el.value = String(value);
    } else {
      if (Array.isArray(value)) {
        el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
      } else {
        el.checked = !!value;
      }
    }
  } else if (el.tagName === "SELECT") {
    updateSelect(el, value);
  } else {
    if (el.value === value)
      return;
    el.value = value === void 0 ? "" : value;
  }
}
function bindClasses(el, value) {
  if (el._x_undoAddedClasses)
    el._x_undoAddedClasses();
  el._x_undoAddedClasses = setClasses(el, value);
}
function bindStyles(el, value) {
  if (el._x_undoAddedStyles)
    el._x_undoAddedStyles();
  el._x_undoAddedStyles = setStyles(el, value);
}
function bindAttributeAndProperty(el, name, value) {
  bindAttribute(el, name, value);
  setPropertyIfChanged(el, name, value);
}
function bindAttribute(el, name, value) {
  if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
    el.removeAttribute(name);
  } else {
    if (isBooleanAttr(name))
      value = name;
    setIfChanged(el, name, value);
  }
}
function setIfChanged(el, attrName, value) {
  if (el.getAttribute(attrName) != value) {
    el.setAttribute(attrName, value);
  }
}
function setPropertyIfChanged(el, propName, value) {
  if (el[propName] !== value) {
    el[propName] = value;
  }
}
function updateSelect(el, value) {
  const arrayWrappedValue = [].concat(value).map((value2) => {
    return value2 + "";
  });
  Array.from(el.options).forEach((option) => {
    option.selected = arrayWrappedValue.includes(option.value);
  });
}
function camelCase(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function checkedAttrLooseCompare(valueA, valueB) {
  return valueA == valueB;
}
function safeParseBoolean(rawValue) {
  if ([1, "1", "true", "on", "yes", true].includes(rawValue)) {
    return true;
  }
  if ([0, "0", "false", "off", "no", false].includes(rawValue)) {
    return false;
  }
  return rawValue ? Boolean(rawValue) : null;
}
function isBooleanAttr(attrName) {
  const booleanAttributes = [
    "disabled",
    "checked",
    "required",
    "readonly",
    "hidden",
    "open",
    "selected",
    "autofocus",
    "itemscope",
    "multiple",
    "novalidate",
    "allowfullscreen",
    "allowpaymentrequest",
    "formnovalidate",
    "autoplay",
    "controls",
    "loop",
    "muted",
    "playsinline",
    "default",
    "ismap",
    "reversed",
    "async",
    "defer",
    "nomodule"
  ];
  return booleanAttributes.includes(attrName);
}
function attributeShouldntBePreservedIfFalsy(name) {
  return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(name);
}
function getBinding(el, name, fallback) {
  if (el._x_bindings && el._x_bindings[name] !== void 0)
    return el._x_bindings[name];
  return getAttributeBinding(el, name, fallback);
}
function extractProp(el, name, fallback, extract = true) {
  if (el._x_bindings && el._x_bindings[name] !== void 0)
    return el._x_bindings[name];
  if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
    let binding = el._x_inlineBindings[name];
    binding.extract = extract;
    return dontAutoEvaluateFunctions(() => {
      return evaluate(el, binding.expression);
    });
  }
  return getAttributeBinding(el, name, fallback);
}
function getAttributeBinding(el, name, fallback) {
  let attr = el.getAttribute(name);
  if (attr === null)
    return typeof fallback === "function" ? fallback() : fallback;
  if (attr === "")
    return true;
  if (isBooleanAttr(name)) {
    return !![name, "true"].includes(attr);
  }
  return attr;
}

// packages/alpinejs/src/utils/debounce.js
function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// packages/alpinejs/src/utils/throttle.js
function throttle(func, limit) {
  let inThrottle;
  return function() {
    let context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// packages/alpinejs/src/entangle.js
function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
  let firstRun = true;
  let outerHash;
  let innerHash;
  let reference = effect(() => {
    let outer = outerGet();
    let inner = innerGet();
    if (firstRun) {
      innerSet(cloneIfObject(outer));
      firstRun = false;
    } else {
      let outerHashLatest = JSON.stringify(outer);
      let innerHashLatest = JSON.stringify(inner);
      if (outerHashLatest !== outerHash) {
        innerSet(cloneIfObject(outer));
      } else if (outerHashLatest !== innerHashLatest) {
        outerSet(cloneIfObject(inner));
      } else {
      }
    }
    outerHash = JSON.stringify(outerGet());
    innerHash = JSON.stringify(innerGet());
  });
  return () => {
    release(reference);
  };
}
function cloneIfObject(value) {
  return typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}

// packages/alpinejs/src/plugin.js
function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];
  callbacks.forEach((i) => i(alpine_default));
}

// packages/alpinejs/src/store.js
var stores = {};
var isReactive = false;
function store(name, value) {
  if (!isReactive) {
    stores = reactive(stores);
    isReactive = true;
  }
  if (value === void 0) {
    return stores[name];
  }
  stores[name] = value;
  if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
    stores[name].init();
  }
  initInterceptors2(stores[name]);
}
function getStores() {
  return stores;
}

// packages/alpinejs/src/binds.js
var binds = {};
function bind2(name, bindings) {
  let getBindings = typeof bindings !== "function" ? () => bindings : bindings;
  if (name instanceof Element) {
    return applyBindingsObject(name, getBindings());
  } else {
    binds[name] = getBindings;
  }
  return () => {
  };
}
function injectBindingProviders(obj) {
  Object.entries(binds).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback(...args);
        };
      }
    });
  });
  return obj;
}
function applyBindingsObject(el, obj, original) {
  let cleanupRunners = [];
  while (cleanupRunners.length)
    cleanupRunners.pop()();
  let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
  let staticAttributes = attributesOnly(attributes);
  attributes = attributes.map((attribute) => {
    if (staticAttributes.find((attr) => attr.name === attribute.name)) {
      return {
        name: `x-bind:${attribute.name}`,
        value: `"${attribute.value}"`
      };
    }
    return attribute;
  });
  directives(el, attributes, original).map((handle) => {
    cleanupRunners.push(handle.runCleanups);
    handle();
  });
  return () => {
    while (cleanupRunners.length)
      cleanupRunners.pop()();
  };
}

// packages/alpinejs/src/datas.js
var datas = {};
function data(name, callback) {
  datas[name] = callback;
}
function injectDataProviders(obj, context) {
  Object.entries(datas).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback.bind(context)(...args);
        };
      },
      enumerable: false
    });
  });
  return obj;
}

// packages/alpinejs/src/alpine.js
var Alpine = {
  get reactive() {
    return reactive;
  },
  get release() {
    return release;
  },
  get effect() {
    return effect;
  },
  get raw() {
    return raw;
  },
  version: "3.13.5",
  flushAndStopDeferringMutations,
  dontAutoEvaluateFunctions,
  disableEffectScheduling,
  startObservingMutations,
  stopObservingMutations,
  setReactivityEngine,
  onAttributeRemoved,
  onAttributesAdded,
  closestDataStack,
  skipDuringClone,
  onlyDuringClone,
  addRootSelector,
  addInitSelector,
  interceptClone,
  addScopeToNode,
  deferMutations,
  mapAttributes,
  evaluateLater,
  interceptInit,
  setEvaluator,
  mergeProxies,
  extractProp,
  findClosest,
  onElRemoved,
  closestRoot,
  destroyTree,
  interceptor,
  // INTERNAL: not public API and is subject to change without major release.
  transition,
  // INTERNAL
  setStyles,
  // INTERNAL
  mutateDom,
  directive,
  entangle,
  throttle,
  debounce,
  evaluate,
  initTree,
  nextTick,
  prefixed: prefix,
  prefix: setPrefix,
  plugin,
  magic,
  store,
  start,
  clone,
  // INTERNAL
  cloneNode,
  // INTERNAL
  bound: getBinding,
  $data: scope,
  watch,
  walk,
  data,
  bind: bind2
};
var alpine_default = Alpine;

// node_modules/@vue/shared/dist/shared.esm-bundler.js
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr2 = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
var EMPTY_OBJ =  true ? Object.freeze({}) : 0;
var EMPTY_ARR =  true ? Object.freeze([]) : 0;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
var camelizeRE = /-(\w)/g;
var camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
var toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var targetMap = /* @__PURE__ */ new WeakMap();
var effectStack = [];
var activeEffect;
var ITERATE_KEY = Symbol( true ? "iterate" : 0);
var MAP_KEY_ITERATE_KEY = Symbol( true ? "Map key iterate" : 0);
function isEffect(fn) {
  return fn && fn._isEffect === true;
}
function effect2(fn, options = EMPTY_OBJ) {
  if (isEffect(fn)) {
    fn = fn.raw;
  }
  const effect3 = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect3();
  }
  return effect3;
}
function stop(effect3) {
  if (effect3.active) {
    cleanup(effect3);
    if (effect3.options.onStop) {
      effect3.options.onStop();
    }
    effect3.active = false;
  }
}
var uid = 0;
function createReactiveEffect(fn, options) {
  const effect3 = function reactiveEffect() {
    if (!effect3.active) {
      return fn();
    }
    if (!effectStack.includes(effect3)) {
      cleanup(effect3);
      try {
        enableTracking();
        effectStack.push(effect3);
        activeEffect = effect3;
        return fn();
      } finally {
        effectStack.pop();
        resetTracking();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect3.id = uid++;
  effect3.allowRecurse = !!options.allowRecurse;
  effect3._isEffect = true;
  effect3.active = true;
  effect3.raw = fn;
  effect3.deps = [];
  effect3.options = options;
  return effect3;
}
function cleanup(effect3) {
  const { deps } = effect3;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect3);
    }
    deps.length = 0;
  }
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (!shouldTrack || activeEffect === void 0) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Set());
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    if (activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      });
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const effects = /* @__PURE__ */ new Set();
  const add2 = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect3) => {
        if (effect3 !== activeEffect || effect3.allowRecurse) {
          effects.add(effect3);
        }
      });
    }
  };
  if (type === "clear") {
    depsMap.forEach(add2);
  } else if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
        add2(dep);
      }
    });
  } else {
    if (key !== void 0) {
      add2(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          add2(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          add2(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          add2(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          add2(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  const run = (effect3) => {
    if (effect3.options.onTrigger) {
      effect3.options.onTrigger({
        effect: effect3,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      });
    }
    if (effect3.options.scheduler) {
      effect3.options.scheduler(effect3);
    } else {
      effect3();
    }
  };
  effects.forEach(run);
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
var get2 = /* @__PURE__ */ createGetter();
var readonlyGet = /* @__PURE__ */ createGetter(true);
var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function createGetter(isReadonly = false, shallow = false) {
  return function get3(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly;
    } else if (key === "__v_isReadonly") {
      return isReadonly;
    } else if (key === "__v_raw" && receiver === (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
      return shouldUnwrap ? res.value : res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive2(res);
    }
    return res;
  };
}
var set2 = /* @__PURE__ */ createSetter();
function createSetter(shallow = false) {
  return function set3(target, key, value, receiver) {
    let oldValue = target[key];
    if (!shallow) {
      value = toRaw(value);
      oldValue = toRaw(oldValue);
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  const oldValue = target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function has(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys(target) {
  track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
var mutableHandlers = {
  get: get2,
  set: set2,
  deleteProperty,
  has,
  ownKeys
};
var readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    if (true) {
      console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  },
  deleteProperty(target, key) {
    if (true) {
      console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  }
};
var toReactive = (value) => isObject(value) ? reactive2(value) : value;
var toReadonly = (value) => isObject(value) ? readonly(value) : value;
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly = false, isShallow = false) {
  target = target[
    "__v_raw"
    /* RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly && track(rawTarget, "get", key);
  }
  !isReadonly && track(rawTarget, "get", rawKey);
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly = false) {
  const target = this[
    "__v_raw"
    /* RAW */
  ];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly && track(rawTarget, "has", key);
  }
  !isReadonly && track(rawTarget, "has", rawKey);
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
  target = target[
    "__v_raw"
    /* RAW */
  ];
  !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (true) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get3.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (true) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get3 ? get3.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget =  true ? isMap(target) ? new Map(target) : new Set(target) : 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly, isShallow) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly, isShallow) {
  return function(...args) {
    const target = this[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    if (true) {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
    }
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* CLEAR */
    ),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod(
      "add"
      /* ADD */
    ),
    set: createReadonlyMethod(
      "set"
      /* SET */
    ),
    delete: createReadonlyMethod(
      "delete"
      /* DELETE */
    ),
    clear: createReadonlyMethod(
      "clear"
      /* CLEAR */
    ),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
  const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly;
    } else if (key === "__v_isReadonly") {
      return isReadonly;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
function checkIdentityKeys(target, has2, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has2.call(target, rawKey)) {
    const type = toRawType(target);
    console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
  }
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value[
    "__v_skip"
    /* SKIP */
  ] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive2(target) {
  if (target && target[
    "__v_isReadonly"
    /* IS_READONLY */
  ]) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    if (true) {
      console.warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target[
    "__v_raw"
    /* RAW */
  ] && !(isReadonly && target[
    "__v_isReactive"
    /* IS_REACTIVE */
  ])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function toRaw(observed) {
  return observed && toRaw(observed[
    "__v_raw"
    /* RAW */
  ]) || observed;
}
function isRef(r) {
  return Boolean(r && r.__v_isRef === true);
}

// packages/alpinejs/src/magics/$nextTick.js
magic("nextTick", () => nextTick);

// packages/alpinejs/src/magics/$dispatch.js
magic("dispatch", (el) => dispatch.bind(dispatch, el));

// packages/alpinejs/src/magics/$watch.js
magic("watch", (el, { evaluateLater: evaluateLater2, cleanup: cleanup2 }) => (key, callback) => {
  let evaluate2 = evaluateLater2(key);
  let getter = () => {
    let value;
    evaluate2((i) => value = i);
    return value;
  };
  let unwatch = watch(getter, callback);
  cleanup2(unwatch);
});

// packages/alpinejs/src/magics/$store.js
magic("store", getStores);

// packages/alpinejs/src/magics/$data.js
magic("data", (el) => scope(el));

// packages/alpinejs/src/magics/$root.js
magic("root", (el) => closestRoot(el));

// packages/alpinejs/src/magics/$refs.js
magic("refs", (el) => {
  if (el._x_refs_proxy)
    return el._x_refs_proxy;
  el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
  return el._x_refs_proxy;
});
function getArrayOfRefObject(el) {
  let refObjects = [];
  let currentEl = el;
  while (currentEl) {
    if (currentEl._x_refs)
      refObjects.push(currentEl._x_refs);
    currentEl = currentEl.parentNode;
  }
  return refObjects;
}

// packages/alpinejs/src/ids.js
var globalIdMemo = {};
function findAndIncrementId(name) {
  if (!globalIdMemo[name])
    globalIdMemo[name] = 0;
  return ++globalIdMemo[name];
}
function closestIdRoot(el, name) {
  return findClosest(el, (element) => {
    if (element._x_ids && element._x_ids[name])
      return true;
  });
}
function setIdRoot(el, name) {
  if (!el._x_ids)
    el._x_ids = {};
  if (!el._x_ids[name])
    el._x_ids[name] = findAndIncrementId(name);
}

// packages/alpinejs/src/magics/$id.js
magic("id", (el, { cleanup: cleanup2 }) => (name, key = null) => {
  let cacheKey = `${name}${key ? `-${key}` : ""}`;
  return cacheIdByNameOnElement(el, cacheKey, cleanup2, () => {
    let root = closestIdRoot(el, name);
    let id = root ? root._x_ids[name] : findAndIncrementId(name);
    return key ? `${name}-${id}-${key}` : `${name}-${id}`;
  });
});
interceptClone((from, to) => {
  if (from._x_id) {
    to._x_id = from._x_id;
  }
});
function cacheIdByNameOnElement(el, cacheKey, cleanup2, callback) {
  if (!el._x_id)
    el._x_id = {};
  if (el._x_id[cacheKey])
    return el._x_id[cacheKey];
  let output = callback();
  el._x_id[cacheKey] = output;
  cleanup2(() => {
    delete el._x_id[cacheKey];
  });
  return output;
}

// packages/alpinejs/src/magics/$el.js
magic("el", (el) => el);

// packages/alpinejs/src/magics/index.js
warnMissingPluginMagic("Focus", "focus", "focus");
warnMissingPluginMagic("Persist", "persist", "persist");
function warnMissingPluginMagic(name, magicName, slug) {
  magic(magicName, (el) => warn(`You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}

// packages/alpinejs/src/directives/x-modelable.js
directive("modelable", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 }) => {
  let func = evaluateLater2(expression);
  let innerGet = () => {
    let result;
    func((i) => result = i);
    return result;
  };
  let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
  let innerSet = (val) => evaluateInnerSet(() => {
  }, { scope: { "__placeholder": val } });
  let initialValue = innerGet();
  innerSet(initialValue);
  queueMicrotask(() => {
    if (!el._x_model)
      return;
    el._x_removeModelListeners["default"]();
    let outerGet = el._x_model.get;
    let outerSet = el._x_model.set;
    let releaseEntanglement = entangle(
      {
        get() {
          return outerGet();
        },
        set(value) {
          outerSet(value);
        }
      },
      {
        get() {
          return innerGet();
        },
        set(value) {
          innerSet(value);
        }
      }
    );
    cleanup2(releaseEntanglement);
  });
});

// packages/alpinejs/src/directives/x-teleport.js
directive("teleport", (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-teleport can only be used on a <template> tag", el);
  let target = getTarget(expression);
  let clone2 = el.content.cloneNode(true).firstElementChild;
  el._x_teleport = clone2;
  clone2._x_teleportBack = el;
  el.setAttribute("data-teleport-template", true);
  clone2.setAttribute("data-teleport-target", true);
  if (el._x_forwardEvents) {
    el._x_forwardEvents.forEach((eventName) => {
      clone2.addEventListener(eventName, (e) => {
        e.stopPropagation();
        el.dispatchEvent(new e.constructor(e.type, e));
      });
    });
  }
  addScopeToNode(clone2, {}, el);
  let placeInDom = (clone3, target2, modifiers2) => {
    if (modifiers2.includes("prepend")) {
      target2.parentNode.insertBefore(clone3, target2);
    } else if (modifiers2.includes("append")) {
      target2.parentNode.insertBefore(clone3, target2.nextSibling);
    } else {
      target2.appendChild(clone3);
    }
  };
  mutateDom(() => {
    placeInDom(clone2, target, modifiers);
    initTree(clone2);
    clone2._x_ignore = true;
  });
  el._x_teleportPutBack = () => {
    let target2 = getTarget(expression);
    mutateDom(() => {
      placeInDom(el._x_teleport, target2, modifiers);
    });
  };
  cleanup2(() => clone2.remove());
});
var teleportContainerDuringClone = document.createElement("div");
function getTarget(expression) {
  let target = skipDuringClone(() => {
    return document.querySelector(expression);
  }, () => {
    return teleportContainerDuringClone;
  })();
  if (!target)
    warn(`Cannot find x-teleport element for selector: "${expression}"`);
  return target;
}

// packages/alpinejs/src/directives/x-ignore.js
var handler = () => {
};
handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
  modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
  cleanup2(() => {
    modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
  });
};
directive("ignore", handler);

// packages/alpinejs/src/directives/x-effect.js
directive("effect", skipDuringClone((el, { expression }, { effect: effect3 }) => {
  effect3(evaluateLater(el, expression));
}));

// packages/alpinejs/src/utils/on.js
function on(el, event, modifiers, callback) {
  let listenerTarget = el;
  let handler4 = (e) => callback(e);
  let options = {};
  let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
  if (modifiers.includes("dot"))
    event = dotSyntax(event);
  if (modifiers.includes("camel"))
    event = camelCase2(event);
  if (modifiers.includes("passive"))
    options.passive = true;
  if (modifiers.includes("capture"))
    options.capture = true;
  if (modifiers.includes("window"))
    listenerTarget = window;
  if (modifiers.includes("document"))
    listenerTarget = document;
  if (modifiers.includes("debounce")) {
    let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = debounce(handler4, wait);
  }
  if (modifiers.includes("throttle")) {
    let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = throttle(handler4, wait);
  }
  if (modifiers.includes("prevent"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.preventDefault();
      next(e);
    });
  if (modifiers.includes("stop"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.stopPropagation();
      next(e);
    });
  if (modifiers.includes("self"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.target === el && next(e);
    });
  if (modifiers.includes("away") || modifiers.includes("outside")) {
    listenerTarget = document;
    handler4 = wrapHandler(handler4, (next, e) => {
      if (el.contains(e.target))
        return;
      if (e.target.isConnected === false)
        return;
      if (el.offsetWidth < 1 && el.offsetHeight < 1)
        return;
      if (el._x_isShown === false)
        return;
      next(e);
    });
  }
  if (modifiers.includes("once")) {
    handler4 = wrapHandler(handler4, (next, e) => {
      next(e);
      listenerTarget.removeEventListener(event, handler4, options);
    });
  }
  handler4 = wrapHandler(handler4, (next, e) => {
    if (isKeyEvent(event)) {
      if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
        return;
      }
    }
    next(e);
  });
  listenerTarget.addEventListener(event, handler4, options);
  return () => {
    listenerTarget.removeEventListener(event, handler4, options);
  };
}
function dotSyntax(subject) {
  return subject.replace(/-/g, ".");
}
function camelCase2(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function isNumeric(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function kebabCase2(subject) {
  if ([" ", "_"].includes(
    subject
  ))
    return subject;
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
}
function isKeyEvent(event) {
  return ["keydown", "keyup"].includes(event);
}
function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
  let keyModifiers = modifiers.filter((i) => {
    return !["window", "document", "prevent", "stop", "once", "capture"].includes(i);
  });
  if (keyModifiers.includes("debounce")) {
    let debounceIndex = keyModifiers.indexOf("debounce");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.includes("throttle")) {
    let debounceIndex = keyModifiers.indexOf("throttle");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.length === 0)
    return false;
  if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
    return false;
  const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
  const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
  keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
  if (selectedSystemKeyModifiers.length > 0) {
    const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
      if (modifier === "cmd" || modifier === "super")
        modifier = "meta";
      return e[`${modifier}Key`];
    });
    if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
      if (keyToModifiers(e.key).includes(keyModifiers[0]))
        return false;
    }
  }
  return true;
}
function keyToModifiers(key) {
  if (!key)
    return [];
  key = kebabCase2(key);
  let modifierToKeyMap = {
    "ctrl": "control",
    "slash": "/",
    "space": " ",
    "spacebar": " ",
    "cmd": "meta",
    "esc": "escape",
    "up": "arrow-up",
    "down": "arrow-down",
    "left": "arrow-left",
    "right": "arrow-right",
    "period": ".",
    "equal": "=",
    "minus": "-",
    "underscore": "_"
  };
  modifierToKeyMap[key] = key;
  return Object.keys(modifierToKeyMap).map((modifier) => {
    if (modifierToKeyMap[modifier] === key)
      return modifier;
  }).filter((modifier) => modifier);
}

// packages/alpinejs/src/directives/x-model.js
directive("model", (el, { modifiers, expression }, { effect: effect3, cleanup: cleanup2 }) => {
  let scopeTarget = el;
  if (modifiers.includes("parent")) {
    scopeTarget = el.parentNode;
  }
  let evaluateGet = evaluateLater(scopeTarget, expression);
  let evaluateSet;
  if (typeof expression === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
  } else if (typeof expression === "function" && typeof expression() === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
  } else {
    evaluateSet = () => {
    };
  }
  let getValue = () => {
    let result;
    evaluateGet((value) => result = value);
    return isGetterSetter(result) ? result.get() : result;
  };
  let setValue = (value) => {
    let result;
    evaluateGet((value2) => result = value2);
    if (isGetterSetter(result)) {
      result.set(value);
    } else {
      evaluateSet(() => {
      }, {
        scope: { "__placeholder": value }
      });
    }
  };
  if (typeof expression === "string" && el.type === "radio") {
    mutateDom(() => {
      if (!el.hasAttribute("name"))
        el.setAttribute("name", expression);
    });
  }
  var event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) || modifiers.includes("lazy") ? "change" : "input";
  let removeListener = isCloning ? () => {
  } : on(el, event, modifiers, (e) => {
    setValue(getInputValue(el, modifiers, e, getValue()));
  });
  if (modifiers.includes("fill")) {
    if ([void 0, null, ""].includes(getValue()) || el.type === "checkbox" && Array.isArray(getValue())) {
      el.dispatchEvent(new Event(event, {}));
    }
  }
  if (!el._x_removeModelListeners)
    el._x_removeModelListeners = {};
  el._x_removeModelListeners["default"] = removeListener;
  cleanup2(() => el._x_removeModelListeners["default"]());
  if (el.form) {
    let removeResetListener = on(el.form, "reset", [], (e) => {
      nextTick(() => el._x_model && el._x_model.set(el.value));
    });
    cleanup2(() => removeResetListener());
  }
  el._x_model = {
    get() {
      return getValue();
    },
    set(value) {
      setValue(value);
    }
  };
  el._x_forceModelUpdate = (value) => {
    if (value === void 0 && typeof expression === "string" && expression.match(/\./))
      value = "";
    window.fromModel = true;
    mutateDom(() => bind(el, "value", value));
    delete window.fromModel;
  };
  effect3(() => {
    let value = getValue();
    if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el))
      return;
    el._x_forceModelUpdate(value);
  });
});
function getInputValue(el, modifiers, event, currentValue) {
  return mutateDom(() => {
    if (event instanceof CustomEvent && event.detail !== void 0)
      return event.detail !== null && event.detail !== void 0 ? event.detail : event.target.value;
    else if (el.type === "checkbox") {
      if (Array.isArray(currentValue)) {
        let newValue = null;
        if (modifiers.includes("number")) {
          newValue = safeParseNumber(event.target.value);
        } else if (modifiers.includes("boolean")) {
          newValue = safeParseBoolean(event.target.value);
        } else {
          newValue = event.target.value;
        }
        return event.target.checked ? currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
      } else {
        return event.target.checked;
      }
    } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
      if (modifiers.includes("number")) {
        return Array.from(event.target.selectedOptions).map((option) => {
          let rawValue = option.value || option.text;
          return safeParseNumber(rawValue);
        });
      } else if (modifiers.includes("boolean")) {
        return Array.from(event.target.selectedOptions).map((option) => {
          let rawValue = option.value || option.text;
          return safeParseBoolean(rawValue);
        });
      }
      return Array.from(event.target.selectedOptions).map((option) => {
        return option.value || option.text;
      });
    } else {
      if (modifiers.includes("number")) {
        return safeParseNumber(event.target.value);
      } else if (modifiers.includes("boolean")) {
        return safeParseBoolean(event.target.value);
      }
      return modifiers.includes("trim") ? event.target.value.trim() : event.target.value;
    }
  });
}
function safeParseNumber(rawValue) {
  let number = rawValue ? parseFloat(rawValue) : null;
  return isNumeric2(number) ? number : rawValue;
}
function checkedAttrLooseCompare2(valueA, valueB) {
  return valueA == valueB;
}
function isNumeric2(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function isGetterSetter(value) {
  return value !== null && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
}

// packages/alpinejs/src/directives/x-cloak.js
directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));

// packages/alpinejs/src/directives/x-init.js
addInitSelector(() => `[${prefix("init")}]`);
directive("init", skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "string") {
    return !!expression.trim() && evaluate2(expression, {}, false);
  }
  return evaluate2(expression, {}, false);
}));

// packages/alpinejs/src/directives/x-text.js
directive("text", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect3(() => {
    evaluate2((value) => {
      mutateDom(() => {
        el.textContent = value;
      });
    });
  });
});

// packages/alpinejs/src/directives/x-html.js
directive("html", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect3(() => {
    evaluate2((value) => {
      mutateDom(() => {
        el.innerHTML = value;
        el._x_ignoreSelf = true;
        initTree(el);
        delete el._x_ignoreSelf;
      });
    });
  });
});

// packages/alpinejs/src/directives/x-bind.js
mapAttributes(startingWith(":", into(prefix("bind:"))));
var handler2 = (el, { value, modifiers, expression, original }, { effect: effect3 }) => {
  if (!value) {
    let bindingProviders = {};
    injectBindingProviders(bindingProviders);
    let getBindings = evaluateLater(el, expression);
    getBindings((bindings) => {
      applyBindingsObject(el, bindings, original);
    }, { scope: bindingProviders });
    return;
  }
  if (value === "key")
    return storeKeyForXFor(el, expression);
  if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
    return;
  }
  let evaluate2 = evaluateLater(el, expression);
  effect3(() => evaluate2((result) => {
    if (result === void 0 && typeof expression === "string" && expression.match(/\./)) {
      result = "";
    }
    mutateDom(() => bind(el, value, result, modifiers));
  }));
};
handler2.inline = (el, { value, modifiers, expression }) => {
  if (!value)
    return;
  if (!el._x_inlineBindings)
    el._x_inlineBindings = {};
  el._x_inlineBindings[value] = { expression, extract: false };
};
directive("bind", handler2);
function storeKeyForXFor(el, expression) {
  el._x_keyExpression = expression;
}

// packages/alpinejs/src/directives/x-data.js
addRootSelector(() => `[${prefix("data")}]`);
directive("data", (el, { expression }, { cleanup: cleanup2 }) => {
  if (shouldSkipRegisteringDataDuringClone(el))
    return;
  expression = expression === "" ? "{}" : expression;
  let magicContext = {};
  injectMagics(magicContext, el);
  let dataProviderContext = {};
  injectDataProviders(dataProviderContext, magicContext);
  let data2 = evaluate(el, expression, { scope: dataProviderContext });
  if (data2 === void 0 || data2 === true)
    data2 = {};
  injectMagics(data2, el);
  let reactiveData = reactive(data2);
  initInterceptors2(reactiveData);
  let undo = addScopeToNode(el, reactiveData);
  reactiveData["init"] && evaluate(el, reactiveData["init"]);
  cleanup2(() => {
    reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
    undo();
  });
});
interceptClone((from, to) => {
  if (from._x_dataStack) {
    to._x_dataStack = from._x_dataStack;
    to.setAttribute("data-has-alpine-state", true);
  }
});
function shouldSkipRegisteringDataDuringClone(el) {
  if (!isCloning)
    return false;
  if (isCloningLegacy)
    return true;
  return el.hasAttribute("data-has-alpine-state");
}

// packages/alpinejs/src/directives/x-show.js
directive("show", (el, { modifiers, expression }, { effect: effect3 }) => {
  let evaluate2 = evaluateLater(el, expression);
  if (!el._x_doHide)
    el._x_doHide = () => {
      mutateDom(() => {
        el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
      });
    };
  if (!el._x_doShow)
    el._x_doShow = () => {
      mutateDom(() => {
        if (el.style.length === 1 && el.style.display === "none") {
          el.removeAttribute("style");
        } else {
          el.style.removeProperty("display");
        }
      });
    };
  let hide = () => {
    el._x_doHide();
    el._x_isShown = false;
  };
  let show = () => {
    el._x_doShow();
    el._x_isShown = true;
  };
  let clickAwayCompatibleShow = () => setTimeout(show);
  let toggle = once(
    (value) => value ? show() : hide(),
    (value) => {
      if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
        el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
      } else {
        value ? clickAwayCompatibleShow() : hide();
      }
    }
  );
  let oldValue;
  let firstTime = true;
  effect3(() => evaluate2((value) => {
    if (!firstTime && value === oldValue)
      return;
    if (modifiers.includes("immediate"))
      value ? clickAwayCompatibleShow() : hide();
    toggle(value);
    oldValue = value;
    firstTime = false;
  }));
});

// packages/alpinejs/src/directives/x-for.js
directive("for", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
  let iteratorNames = parseForExpression(expression);
  let evaluateItems = evaluateLater(el, iteratorNames.items);
  let evaluateKey = evaluateLater(
    el,
    // the x-bind:key expression is stored for our use instead of evaluated.
    el._x_keyExpression || "index"
  );
  el._x_prevKeys = [];
  el._x_lookup = {};
  effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
  cleanup2(() => {
    Object.values(el._x_lookup).forEach((el2) => el2.remove());
    delete el._x_prevKeys;
    delete el._x_lookup;
  });
});
function loop(el, iteratorNames, evaluateItems, evaluateKey) {
  let isObject2 = (i) => typeof i === "object" && !Array.isArray(i);
  let templateEl = el;
  evaluateItems((items) => {
    if (isNumeric3(items) && items >= 0) {
      items = Array.from(Array(items).keys(), (i) => i + 1);
    }
    if (items === void 0)
      items = [];
    let lookup = el._x_lookup;
    let prevKeys = el._x_prevKeys;
    let scopes = [];
    let keys = [];
    if (isObject2(items)) {
      items = Object.entries(items).map(([key, value]) => {
        let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
        evaluateKey((value2) => keys.push(value2), { scope: { index: key, ...scope2 } });
        scopes.push(scope2);
      });
    } else {
      for (let i = 0; i < items.length; i++) {
        let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
        evaluateKey((value) => keys.push(value), { scope: { index: i, ...scope2 } });
        scopes.push(scope2);
      }
    }
    let adds = [];
    let moves = [];
    let removes = [];
    let sames = [];
    for (let i = 0; i < prevKeys.length; i++) {
      let key = prevKeys[i];
      if (keys.indexOf(key) === -1)
        removes.push(key);
    }
    prevKeys = prevKeys.filter((key) => !removes.includes(key));
    let lastKey = "template";
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let prevIndex = prevKeys.indexOf(key);
      if (prevIndex === -1) {
        prevKeys.splice(i, 0, key);
        adds.push([lastKey, i]);
      } else if (prevIndex !== i) {
        let keyInSpot = prevKeys.splice(i, 1)[0];
        let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
        prevKeys.splice(i, 0, keyForSpot);
        prevKeys.splice(prevIndex, 0, keyInSpot);
        moves.push([keyInSpot, keyForSpot]);
      } else {
        sames.push(key);
      }
      lastKey = key;
    }
    for (let i = 0; i < removes.length; i++) {
      let key = removes[i];
      if (!!lookup[key]._x_effects) {
        lookup[key]._x_effects.forEach(dequeueJob);
      }
      lookup[key].remove();
      lookup[key] = null;
      delete lookup[key];
    }
    for (let i = 0; i < moves.length; i++) {
      let [keyInSpot, keyForSpot] = moves[i];
      let elInSpot = lookup[keyInSpot];
      let elForSpot = lookup[keyForSpot];
      let marker = document.createElement("div");
      mutateDom(() => {
        if (!elForSpot)
          warn(`x-for ":key" is undefined or invalid`, templateEl);
        elForSpot.after(marker);
        elInSpot.after(elForSpot);
        elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
        marker.before(elInSpot);
        elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
        marker.remove();
      });
      elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
    }
    for (let i = 0; i < adds.length; i++) {
      let [lastKey2, index] = adds[i];
      let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
      if (lastEl._x_currentIfEl)
        lastEl = lastEl._x_currentIfEl;
      let scope2 = scopes[index];
      let key = keys[index];
      let clone2 = document.importNode(templateEl.content, true).firstElementChild;
      let reactiveScope = reactive(scope2);
      addScopeToNode(clone2, reactiveScope, templateEl);
      clone2._x_refreshXForScope = (newScope) => {
        Object.entries(newScope).forEach(([key2, value]) => {
          reactiveScope[key2] = value;
        });
      };
      mutateDom(() => {
        lastEl.after(clone2);
        initTree(clone2);
      });
      if (typeof key === "object") {
        warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
      }
      lookup[key] = clone2;
    }
    for (let i = 0; i < sames.length; i++) {
      lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
    }
    templateEl._x_prevKeys = keys;
  });
}
function parseForExpression(expression) {
  let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  let stripParensRE = /^\s*\(|\)\s*$/g;
  let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  let inMatch = expression.match(forAliasRE);
  if (!inMatch)
    return;
  let res = {};
  res.items = inMatch[2].trim();
  let item = inMatch[1].replace(stripParensRE, "").trim();
  let iteratorMatch = item.match(forIteratorRE);
  if (iteratorMatch) {
    res.item = item.replace(forIteratorRE, "").trim();
    res.index = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.collection = iteratorMatch[2].trim();
    }
  } else {
    res.item = item;
  }
  return res;
}
function getIterationScopeVariables(iteratorNames, item, index, items) {
  let scopeVariables = {};
  if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
    let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
    names.forEach((name, i) => {
      scopeVariables[name] = item[i];
    });
  } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
    let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i) => i.trim());
    names.forEach((name) => {
      scopeVariables[name] = item[name];
    });
  } else {
    scopeVariables[iteratorNames.item] = item;
  }
  if (iteratorNames.index)
    scopeVariables[iteratorNames.index] = index;
  if (iteratorNames.collection)
    scopeVariables[iteratorNames.collection] = items;
  return scopeVariables;
}
function isNumeric3(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}

// packages/alpinejs/src/directives/x-ref.js
function handler3() {
}
handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
  let root = closestRoot(el);
  if (!root._x_refs)
    root._x_refs = {};
  root._x_refs[expression] = el;
  cleanup2(() => delete root._x_refs[expression]);
};
directive("ref", handler3);

// packages/alpinejs/src/directives/x-if.js
directive("if", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-if can only be used on a <template> tag", el);
  let evaluate2 = evaluateLater(el, expression);
  let show = () => {
    if (el._x_currentIfEl)
      return el._x_currentIfEl;
    let clone2 = el.content.cloneNode(true).firstElementChild;
    addScopeToNode(clone2, {}, el);
    mutateDom(() => {
      el.after(clone2);
      initTree(clone2);
    });
    el._x_currentIfEl = clone2;
    el._x_undoIf = () => {
      walk(clone2, (node) => {
        if (!!node._x_effects) {
          node._x_effects.forEach(dequeueJob);
        }
      });
      clone2.remove();
      delete el._x_currentIfEl;
    };
    return clone2;
  };
  let hide = () => {
    if (!el._x_undoIf)
      return;
    el._x_undoIf();
    delete el._x_undoIf;
  };
  effect3(() => evaluate2((value) => {
    value ? show() : hide();
  }));
  cleanup2(() => el._x_undoIf && el._x_undoIf());
});

// packages/alpinejs/src/directives/x-id.js
directive("id", (el, { expression }, { evaluate: evaluate2 }) => {
  let names = evaluate2(expression);
  names.forEach((name) => setIdRoot(el, name));
});
interceptClone((from, to) => {
  if (from._x_ids) {
    to._x_ids = from._x_ids;
  }
});

// packages/alpinejs/src/directives/x-on.js
mapAttributes(startingWith("@", into(prefix("on:"))));
directive("on", skipDuringClone((el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
  let evaluate2 = expression ? evaluateLater(el, expression) : () => {
  };
  if (el.tagName.toLowerCase() === "template") {
    if (!el._x_forwardEvents)
      el._x_forwardEvents = [];
    if (!el._x_forwardEvents.includes(value))
      el._x_forwardEvents.push(value);
  }
  let removeListener = on(el, value, modifiers, (e) => {
    evaluate2(() => {
    }, { scope: { "$event": e }, params: [e] });
  });
  cleanup2(() => removeListener());
}));

// packages/alpinejs/src/directives/index.js
warnMissingPluginDirective("Collapse", "collapse", "collapse");
warnMissingPluginDirective("Intersect", "intersect", "intersect");
warnMissingPluginDirective("Focus", "trap", "focus");
warnMissingPluginDirective("Mask", "mask", "mask");
function warnMissingPluginDirective(name, directiveName, slug) {
  directive(directiveName, (el) => warn(`You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}

// packages/alpinejs/src/index.js
alpine_default.setEvaluator(normalEvaluator);
alpine_default.setReactivityEngine({ reactive: reactive2, effect: effect2, release: stop, raw: toRaw });
var src_default = alpine_default;

// packages/alpinejs/builds/module.js
var module_default = src_default;



/***/ }),

/***/ "./src/initAlpine.js":
/*!***************************!*\
  !*** ./src/initAlpine.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var alpinejs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alpinejs */ "./node_modules/alpinejs/dist/module.esm.js");
/* harmony import */ var _widget_html__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../widget.html */ "./widget.html");
/* harmony import */ var _widget_list_html__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../widget-list.html */ "./widget-list.html");
/* harmony import */ var _widget_carousel_html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../widget-carousel.html */ "./widget-carousel.html");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
// initAlpine.js
// Import the Alpine JS framework


// import widget template




///////////////////////
///////////////////////  initAlpine.js continued
///////////////////////

var initAlpine = function initAlpine() {
  var kapp = document.getElementById("slogkoledarapp");
  if (!kapp) {

    //const bdy = document.body
    //var appdiv = document.createElement("div");
    //appdiv.setAttribute("id", "slogkoledarapp");

    //bdy.insertAdjacentElement("afterbegin", appdiv);
  }
  alpinejs__WEBPACK_IMPORTED_MODULE_0__["default"].data('eventCal', function () {
    var loadingcycles = 0;
    return {
      // other default properties
      isLoading: true,
      eventssplitted: null,
      actevent: null,
      listview: true,
      detailview: false,
      showbutton: true,
      opendesc: true,
      opendescmargin: false,
      mobopen: false,
      nxtslides: 0,
      lngorg: false,
      locations: false,
      orgas: false,
      kklocations: false,
      kkevents: false,
      kkorganizers: false,
      kkcategories: false,
      // EVENT DATA SL & AT(DE) 
      /*
       *  we need two different dataset because of the not necessarilly existing translation
       *  there for we cannot gurantee that the same events are shown on the language switch
       *  therefor we need to scroll the sliderjs to the first slide on langswitch 
       */

      events: null,
      // we get all Events but then split it here because it is like it is
      eventssl: null,
      eventsat: null,
      getAllCategories: function getAllCategories() {
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var response;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch('https://admin.koledar.at/v1/categories?includeChildren=true');
              case 2:
                response = _context.sent;
                _context.next = 5;
                return response.json();
              case 5:
                return _context.abrupt("return", _context.sent);
              case 6:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }))();
      },
      getAllLocations: function getAllLocations() {
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
          var response;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return fetch('https://admin.koledar.at/v1/locations?includeChildren=true&limit=200');
              case 2:
                response = _context2.sent;
                _context2.next = 5;
                return response.json();
              case 5:
                return _context2.abrupt("return", _context2.sent);
              case 6:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }))();
      },
      getAllOrganizers: function getAllOrganizers() {
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
          var response;
          return _regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return fetch('https://admin.koledar.at/v1/organizers?offset=0&limit=200');
              case 2:
                response = _context3.sent;
                _context3.next = 5;
                return response.json();
              case 5:
                return _context3.abrupt("return", _context3.sent);
              case 6:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        }))();
      },
      getEvents: function getEvents(limit, datestr, kkcat, kkorga, kkintern) {
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
          var catquery, orgaquery, internquery, response;
          return _regeneratorRuntime().wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                catquery = "";
                orgaquery = "";
                internquery = "";
                console.log(kkintern);
                if (kkcat != "" && kkcat != null) {
                  catquery = "&subcategories=" + kkcat;
                }
                if (kkorga != "" && kkorga != null) {
                  orgaquery = "&organizers=" + kkorga;
                }
                if (kkintern != "" && kkintern != null) {
                  internquery = "&event-types=internal&event-types=public";
                }
                _context4.next = 9;
                return fetch('https://admin.koledar.at/v1/events?limit=' + limit + '&offset=0&from=' + datestr + catquery + orgaquery + internquery);
              case 9:
                response = _context4.sent;
                _context4.next = 12;
                return response.json();
              case 12:
                return _context4.abrupt("return", _context4.sent);
              case 13:
              case "end":
                return _context4.stop();
            }
          }, _callee4);
        }))();
      },
      fetchEventList: function fetchEventList() {
        var _this = this;
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
          var actdateforq, qday, qmonth, qyear, datestr, limit, kkcat, kkorga, kkintern, evsl, evat, chunkSize, chunksl, chunkat, i, j;
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                actdateforq = new Date();
                qday = actdateforq.getDate().toString();
                qmonth = (actdateforq.getMonth() + 1).toString();
                ;
                qyear = actdateforq.getFullYear();
                if (qday.length == 1) {
                  qday = "0" + qday;
                }
                if (qmonth.length == 1) {
                  qmonth = "0" + qmonth;
                }
                datestr = qyear + "-" + qmonth + "-" + qday; //kscript = document.querySelector('script[src*=app]');
                kscript = document.getElementById('slogkoledarapp');
                limit = kscript.getAttribute('kk-data-amount');
                kkcat = kscript.getAttribute('kk-cat');
                kkorga = kscript.getAttribute('kk-orga');
                kkintern = kscript.getAttribute('kk-intern');
                _this.loadColors();
                loadingcycles = loadingcycles + 1;
                if (kscript.getAttribute('kk-style') == "list") {
                  //limit=kscript.getAttribute('kk-chunksize')*2;
                  limit = parseInt(kscript.getAttribute('kk-data-amount')) * parseInt(kscript.getAttribute('kk-chunksize'));
                }
                _context5.next = 18;
                return _this.getAllLocations();
              case 18:
                _this.kklocations = _context5.sent.items;
                _context5.next = 21;
                return _this.getAllCategories();
              case 21:
                _this.kkcategories = _context5.sent.items;
                _context5.next = 24;
                return _this.getAllOrganizers();
              case 24:
                _this.kkorganizers = _context5.sent.items;
                _context5.next = 27;
                return _this.getEvents(limit, datestr, kkcat, kkorga, kkintern);
              case 27:
                _this.kkevents = _context5.sent.items;
                _this.isLoading = false;
                evsl = new Array();
                evat = new Array();
                _this.kkevents.forEach(function (event, index) {
                  event.index = index;
                  var actdate = new Date(event.starting_on);
                  var enddate = new Date(event.ending_on);
                  if (enddate != "Invalid Date") {
                    event.enddate = enddate.toLocaleDateString();
                    event.enddate = event.enddate.replaceAll("/", ".");
                  }
                  var enddaynumber = enddate.getDate();
                  if (enddaynumber.toString().length == 1) {
                    enddaynumber = "0" + enddaynumber;
                  }
                  event.endday = enddaynumber;
                  var daynumber = actdate.getDate();
                  if (daynumber.toString().length == 1) {
                    daynumber = "0" + daynumber;
                  }
                  event.day = daynumber;
                  var endyear = enddate.getFullYear();
                  var year = actdate.getFullYear();
                  var ddetail = daynumber + "." + (actdate.getMonth() + 1) + "." + year;
                  if (enddaynumber) {
                    ddetail = ddetail + " - " + enddaynumber + "." + (enddate.getMonth() + 1) + "." + endyear;
                  }
                  event.datedetail = ddetail;
                  var months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
                  var monthsde = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                  event.month = months[actdate.getMonth()];
                  event.monthde = monthsde[actdate.getMonth()];
                  var day = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
                  var dayde = ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"];
                  event.daytext = day[actdate.getDay()];
                  event.daytextde = dayde[actdate.getDay()];
                  event.datedm = actdate.getDate() + "." + (actdate.getMonth() + 1) + ".";
                  if (event.attachments == null) {
                    event.attachments = [];
                  }
                  ;
                  if (event.links == null) {
                    event.links = [];
                  }
                  ;
                  if (event.organizers == null) {
                    event.organizers = [];
                  }
                  ;
                  var gdate = actdate.getFullYear() + actdate.getMonth() + actdate.getDay();
                  var startdategcal;
                  var enddategcal;
                  if (event.starting_at) {
                    startdategcal = actdate.getFullYear() + "" + (actdate.getMonth() + 1) + "" + actdate.getDate() + "T" + event.starting_at.replace(":", "") + "00";
                  }
                  if (typeof enddate !== "undefined") {
                    enddategcal = enddate.getFullYear() + "" + (enddate.getMonth() + 1) + "" + enddate.getDate() + "T" + enddate.getHours() + "" + enddate.getMinutes() + "00";
                  }
                  if (startdategcal) {
                    if (!enddategcal) {
                      enddategcal = "";
                    } else {
                      enddategcal = "/" + enddategcal;
                    }
                    event.gcallink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + event.title_sl + "&dates=" + startdategcal + enddategcal;
                  }
                  event.loc = _this.getLocationforSlug(event.location, event.venue);
                  event.orga = _this.getOrgas(event.organizers);
                  event.cat = _this.getCat(event.subcategory);
                  if (event.title_sl != "") {
                    evsl.push(event);
                  }
                  if (event.title_de != "") {
                    evat.push(event);
                  }
                });
                if (kscript.getAttribute('kk-style') == "list") {
                  chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
                  chunksl = new Array();
                  chunkat = new Array();
                  for (i = 0; i < evsl.length; i += chunkSize) {
                    chunksl.push(evsl.slice(i, i + chunkSize));
                  }
                  for (j = 0; j < evat.length; j += chunkSize) {
                    chunkat.push(evat.slice(j, j + chunkSize));
                  }
                  _this.eventssl = chunksl;
                  _this.eventsat = chunkat;
                } else {
                  _this.eventssl = evsl;
                  _this.eventsat = evat;
                }
                console.log(_this.eventssl);
                console.log(_this.eventsat);
              case 35:
              case "end":
                return _context5.stop();
            }
          }, _callee5);
        }))();
      },
      fetchAddEventList: function fetchAddEventList() {
        var _this2 = this;
        var actdateforq = new Date();
        var qday = actdateforq.getDate().toString();
        var qmonth = (actdateforq.getMonth() + 1).toString();
        ;
        var qyear = actdateforq.getFullYear();
        if (qday.length == 1) {
          qday = "0" + qday;
        }
        if (qmonth.length == 1) {
          qmonth = "0" + qmonth;
        }
        var datestr = qyear + "-" + qmonth + "-" + qday;
        this.isLoading = true;
        //var kscript = document.querySelector('script[src*=app]');
        var kscript = document.getElementById('slogkoledarapp');
        var limit = kscript.getAttribute('kk-data-amount');
        var limit = parseInt(kscript.getAttribute('kk-data-amount')) * parseInt(kscript.getAttribute('kk-chunksize'));
        var offset = limit * loadingcycles;
        loadingcycles = loadingcycles + 1;
        var evsl = new Array();
        var evat = new Array();
        var catquery = "";
        var orgaquery = "";
        var internquery = "";
        var kkcat = kscript.getAttribute('kk-cat');
        var kkorga = kscript.getAttribute('kk-orga');
        var kkintern = kscript.getAttribute('kk-intern');
        if (kkcat != "" && kkcat != null) {
          catquery = "&subcategories=" + kkcat;
        }
        if (kkorga != "" && kkorga != null) {
          orgaquery = "&organizers=" + kkorga;
        }
        if (kkintern != "" && kkintern != null) {
          internquery = "&event-types=internal&event-types=public";
        }
        fetch('https://admin.koledar.at/v1/events?limit=' + limit + '&offset=' + offset + '&from=' + datestr + catquery + orgaquery + internquery).then(function (res) {
          return res.json();
        }).then(function (data) {
          var _this2$kkevents;
          _this2.isLoading = false;
          var actdate = new Date(data.starting_on);
          var ev = new Array();
          data.items.forEach(function (event, index) {
            event.index = index;
            var actdate = new Date(event.starting_on);
            var enddate = new Date(event.ending_on);
            if (enddate != "Invalid Date") {
              event.enddate = enddate.toLocaleDateString();
              event.enddate = event.enddate.replaceAll("/", ".");
            }
            var enddaynumber = enddate.getDate();
            if (enddaynumber.toString().length == 1) {
              enddaynumber = "0" + enddaynumber;
            }
            event.endday = enddaynumber;
            var daynumber = actdate.getDate();
            if (daynumber.toString().length == 1) {
              daynumber = "0" + daynumber;
            }
            event.day = daynumber;
            var endyear = enddate.getFullYear();
            var year = actdate.getFullYear();
            var ddetail = daynumber + "." + (actdate.getMonth() + 1) + "." + year;
            if (enddaynumber) {
              ddetail = ddetail + " - " + enddaynumber + "." + (enddate.getMonth() + 1) + "." + endyear;
            }
            event.datedetail = ddetail;
            var months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
            var monthsde = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
            event.month = months[actdate.getMonth()];
            event.monthde = monthsde[actdate.getMonth()];
            var day = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
            var dayde = ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"];
            event.daytext = day[actdate.getDay()];
            event.daytextde = dayde[actdate.getDay()];
            event.datedm = actdate.getDate() + "." + (actdate.getMonth() + 1) + ".";
            if (event.attachments == null) {
              event.attachments = [];
            }
            ;
            if (event.links == null) {
              event.links = [];
            }
            ;
            if (event.organizers == null) {
              event.organizers = [];
            }
            ;
            var gdate = actdate.getFullYear() + actdate.getMonth() + actdate.getDay();
            var startdategcal;
            var enddategcal;
            if (event.starting_at) {
              startdategcal = actdate.getFullYear() + "" + (actdate.getMonth() + 1) + "" + actdate.getDate() + "T" + event.starting_at.replace(":", "") + "00";
            }
            if (typeof enddate !== "undefined") {
              enddategcal = enddate.getFullYear() + "" + (enddate.getMonth() + 1) + "" + enddate.getDate() + "T" + enddate.getHours() + "" + enddate.getMinutes() + "00";
            }
            if (startdategcal) {
              if (!enddategcal) {
                enddategcal = "";
              } else {
                enddategcal = "/" + enddategcal;
              }
              event.gcallink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + event.title_sl + "&dates=" + startdategcal + enddategcal;
            }
            event.loc = _this2.getLocationforSlug(event.location, event.venue);
            event.orga = _this2.getOrgas(event.organizers);
            if (event.title_sl != "") {
              evsl.push(event);
            }
            if (event.title_de != "") {
              evat.push(event);
              if (event.day == 24) {}
            }
            if (event.day == 24) {}
          });
          (_this2$kkevents = _this2.kkevents).push.apply(_this2$kkevents, ev);
          if (kscript.getAttribute('kk-style') == "list") {
            var _this2$eventssl, _this2$eventsat;
            var chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
            var chunksl = new Array();
            var chunkat = new Array();
            for (var i = 0; i < evsl.length; i += chunkSize) {
              chunksl.push(evsl.slice(i, i + chunkSize));
            }
            for (var j = 0; j < evat.length; j += chunkSize) {
              chunkat.push(evat.slice(j, j + chunkSize));
            }
            (_this2$eventssl = _this2.eventssl).push.apply(_this2$eventssl, chunksl);
            (_this2$eventsat = _this2.eventsat).push.apply(_this2$eventsat, chunkat);
          } else {
            var _this2$eventssl2, _this2$eventsat2;
            (_this2$eventssl2 = _this2.eventssl).push.apply(_this2$eventssl2, evsl);
            (_this2$eventsat2 = _this2.eventsat).push.apply(_this2$eventsat2, evat);
          }
        });
      },
      getLocationforSlug: function getLocationforSlug(locationslug, venueslug) {
        var ret = false;
        if (locationslug === "sentjanz-v-rozu") {
          console.log(locationslug);
          this.kklocations.forEach(function (locobj, index) {
            console.log(locobj.location_key);
            if (locationslug === locobj.location_key) {
              console.log("locobj");
              console.log(locobj);
              locobj.venues.forEach(function (vobj, index) {
                if (venueslug === vobj.venue_key) {
                  locobj.venuename_de = vobj.name_de;
                  locobj.venuename_sl = vobj.name_sl;
                }
              });
            }
          });
        }
        this.kklocations.forEach(function (locobj, index) {
          if (locationslug === locobj.location_key) {
            locobj.venues.forEach(function (vobj, index) {
              if (venueslug === vobj.venue_key) {
                locobj.venuename_de = vobj.name_de;
                locobj.venuename_sl = vobj.name_sl;
              }
            });
            ret = locobj;
          }
        });
        return ret;
      },
      getOrgas: function getOrgas(orgs) {
        var _this3 = this;
        var ret = new Array();
        orgs.forEach(function (orgaslug, i) {
          _this3.kkorganizers.forEach(function (orga, index) {
            if (orgaslug === orga.organizer_key) {
              ret.push(orga);
            }
          });
        });
        return ret;
      },
      getCat: function getCat(cat) {
        var ret = false;
        this.kkcategories.forEach(function (mastercat, i) {
          mastercat.subcategories.forEach(function (subcat, index) {
            if (cat === subcat.subcategory_key) {
              ret = subcat;
            }
          });
        });
        return ret;
      },
      showDialog: function showDialog(ev) {
        var dialog = document.getElementById("kkdialog" + ev);
        dialog.showModal();
        dialog.scrollTop = 0;
      },
      hideDialog: function hideDialog(ev) {
        var dialog = document.getElementById("kkdialog" + ev);
        dialog.close();
      },
      showDialogat: function showDialogat(ev) {
        var dialog = document.getElementById("kkdialogat" + ev);
        dialog.showModal();
        dialog.scrollTop = 0;
      },
      hideDialogat: function hideDialogat(ev) {
        var dialog = document.getElementById("kkdialogat" + ev);
        dialog.close();
      },
      showDetail: function showDetail(ev) {
        this.listview = false;
        this.detailview = true;
        this.actevent = ev;
        this.showbutton = false;
      },
      hideDetail: function hideDetail() {
        this.actevent = null;
        this.open = false;
        this.listview = true;
        this.detailview = false;
        this.showbutton = true;
        this.opendesc = true;
        this.opendescmargin = false;
      },
      handleScroll: function handleScroll(theEl) {
        var sk = document.getElementById("slogkoldear");
        if (Math.abs(sk.scrollHeight - sk.clientHeight - sk.scrollTop) < 300) {
          this.fetchAddEventList();
        }
      },
      showAllText: function showAllText(ev) {
        this.sat = false;
      },
      hastStateSat: function hastStateSat(ev) {
        return this.sat;
      },
      loadColors: function loadColors() {
        var kkcolorschema = kscript.getAttribute('kkc-schema');
        var kklangcolor = "";
        var kkcolorbg = "";
        var kkcolorbgdate = "";
        var kkcolordatetext = "";
        var kkcolorplacetext = "";
        var kkcolortitletext = "";
        var kkcicon = "";
        var kkcddatetext = "";
        var kkcdtitletext = "";
        var kkcdinfotext = "";
        var kkcdinfoicon = "";
        var kkcdbacktext = "";
        var kkcdbgcattext = "";
        var kkcdcattext = "";
        var kkcdcatdesctext = "";
        var kkcdbgcal = "";
        var kkcdcaltext = "";
        var kkcdbg = "";
        var kkcdtext = "";
        var kkcddldesc = "";
        var kkcddlbg = "";
        var kkcddltext = "";
        if (kkcolorschema == "dark") {
          kklangcolor = "#000";
          kkcolorbg = "#272727";
          kkcolorbgdate = "#B0C2A7";
          kkcolordatetext = "#fff";
          kkcolorplacetext = "#ece0c6";
          kkcolortitletext = "#fff";
          kkcicon = "#1a7a91";
          kkcddatetext = "#96264C";
          kkcdtitletext = "000";
          kkcdinfotext = "#E8A273";
          kkcdinfoicon = "#000";
          kkcdbacktext = "#cbcbcb";
          kkcdbgcattext = "#B0C2A7";
          kkcdcattext = "#fff";
          kkcdcatdesctext = "#007A91";
          kkcdbgcal = "#F0DCCD";
          kkcdcaltext = "#000";
          kkcdbg = "#fff";
          kkcdtext = "#000";
          kkcddldesc = "#007A91";
          kkcddlbg = "#b0c2a7";
          kkcddltext = "#000";
        } else {
          kklangcolor = "#000";
          kkcolorbg = "#fff";
          kkcolorbgdate = "#B0C2A7";
          kkcolordatetext = "#fff";
          kkcolorplacetext = "#952a5a";
          kkcolortitletext = "#000";
          kkcicon = "#1a7a91";
          kkcddatetext = "#96264C";
          kkcdtitletext = "000";
          kkcdinfotext = "#E8A273";
          kkcdinfoicon = "#000";
          kkcdbacktext = "#cbcbcb";
          kkcdbgcattext = "#B0C2A7";
          kkcdcattext = "#fff";
          kkcdcatdesctext = "#007A91";
          kkcdbgcal = "#F0DCCD";
          kkcdcaltext = "#000";
          kkcdbg = "#fff";
          kkcdtext = "#000";
          kkcddldesc = "#007A91";
          kkcddlbg = "#b0c2a7";
          kkcddltext = "#000";
        }
        var kklangcolor_overwrite = kscript.getAttribute('kkc-lang');
        if (kklangcolor_overwrite != null) {
          kklangcolor = kklangcolor_overwrite;
        }
        document.documentElement.style.setProperty('--kkclang', kklangcolor);

        /***COLORS OVERVIEW Start */
        var kkcolorbg_overwrite = kscript.getAttribute('kkc-bg');
        if (kkcolorbg_overwrite != null) {
          kkcolorbg = kkcolorbg_overwrite;
        }
        document.documentElement.style.setProperty('--kkcolorbg', kkcolorbg);
        var kkcolorbgdate_overwrite = kscript.getAttribute('kkc-bgdate');
        if (kkcolorbgdate_overwrite != null) {
          kkcolorbgdate = kkcolorbgdate_overwrite;
        }
        document.documentElement.style.setProperty('--kkcolorbgdate', kkcolorbgdate);
        var kkcolordatetext_overwrite = kscript.getAttribute('kkc-datetext');
        if (kkcolordatetext_overwrite != null) {
          kkcolordatetext = kkcolordatetext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcolordatetext', kkcolordatetext);
        var kkcolorplacetext_overwrite = kscript.getAttribute('kkc-placetext');
        if (kkcolorplacetext_overwrite != null) {
          kkcolorplacetext = kkcolorplacetext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcolorplacetext', kkcolorplacetext);
        var kkcolortitletext_overwrite = kscript.getAttribute('kkc-titletext');
        if (kkcolortitletext_overwrite != null) {
          kkcolortitletext = kkcolortitletext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcolortitletext', kkcolortitletext);
        var kkcicon_overwrite = kscript.getAttribute('kkc-icon');
        if (kkcicon_overwrite != null) {
          kkcicon = kkcicon_overwrite;
        }
        document.documentElement.style.setProperty('--kkcicon', kkcicon);

        /***COLORS OVERVIEW END */

        /***COLORS DIALOG START */
        var kkcddatetext_overwrite = kscript.getAttribute('kkcd-datetext');
        if (kkcddatetext_overwrite != null) {
          kkcddatetext = kkcddatetext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcddatetext', kkcddatetext);
        var kkcdtitletext_overwrite = kscript.getAttribute('kkcd-titletext');
        if (kkcdtitletext_overwrite != null) {
          kkcdtitletext = kkcdtitletext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdtitletext', kkcdtitletext);
        var kkcdinfotext_overwrite = kscript.getAttribute('kkcd-infotext');
        if (kkcdinfotext_overwrite != null) {
          kkcdinfotext = kkcdinfotext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdinfotext', kkcdinfotext);
        var kkcdinfoicon_overwrite = kscript.getAttribute('kkcd-infoicon');
        if (kkcdinfoicon_overwrite != null) {
          kkcdinfoicon = kkcdinfoicon_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdinfoicon', kkcdinfoicon);
        var kkcdbacktext_overwrite = kscript.getAttribute('kkcd-backtext');
        if (kkcdbacktext_overwrite != null) {
          kkcdbacktext = kkcdbacktext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdbacktext', kkcdbacktext);
        var kkcdbgcat_overwrite = kscript.getAttribute('kkcd-bgcat');
        if (kkcdbgcat_overwrite != null) {
          kkcdbgcattext = kkcdbgcat_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdbgcattext', kkcdbgcattext);
        var kkcdcattext_overwrite = kscript.getAttribute('kkcd-cattext');
        if (kkcdcattext_overwrite != null) {
          kkcdcattext = kkcdcattext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdcattext', kkcdcattext);
        var kkcdcatdesctext_overwrite = kscript.getAttribute('kkcd-catdesctext');
        if (kkcdcatdesctext_overwrite != null) {
          kkcdcatdesctext = kkcdcatdesctext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdcatdesctext', kkcdcatdesctext);
        var kkcdbgcal_overwrite = kscript.getAttribute('kkcd-bgcal');
        if (kkcdbgcal_overwrite != null) {
          kkcdbgcal = kkcdbgcal_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdbgcal', kkcdbgcal);
        var kkcdcaltext_overwrite = kscript.getAttribute('kkcd-caltext');
        if (kkcdcaltext_overwrite != null) {
          kkcdcaltext = kkcdcaltext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdcaltext', kkcdcaltext);
        var kkcdbg_overwrite = kscript.getAttribute('kkcd-bg');
        if (kkcdbg_overwrite != null) {
          kkcdbg = kkcdbg_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdbg', kkcdbg);
        var kkcdtext_overwrite = kscript.getAttribute('kkcd-text');
        if (kkcdtext_overwrite != null) {
          kkcdtext = kkcdtext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcdtext', kkcdtext);
        /***** */

        var kkcddldesc_overwrite = kscript.getAttribute('kkcd-dldesc');
        if (kkcddldesc_overwrite != null) {
          kkcddldesc = kkcddldesc_overwrite;
        }
        document.documentElement.style.setProperty('--kkcddldesc', kkcddldesc);
        var kkcdtdlbg_overwrite = kscript.getAttribute('kkcd-dlbg');
        if (kkcdtdlbg_overwrite != null) {
          kkcddlbg = kkcdtdlbg_overwrite;
        }
        document.documentElement.style.setProperty('--kkcddlbg', kkcddlbg);
        var kkcddltext_overwrite = kscript.getAttribute('kkcd-dltext');
        if (kkcddltext_overwrite != null) {
          kkcddltext = kkcddltext_overwrite;
        }
        document.documentElement.style.setProperty('--kkcddltext', kkcddltext);
        /***COLORS DIALOG END */
      },
      showNext: function showNext() {
        var slide = document.querySelector(".slide");
        var slidesContainer = document.getElementById("slides-container");
        var slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft += slideWidth;
        if (kscript.getAttribute('kk-style') != "list" && slidesContainer.clientWidth - 300 < slidesContainer.scrollLeft) {
          this.fetchAddEventList();
        }
        this.nxtslides++;
        if (kscript.getAttribute('kk-style') == "list") {
          if (this.kkevents.length - this.nxtslides * parseInt(kscript.getAttribute('kk-chunksize')) < parseInt(kscript.getAttribute('kk-chunksize')) + 2) {
            this.fetchAddEventList();
          }
          ;
        }
      },
      showPrev: function showPrev() {
        var slide = document.querySelector(".slide");
        var slidesContainer = document.getElementById("slides-container");
        var slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft -= slideWidth;
      },
      showNextat: function showNextat() {
        var slide = document.querySelector(".slideat");
        var slidesContainer = document.getElementById("slides-containerat");
        var slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft += slideWidth;
        if (kscript.getAttribute('kk-style') != "list" && slidesContainer.clientWidth - 300 < slidesContainer.scrollLeft) {
          this.fetchAddEventList();
        }
        this.nxtslides++;
        if (kscript.getAttribute('kk-style') == "list") {
          if (this.kkevents.length - this.nxtslides * parseInt(kscript.getAttribute('kk-chunksize')) < parseInt(kscript.getAttribute('kk-chunksize')) + 2) {
            this.fetchAddEventList();
          }
          ;
        }
      },
      showPrevat: function showPrevat() {
        var slide = document.querySelector(".slideat");
        var slidesContainer = document.getElementById("slides-containerat");
        var slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft -= slideWidth;
      }
    };
  });
  alpinejs__WEBPACK_IMPORTED_MODULE_0__["default"].start();

  //var kscript = document.querySelector('script[src*=app]');
  var kscript = document.getElementById('slogkoledarapp');
  var kkstyle = kscript.getAttribute('kk-style');

  // #app is a div that we're going to inject our markup into
  if (kkstyle == "list") {
    document.getElementById("slogkoledarapp").innerHTML = _widget_list_html__WEBPACK_IMPORTED_MODULE_2__["default"];
  } else if (kkstyle == "carousel") {
    document.getElementById("slogkoledarapp").innerHTML = _widget_carousel_html__WEBPACK_IMPORTED_MODULE_3__["default"];
  } else {
    document.getElementById("slogkoledarapp").innerHTML = _widget_html__WEBPACK_IMPORTED_MODULE_1__["default"];
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (initAlpine);

/***/ }),

/***/ "./src/injectCSS.js":
/*!**************************!*\
  !*** ./src/injectCSS.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var injectCSS = function injectCSS() {
  // Create a <link> element
  var link = document.createElement("link");

  //var kscript = document.querySelector('script[src*=app]');
  var kscript = document.getElementById('slogkoledarapp');
  var kkstyle = kscript.getAttribute('kk-style');

  // Set the link type to and rel attributes
  link.type = "text/css";
  link.rel = "stylesheet";
  var environment = 'production';
  if (environment == 'production' && kkstyle == "list") {
    link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-list.css";
  }
  if (environment != 'production' && kkstyle == "list") {
    link.href = "./../dist/styles-list.css";
  }
  if (environment == 'production' && kkstyle == "carousel") {
    link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-carousel.css";
  }
  if (environment != 'production' && kkstyle == "carousel") {
    link.href = "./../dist/styles-carousel.css";
  }
  if (environment == 'production' && kkstyle == "pro") {
    link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-pro.css";
  }
  if (environment != 'production' && kkstyle == "pro") {
    link.href = "./../dist/styles-pro.css";
  }

  // Append the stylesheet to the <head> of the DOM
  var head = document.head;
  head.appendChild(link);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (injectCSS);
;

/***/ }),

/***/ "./widget-carousel.html":
/*!******************************!*\
  !*** ./widget-carousel.html ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = "    <div x-data=\"eventCal\" id=\"slogkoldear\" x-bind:class=\"mobopen ? 'moboc' : 'mobcc'\" x-ref=\"theEl\" @scroll.theEl.throttle=\"handleScroll(this)\">\n        <div x-init=\"fetchEventList\"></div>\n        <div id=\"koledarheader\">\n            <a id=\"koledarlink\" href=\"https://www.koledar.at\" target=\"_blank\">\n                poglej vse na koledar.at\n            </a>\n            <div class=\"lng-menu\">\n                <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? '' : 'active'\">SL</span>\n                <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? 'active' : ''\">AT</span>\n            </div>\n            \n        </div>\n\n        <section class=\"slider-wrapper langme\"  x-bind:class=\"lngorg ? '' : 'active'\">\n            <button class=\"slide-arrow\" id=\"slide-arrow-prev\" @click=\"showPrev()\">\n              &#8249;\n            </button>\n            \n            <button class=\"slide-arrow\" id=\"slide-arrow-next\" @click=\"showNext()\">\n              &#8250;\n            </button>\n            \n                <template x-if=\"eventssl\">\n                    <ul class=\"slides-container\" id=\"slides-container\">\n                        <template x-for=\"(event, index) in eventssl\">\n                            <div >\n                                <li class=\"slide slogkoledar-eventitem\" @click=\"showDialog(''+index)\" style=\"background-color: var(--kkcolorbg);\">\n                                    <div class=\"slogkoledar-datewrapper\">\n                                        <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                            <span class=\"slogkoledar-date\">\n                                                <span class=\"slogkoledar-dateday\" x-text=\"event.daytext\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                                <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                            </span>\n                                        </div>\n                                    </div>\n                                    <div class=\"slogkoledar-eventwrapper \">\n                                        <span class=\"slogkoledar-eventinfo \">\n                                            <span class=\"flexme\">\n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                                    <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                    <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                </svg>\n                                                <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_sl\"  style=\"color: var(--kkcolorplacetext);\"></p>\n                                            </span>\n                                            <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_sl\"  style=\"color: var(--kkcolortitletext);\"></p>\n                                        </span>\n                                        \n                                    </div>\n    \n                                    \n                                </li>  \n                                <dialog  :id=\"'kkdialog'+`${event.index}`\">\n                                    <div class=\"kkdialog-header-wrapper\">\n                                        <span class=\"kkdialog-header-dummy\"></span>\n                                        <img src=\"https://slogled.at/wp-content/uploads/2024/03/kklogo.png\">\n                                        <span class=\"kkbackwrapper\">\n                                            <span class=\"kkbacklink\" @click=\"hideDialog(''+`${event.index}`)\">\n                                                \n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"currentColor\" style=\"fill: var(--kkcdbacktext);\" class=\"slogkoledar-bi slogkoledar-bi-x-lg\" viewBox=\"0 0 16 16\">\n                                                    <path fill-rule=\"evenodd\" d=\"M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                    <path fill-rule=\"evenodd\" d=\"M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                  </svg>\n                                                <span class=\"kkdialogback\" style=\"color: var(--kkcdbacktext);\">Nazaj</span>\n                                            </span>\n                                        </span>\n                                    </div>\n                                    <div class=\"slogkoledard-wrapper\" style=\"background-color: var(--kkcdbg);\">\n                                        <div class=\"slogkoledard-datewrapper \">\n                                            <span class=\"slogkoledard-date\" x-text=\"event.datedetail\"  style=\"color: var(--kkcddatetext);\"></span>\n                                        </div>\n                                        <div class=\"\">\n                                            <h2 class=\"slogkoledard-title\" x-text=\"event.title_sl\" style=\"color: var(--kkcdtitletext);\"></h2>\n                                        </div>\n\n                                        \n\n                                        <div class=\"slogkoledard-info-wrapper\">\n                                            \n                                            <div class=\"slogkoledard-info\">\n                                                \n\n                                                <template x-if=\"event.starting_at\">\n                                                    <div class=\"flexme\">\n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"></path>\n                                                            <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext\" x-text=\"event.starting_at\" style=\"color: var(--kkcdinfotext);\"></span> \n                                                    </div>\n                                                </template>\n                                                \n                                                <template x-if=\"event.venue\">\n                                                    <div class=\"flexme\">\n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                            <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext  \" x-text=\"event.loc.name_sl\"  style=\"color: var(--kkcdinfotext);\"></span>\n                                                    </div>\n                                                </template>\n                            \n                                                <template x-if=\"event.venue\">\n                                                    <div class=\"flexme\">   \n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext \" x-text=\"event.loc.venuename_sl\"  style=\"color: var(--kkcdinfotext);\"></span>\n\n                                                    </div>\n                                                </template>\n                            \n                                            </div>\n                                            \n                            \n                                        </div>\n\n                                        <div class=\"kkinfowrapper\">\n\n                                            <div class=\"kkcatwrapper\">\n                                                <span class=\"kkcatname\" x-text=\"event.cat.name_sl\"  style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></span>\n                                                <span class=\"kkcategory\" style=\"color: var(--kkcdcatdesctext);\">Kategorija</span>\n                                            </div>\n\n                                            <template x-for=\"organizer in event.orga\">\n                                                <div class=\"kkcatwrapper\">  \n                                                    <span class=\"kkorganizername \" x-text=\"organizer.name_sl\"  style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></span>\n                                                    <span class=\"kkorganizer\"  style=\"color: var(--kkcdcatdesctext);\">Prireditelj</span>\n                                                </div>\n                                            </template>\n                                                \n                                        </div>\n                                        \n                                        <template x-if=\"event.image_landscape_thumbnail\">\n                                            <img class=\"slogkoledard-image\" :src=\"`${event.image_landscape_thumbnail}`\">\n                                        </template>\n\n                                        <template x-if=\"event.image_portrait_thumbnail\">\n                                            <img class=\"slogkoledard-image\" :src=\"`${event.image_portrait_thumbnail}`\">\n                                        </template>\n                        \n\n                                            <div id=\"slogkoledardesc\" class=\"\" x-html=\"event.desc_sl\" style=\"color: var(--kkcdtext);\"></div>\n                                        \n                                        \n                                        <div class=\"slogkoledard-linkwrapper \">\n                                            \n                                            <div class=\"slogkoledard-linkw\">\n\n\n                                                <template x-for=\"link in event.links\">\n                                                    <div>\n                                                        <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">Download</span>  \n                                                        <div class=\"flexme-bottom\">\n                                                             \n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\"  style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon-bottom\" viewBox=\"0 0 16 16\">\n                                                                <path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"></path>\n                                                                <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"></path>\n                                                            </svg>\n                                                            <a class=\"slogkoledard-infotext-bottom\" x-text=\"link.label\" x-bind:href=\"''+link.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                        </div>\n                                                    </div>\n                                                \n                                                    \n                                                </template>\n                            \n                                                <template x-for=\"attachment in event.attachments\">\n                                                    <div>\n                                                        <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">link</span> \n                                                        <div class=\"flexme-bottom\">  \n                                                               \n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\"  style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon-bottom\" viewBox=\"0 0 16 16\">\n                                                                <path d=\"M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z\"></path>\n                                                                <path d=\"M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z\"></path>\n                                                            </svg>\n                                                            <a class=\"slogkoledard-infotext-bottom\" x-text=\"attachment.label\" x-bind:href=\"''+attachment.file.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                        </div>\n                                                    </div>\n                                                        \n                                                </template> \n\n                                                \n\n                            \n                                            </div>\n\n                                        </div>\n                                        <!---20220305T103000/20220305T184500-->\n                                        <div>\n                                            <div class=\"kkgcallink\" style=\"background-color: var(--kkcdbgcal);\">\n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"26\" height=\"26\" fill=\"currentColor\"  style=\"fill: var(--kkcdcaltext);\" class=\"bi bi-calendar-week\" viewBox=\"0 0 16 16\">\n                                                    <path d=\"M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z\"/>\n                                                    <path d=\"M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z\"/>\n                                                </svg>\n                                                <a target=\"_blank\" x-bind:href=\"''+event.gcallink\" style=\"color: var(--kkcdcaltext);\">Google Calendar</a>\n                                            </div>\n                                        </div>\n                                        \n                                       \n                                    </div>\n                                \n                                </dialog>\n                            </div>\n                            \n                        </template>\n                    </ul>\n                </template>\n           \n          </section>\n\n          <section class=\"slider-wrapper langme\"  x-bind:class=\"lngorg ? 'active' : ''\">\n            <button class=\"slide-arrow\" id=\"slide-arrow-prev\" @click=\"showPrev()\"> \n              &#8249;\n            </button>\n            \n            <button class=\"slide-arrow\" id=\"slide-arrow-next\" @click=\"showNext()\">\n              &#8250;\n            </button>\n            \n            \n            \n                <template x-if=\"eventsat\">\n                    <ul class=\"slides-container\" id=\"slides-container\">\n                        <template x-for=\"(event, index) in eventsat\">\n                            <div>\n                                <li class=\"slide slogkoledar-eventitem\" @click=\"showDialogat(''+index)\" style=\"background-color: var(--kkcolorbg);\">\n                                    <div class=\"slogkoledar-datewrapper\">\n                                        <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                            <span class=\"slogkoledar-date\">\n                                                \n                                                <span class=\"slogkoledar-dateday\" x-text=\"event.daytextde\" style=\"color: var(--kkcolordatetext);\"></span>\n                                         \n                                                <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                            </span>\n                                        </div>\n                                    </div>\n                                    <div class=\"slogkoledar-eventwrapper \">\n                                        <span class=\"slogkoledar-eventinfo \">\n                                            <span class=\"flexme\">\n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                                    <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                    <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                </svg>\n                                              \n                                                <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_de\" style=\"color: var(--kkcolorplacetext);\"></p>\n                                            </span>\n                                            <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_de\" style=\"color: var(--kkcolortitletext);\"></p>\n                                        </span>\n                                        \n                                    </div>\n    \n                                    \n                                </li>  \n                                <dialog  :id=\"'kkdialogat'+`${event.index}`\">\n                                    <div class=\"kkdialog-header-wrapper\">\n                                        <span class=\"kkdialog-header-dummy\"></span>\n                                        <img src=\"https://slogled.at/wp-content/uploads/2024/03/kklogo.png\">\n                                        <span class=\"kkbackwrapper\">\n                                            <span class=\"kkbacklink\" @click=\"hideDialogat(''+`${event.index}`)\">\n                                                \n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"currentColor\" style=\"fill: var(--kkcdbacktext);\" class=\"slogkoledar-bi slogkoledar-bi-x-lg\" viewBox=\"0 0 16 16\">\n                                                    <path fill-rule=\"evenodd\" d=\"M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                    <path fill-rule=\"evenodd\" d=\"M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                  </svg>\n                                                <span class=\"kkdialogback\" style=\"color: var(--kkcdbacktext);\">Zurück</span>\n                                            </span>\n                                        </span>\n                                    </div>\n                                    <div class=\"slogkoledard-wrapper\" style=\"background-color: var(--kkcdbg);\">\n                                        <div class=\"slogkoledard-datewrapper \">\n                                            <span class=\"slogkoledard-date\" x-text=\"event.datedetail\" style=\"color: var(--kkcddatetext);\"></span>\n                                        </div>\n                                        <div class=\"\">\n                                            <h2 class=\"slogkoledard-title\" x-text=\"event.title_de\" style=\"color: var(--kkcdtitletext);\" ></h2>\n                                        </div>\n\n                                        \n\n                                        <div class=\"slogkoledard-info-wrapper\">\n                                            \n                                            <div class=\"slogkoledard-info\">\n                                                \n\n                                                <template x-if=\"event.starting_at\">\n                                                    <div class=\"flexme\">\n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"></path>\n                                                            <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext\" x-text=\"event.starting_at\" style=\"color: var(--kkcdinfotext);\"></span>\n                                                    </div>\n                                                </template>\n                                                \n                                                <template x-if=\"event.venue\">\n                                                    <div class=\"flexme\">\n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                            <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext  \" x-text=\"event.loc.name_de\"  style=\"color: var(--kkcdinfotext);\"></span>\n                                                    </div>\n                                                </template>\n                            \n                                                <template x-if=\"event.venue\">\n                                                    <div class=\"flexme\">   \n                                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                            <path d=\"M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4\"></path>\n                                                        </svg>\n                                                        <span class=\"slogkoledard-infotext \" x-text=\"event.loc.venuename_de\"  style=\"color: var(--kkcdinfotext);\"></span>\n\n                                                    </div>\n                                                </template>\n                            \n                                            </div>\n                                            \n                            \n                                        </div>\n\n                                        <div class=\"kkinfowrapper\">\n\n                                            <div class=\"kkcatwrapper\">\n                                                <a class=\"kkcatname\" x-text=\"event.cat.name_de\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                                <span class=\"kkcategory\" style=\"color: var(--kkcdcatdesctext);\">Kategorie</span>\n                                            </div>\n\n                                            <template x-for=\"organizer in event.orga\">\n                                                <div class=\"kkcatwrapper\">  \n                                                    <a class=\"kkorganizername \" x-text=\"organizer.name_de\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                                    <span class=\"kkorganizer\"  style=\"color: var(--kkcdcatdesctext);\" >Veranstalter</span>\n                                                </div>\n                                            </template>\n                                                \n                                        </div>\n                                        \n                                        <template x-if=\"event.image_landscape_thumbnail\">\n                                            <img class=\"slogkoledard-image\" :src=\"`${event.image_landscape_thumbnail}`\">\n                                        </template>\n\n                                        <template x-if=\"event.image_portrait_thumbnail\">\n                                            <img class=\"slogkoledard-image\" :src=\"`${event.image_portrait_thumbnail}`\">\n                                        </template>\n                        \n\n                            \n                                            <div id=\"slogkoledardesc\" class=\"\" x-html=\"event.desc_de\" style=\"color: var(--kkcdtext);\"></div>\n                                        \n                                        \n                                        <div class=\"slogkoledard-linkwrapper \">\n                                            \n                                            <div class=\"slogkoledard-linkw\">\n\n\n                                                <template x-for=\"link in event.links\">\n                                                    <div>\n                                                        <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">Download</span>  \n                                                        <div class=\"flexme-bottom\">\n                                                             \n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"slogkoledard-info-icon-bottom\" style=\"fill: var(--kkcddlbg);\" viewBox=\"0 0 16 16\">\n                                                                <path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"></path>\n                                                                <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"></path>\n                                                            </svg>\n                                                            <a class=\"slogkoledard-infotext-bottom\" x-text=\"link.label\" x-bind:href=\"''+link.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                        </div>\n                                                    </div>\n                                                \n                                                    \n                                                </template>\n                            \n                                                <template x-for=\"attachment in event.attachments\">\n                                                    <div>\n                                                        <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">link</span> \n                                                        <div class=\"flexme-bottom\">  \n                                                               \n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"slogkoledard-info-icon-bottom\" style=\"fill: var(--kkcddlbg);\" viewBox=\"0 0 16 16\">\n                                                                <path d=\"M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z\"></path>\n                                                                <path d=\"M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z\"></path>\n                                                            </svg>\n                                                            <a class=\"slogkoledard-infotext-bottom\" x-text=\"attachment.label\" x-bind:href=\"''+attachment.file.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                        </div>\n                                                    </div>\n                                                        \n                                                </template> \n\n                                                \n                            \n                                            </div>\n\n                                        </div>\n                                        <!---20220305T103000/20220305T184500-->\n                                        <div>\n                                            <div class=\"kkgcallink\"  style=\"background-color: var(--kkcdbgcal);\">\n                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"26\" height=\"26\" fill=\"currentColor\" style=\"fill: var(--kkcdcaltext);\" class=\"bi bi-calendar-week\" viewBox=\"0 0 16 16\">\n                                                    <path d=\"M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z\"/>\n                                                    <path d=\"M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z\"/>\n                                                </svg>\n                                                <a target=\"_blank\" x-bind:href=\"''+event.gcallink\" style=\"color: var(--kkcdcaltext);\">Google Calendar</a>\n                                            </div>\n                                        </div>\n                                        \n                                       \n                                    </div>\n                                \n                                </dialog>\n                            </div>\n                            \n                        </template>\n                    </ul>\n                </template>\n           \n          </section>\n\n\n\n        \n        \n    </div>\n\n\n\n    \n    \n      <" + "script>\n        \n      <" + "/script>\n    \n    ";
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./widget-list.html":
/*!**************************!*\
  !*** ./widget-list.html ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = "<div x-data=\"eventCal\" id=\"slogkoldear\" x-bind:class=\"mobopen ? 'moboc' : 'mobcc'\" x-ref=\"theEl\" @scroll.theEl.throttle=\"handleScroll(this)\">\n    <div x-init=\"fetchEventList\"></div>\n    <div id=\"koledarheader\"> \n        <a id=\"koledarlink\" href=\"https://www.koledar.at\" target=\"_blank\">\n            poglej vse na koledar.at\n        </a>\n        <div class=\"lng-menu\">\n            <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? '' : 'active'\" style=\"color: var(--kkclang);\">SL</span>\n            <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? 'active' : ''\" style=\"color: var(--kkclang);\">AT</span>\n        </div>\n        \n    </div>\n\n\n    <div id=\"WIDGETLIST\"></div>\n    <section class=\"slider-wrapper langme\"  x-bind:class=\"lngorg ? '' : 'active'\">\n        <button class=\"slide-arrow\" id=\"slide-arrow-prev\" @click=\"showPrev()\">\n            &#8249;\n          </button>\n          \n          <button class=\"slide-arrow\" id=\"slide-arrow-next\" @click=\"showNext()\">\n            &#8250;\n          </button>\n          \n          \n          \n              <template x-if=\"eventssl\">\n                  <ul class=\"slides-container\" id=\"slides-container\">\n                      <template x-for=\"events in eventssl\">\n                          <li class=\"slide\">\n                              <template x-for=\"(event, index) in events\">\n                                  <div class=\"slideitem\" style=\"background-color: var(--kkcolorbg);\">\n                                      <div class=\" slogkoledar-eventitem\" @click=\"showDialog(''+`${event.index}`)\">\n                                          <div class=\"slogkoledar-datewrapper\">\n                                              <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                                  <span class=\"slogkoledar-date\">\n                                                      <span class=\"slogkoledar-dateday\" x-text=\"event.daytext\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                                      <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                                  </span>\n                                              </div>\n                                          </div>\n                                          <div class=\"slogkoledar-eventwrapper \">\n                                              <span class=\"slogkoledar-eventinfo \">\n                                                  <span class=\"flexme\">\n                                                      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                                          <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                          <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                      </svg>\n                                                      <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_sl\"  style=\"color: var(--kkcolorplacetext);\"></p>\n                                                  </span>\n                                                  <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_sl\"  style=\"color: var(--kkcolortitletext);\"></p>\n                                              </span>\n                                              \n                                          </div>\n  \n                                          \n                                      </div>  \n                                      <dialog  :id=\"'kkdialog'+`${event.index}`\">\n                                          <div class=\"kkdialog-header-wrapper\">\n                                              <span class=\"kkdialog-header-dummy\"></span>\n                                              <img src=\"https://slogled.at/wp-content/uploads/2024/03/kklogo.png\">\n                                              <span class=\"kkbackwrapper\">\n                                                  <span class=\"kkbacklink\" @click=\"hideDialog(''+`${event.index}`)\">\n                                                      \n                                                      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"currentColor\" style=\"fill: var(--kkcdbacktext);\" class=\"slogkoledar-bi slogkoledar-bi-x-lg\" viewBox=\"0 0 16 16\">\n                                                          <path fill-rule=\"evenodd\" d=\"M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                          <path fill-rule=\"evenodd\" d=\"M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                        </svg>\n                                                      <span class=\"kkdialogback\" style=\"color: var(--kkcdbacktext);\">Nazaj</span>\n                                                  </span>\n                                              </span>\n                                          </div>\n                                          <div class=\"slogkoledard-wrapper\" style=\"background-color: var(--kkcdbg);\">\n                                              <div class=\"slogkoledard-datewrapper \">\n                                                  <span class=\"slogkoledard-date\" x-text=\"event.datedetail\"  style=\"color: var(--kkcddatetext);\"></span>\n                                              </div>\n                                              <div class=\"\">\n                                                  <h2 class=\"slogkoledard-title\" x-text=\"event.title_sl\" style=\"color: var(--kkcdtitletext);\"></h2>\n                                              </div>\n      \n                                              \n      \n                                              <div class=\"slogkoledard-info-wrapper\">\n                                                  \n                                                  <div class=\"slogkoledard-info\">\n                                                      \n      \n                                                      <template x-if=\"event.starting_at\">\n                                                          <div class=\"flexme\">\n                                                              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                  <path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"></path>\n                                                                  <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"></path>\n                                                              </svg>\n                                                              <span class=\"slogkoledard-infotext\" x-text=\"event.starting_at\" style=\"color: var(--kkcdinfotext);\"></span> \n                                                          </div>\n                                                      </template>\n                                                      \n                                                      <template x-if=\"event.venue\">\n                                                          <div class=\"flexme\">\n                                                              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                  <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                                  <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                              </svg>\n                                                              <span class=\"slogkoledard-infotext  \" x-text=\"event.loc.name_sl\"  style=\"color: var(--kkcdinfotext);\"></span>\n                                                          </div>\n                                                      </template>\n                                  \n                                                      <template x-if=\"event.venue\">\n                                                          <div class=\"flexme\">   \n                                                              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                  <path d=\"M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4\"></path>\n                                                              </svg>\n                                                              <span class=\"slogkoledard-infotext \" x-text=\"event.loc.venuename_sl\"  style=\"color: var(--kkcdinfotext);\"></span>\n      \n                                                          </div>\n                                                      </template>\n                                  \n                                                  </div>\n                                                  \n                                  \n                                              </div>\n      \n                                              <div class=\"kkinfowrapper\">\n      \n                                                <template x-if=\"event.cat\">\n                                                    <span class=\"kkw1\">\n                                                        <img :src=\"`${event.cat.image.url}`\"/>\n                                                        <div class=\"kkcatwrapper\">                                                    \n                                                            <a class=\"kkcatname\" x-text=\"event.cat.name_de\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                                            <span class=\"kkcategory\" style=\"color: var(--kkcdcatdesctext);\">Kategorie</span>\n                                                        </div>\n                                                    </span>\n                                                </template>\n      \n                                                  <template x-for=\"organizer in event.orga\">\n                                                      <div class=\"kkcatwrapper\">  \n                                                          <span class=\"kkorganizername \" x-text=\"organizer.name_sl\"  style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></span>\n                                                          <span class=\"kkorganizer\"  style=\"color: var(--kkcdcatdesctext);\">Prireditelj</span>\n                                                      </div>\n                                                  </template>\n                                                      \n                                              </div>\n                                              \n                                              <template x-if=\"event.image_landscape_thumbnail\">\n                                                  <img class=\"slogkoledard-image\" :src=\"`${event.image_landscape_thumbnail}`\">\n                                              </template>\n  \n                                              <template x-if=\"event.image_portrait_thumbnail\">\n                                                  <img class=\"slogkoledard-image\" :src=\"`${event.image_portrait_thumbnail}`\">\n                                              </template>\n                              \n      \n                                                  <div id=\"slogkoledardesc\" class=\"\" x-html=\"event.desc_sl\" style=\"color: var(--kkcdtext);\"></div>\n                                              \n                                              \n                                              <div class=\"slogkoledard-linkwrapper \">\n                                                  \n                                                  <div class=\"slogkoledard-linkw\">\n      \n      \n                                                      <template x-for=\"link in event.links\">\n                                                          <div>\n                                                              <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">Download</span>  \n                                                              <div class=\"flexme-bottom\">\n                                                                   \n                                                                  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\"  style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon-bottom\" viewBox=\"0 0 16 16\">\n                                                                      <path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"></path>\n                                                                      <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"></path>\n                                                                  </svg>\n                                                                  <a class=\"slogkoledard-infotext-bottom\" x-text=\"link.label\" x-bind:href=\"''+link.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                              </div>\n                                                          </div>\n                                                      \n                                                          \n                                                      </template>\n                                  \n                                                      <template x-for=\"attachment in event.attachments\">\n                                                          <div>\n                                                              <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">link</span> \n                                                              <div class=\"flexme-bottom\">  \n                                                                     \n                                                                  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\"  style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon-bottom\" viewBox=\"0 0 16 16\">\n                                                                      <path d=\"M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z\"></path>\n                                                                      <path d=\"M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z\"></path>\n                                                                  </svg>\n                                                                  <a class=\"slogkoledard-infotext-bottom\" x-text=\"attachment.label\" x-bind:href=\"''+attachment.file.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                              </div>\n                                                          </div>\n                                                              \n                                                      </template> \n\n                                                      \n\n                                  \n                                                  </div>\n      \n                                              </div>\n                                              <!---20220305T103000/20220305T184500-->\n                                              <div>\n                                                  <div class=\"kkgcallink\" style=\"background-color: var(--kkcdbgcal);\">\n                                                      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"26\" height=\"26\" fill=\"currentColor\"  style=\"fill: var(--kkcdcaltext);\" class=\"bi bi-calendar-week\" viewBox=\"0 0 16 16\">\n                                                          <path d=\"M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z\"/>\n                                                          <path d=\"M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z\"/>\n                                                      </svg>\n                                                      <a target=\"_blank\" x-bind:href=\"''+event.gcallink\" style=\"color: var(--kkcdcaltext);\">Google Calendar</a>\n                                                  </div>\n                                              </div>\n                                              \n                                             \n                                          </div>\n                                      \n                                      </dialog>\n                                  </div>\n                              </template>\n                          </li>\n                          \n                      </template>\n                  </ul>\n              </template>\n    </section>\n    \n    <section class=\"slider-wrapper langme\"  x-bind:class=\"lngorg ? 'active' : ''\">\n        <button class=\"slide-arrow\" id=\"slide-arrow-prev-at\" @click=\"showPrevat()\">\n          &#8249;\n        </button>\n        \n        <button class=\"slide-arrow\" id=\"slide-arrow-next-at\" @click=\"showNextat()\">\n          &#8250;\n        </button>\n        \n        \n        \n            <template x-if=\"eventsat\"> \n                <ul class=\"slides-container\" id=\"slides-containerat\">\n                    <template x-for=\"events in eventsat\">\n                        <li class=\"slideat\">\n                            <template x-for=\"(event, index) in events\">\n                                <div class=\"slideitem\" style=\"background-color: var(--kkcolorbg);\">\n                                    <div class=\" slogkoledar-eventitem\" @click=\"showDialogat(''+`${event.index}`)\">\n                                        <div class=\"slogkoledar-datewrapper\">\n                                            <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                                <span class=\"slogkoledar-date\">\n                                                    \n                                                    <span class=\"slogkoledar-dateday\" x-text=\"event.daytextde\" style=\"color: var(--kkcolordatetext);\"></span>\n                                             \n                                                    <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                                </span>\n                                            </div>\n                                        </div>\n                                        <div class=\"slogkoledar-eventwrapper \">\n                                            <span class=\"slogkoledar-eventinfo \">\n                                                <span class=\"flexme\">\n                                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                                        <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                        <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                    </svg>\n                                                  \n                                                    <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_de\" style=\"color: var(--kkcolorplacetext);\"></p>\n                                                </span>\n                                                <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_de\" style=\"color: var(--kkcolortitletext);\"></p>\n                                            </span>\n                                            \n                                        </div>\n\n                                        \n                                    </div>  \n                                    <dialog  :id=\"'kkdialogat'+`${event.index}`\">\n                                        <div class=\"kkdialog-header-wrapper\">\n                                            <span class=\"kkdialog-header-dummy\"></span>\n                                            <img src=\"https://slogled.at/wp-content/uploads/2024/03/kklogo.png\">\n                                            <span class=\"kkbackwrapper\">\n                                                <span class=\"kkbacklink\" @click=\"hideDialogat(''+`${event.index}`)\">\n                                                    \n                                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"currentColor\" style=\"fill: var(--kkcdbacktext);\" class=\"slogkoledar-bi slogkoledar-bi-x-lg\" viewBox=\"0 0 16 16\">\n                                                        <path fill-rule=\"evenodd\" d=\"M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                        <path fill-rule=\"evenodd\" d=\"M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708\"/>\n                                                      </svg>\n                                                    <span class=\"kkdialogback\" style=\"color: var(--kkcdbacktext);\">Zurück</span>\n                                                </span>\n                                            </span>\n                                        </div>\n                                        <div class=\"slogkoledard-wrapper\" style=\"background-color: var(--kkcdbg);\">\n                                            <div class=\"slogkoledard-datewrapper \">\n                                                <span class=\"slogkoledard-date\" x-text=\"event.datedetail\" style=\"color: var(--kkcddatetext);\"></span>\n                                            </div>\n                                            <div class=\"\">\n                                                <h2 class=\"slogkoledard-title\" x-text=\"event.title_de\" style=\"color: var(--kkcdtitletext);\" ></h2>\n                                            </div>\n    \n                                            \n    \n                                            <div class=\"slogkoledard-info-wrapper\">\n                                                \n                                                <div class=\"slogkoledard-info\">\n                                                    \n    \n                                                    <template x-if=\"event.starting_at\">\n                                                        <div class=\"flexme\">\n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\"  style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                <path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"></path>\n                                                                <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"></path>\n                                                            </svg>\n                                                            <span class=\"slogkoledard-infotext\" x-text=\"event.starting_at\" style=\"color: var(--kkcdinfotext);\"></span>\n                                                        </div>\n                                                    </template>\n                                                    \n                                                    <template x-if=\"event.venue\">\n                                                        <div class=\"flexme\">\n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                                                <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                                            </svg>\n                                                            <span class=\"slogkoledard-infotext  \" x-text=\"event.loc.name_de\"  style=\"color: var(--kkcdinfotext);\"></span>\n                                                        </div>\n                                                    </template>\n                                \n                                                    <template x-if=\"event.venue\">\n                                                        <div class=\"flexme\">   \n                                                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icondialog\" viewBox=\"0 0 16 16\">\n                                                                <path d=\"M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4\"></path>\n                                                            </svg>\n                                                            <span class=\"slogkoledard-infotext \" x-text=\"event.loc.venuename_de\"  style=\"color: var(--kkcdinfotext);\"></span>\n    \n                                                        </div>\n                                                    </template>\n                                \n                                                </div>\n                                                \n                                \n                                            </div>\n    \n                                            <div class=\"kkinfowrapper\">\n    \n                                                <template x-if=\"event.cat\">\n                                                    <span class=\"kkw1\">\n                                                        <img :src=\"`${event.cat.image.url}`\"/>\n                                                        <div class=\"kkcatwrapper\">                                                    \n                                                            <a class=\"kkcatname\" x-text=\"event.cat.name_de\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                                            <span class=\"kkcategory\" style=\"color: var(--kkcdcatdesctext);\">Kategorie</span>\n                                                        </div>\n                                                    </span>\n                                                </template>\n\n                                                \n    \n                                                <template x-for=\"organizer in event.orga\">\n                                                    <div class=\"kkcatwrapper\">  \n                                                        <a class=\"kkorganizername \" x-text=\"organizer.name_de\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                                        <span class=\"kkorganizer\"  style=\"color: var(--kkcdcatdesctext);\" >Veranstalter</span>\n                                                    </div>\n                                                </template>\n                                                    \n                                            </div>\n                                            \n                                            <template x-if=\"event.image_landscape_thumbnail\">\n                                                <img class=\"slogkoledard-image\" :src=\"`${event.image_landscape_thumbnail}`\">\n                                            </template>\n\n                                            <template x-if=\"event.image_portrait_thumbnail\">\n                                                <img class=\"slogkoledard-image\" :src=\"`${event.image_portrait_thumbnail}`\">\n                                            </template>\n                            \n    \n                                \n                                                <div id=\"slogkoledardesc\" class=\"\" x-html=\"event.desc_de\" style=\"color: var(--kkcdtext);\"></div>\n                                            \n                                            \n                                            <div class=\"slogkoledard-linkwrapper \">\n                                                \n                                                <div class=\"slogkoledard-linkw\">\n    \n    \n                                                    <template x-for=\"link in event.links\">\n                                                        <div>\n                                                            <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">Download</span>  \n                                                            <div class=\"flexme-bottom\">\n                                                                 \n                                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"slogkoledard-info-icon-bottom\" style=\"fill: var(--kkcddlbg);\" viewBox=\"0 0 16 16\">\n                                                                    <path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"></path>\n                                                                    <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"></path>\n                                                                </svg>\n                                                                <a class=\"slogkoledard-infotext-bottom\" x-text=\"link.label\" x-bind:href=\"''+link.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                            </div>\n                                                        </div>\n                                                    \n                                                        \n                                                    </template>\n                                \n                                                    <template x-for=\"attachment in event.attachments\">\n                                                        <div>\n                                                            <span class=\"flexme-bottom-description\" style=\"color: var(--kkcddldesc);\">link</span> \n                                                            <div class=\"flexme-bottom\">  \n                                                                   \n                                                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"slogkoledard-info-icon-bottom\" style=\"fill: var(--kkcddlbg);\" viewBox=\"0 0 16 16\">\n                                                                    <path d=\"M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z\"></path>\n                                                                    <path d=\"M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z\"></path>\n                                                                </svg>\n                                                                <a class=\"slogkoledard-infotext-bottom\" x-text=\"attachment.label\" x-bind:href=\"''+attachment.file.url\" style=\"color: var(--kkcddltext);background-color: var(--kkcddlbg);\"></a>\n                                                            </div>\n                                                        </div>\n                                                            \n                                                    </template> \n\n                                                    \n                                \n                                                </div>\n    \n                                            </div>\n                                            <!---20220305T103000/20220305T184500-->\n                                            <div>\n                                                <div class=\"kkgcallink\"  style=\"background-color: var(--kkcdbgcal);\">\n                                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"26\" height=\"26\" fill=\"currentColor\" style=\"fill: var(--kkcdcaltext);\" class=\"bi bi-calendar-week\" viewBox=\"0 0 16 16\">\n                                                        <path d=\"M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z\"/>\n                                                        <path d=\"M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z\"/>\n                                                    </svg>\n                                                    <a target=\"_blank\" x-bind:href=\"''+event.gcallink\" style=\"color: var(--kkcdcaltext);\">Google Calendar</a>\n                                                </div>\n                                            </div>\n                                            \n                                           \n                                        </div>\n                                    \n                                    </dialog>\n                                </div>\n                            </template>\n                        </li>\n                        \n                    </template>\n                </ul>\n            </template>\n       \n      </section>\n\n    \n    \n</div>\n\n\n\n\n\n  <" + "script>\n    \n  <" + "/script>\n\n";
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./widget.html":
/*!*********************!*\
  !*** ./widget.html ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = "    <div x-data=\"eventCal\" id=\"slogkoldear\" :style=\"detailview ? 'background-color: var(--kkcdbg);' : 'background-color: var(--kkcolorbg);'\" x-bind:class=\"mobopen ? 'moboc' : 'mobcc'\" x-ref=\"theEl\" @scroll.theEl.throttle=\"handleScroll(this)\" >\n        \n            <div x-init=\"fetchEventList\"></div>\n            \n            <a id=\"koledarlink\" href=\"https://www.koledar.at\" target=\"_blank\">\n                poglej vse na koledar.at\n            </a>\n            <div class=\"lng-menu\">\n                <span :style=\"detailview ? 'display:none;' : ''\">\n                    <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? '' : 'active'\" :style=\"detailview ? 'color: var(--kkclang);' : 'color: #fff;'\">SL</span>\n                    <span class=\"lng-menu-item\" x-on:click=\"lngorg = !lngorg\" x-bind:class=\"lngorg ? 'active' : ''\" :style=\"detailview ? 'color: var(--kkclang);' : 'color: #fff;'\">AT</span>\n                </span>\n            </div>\n            \n            <div class=\"slogkoledard-logo\"><img @click=\"hideDetail()\" src=\"https://www.slogled.at/wp-content/themes/Slogled/js/dist/images/logo.webp\"></div>\n            <template x-if=\"eventssl\" >\n                <div x-show=\"listview\" x-transition=\"\" class=\"langme\" x-bind:class=\"lngorg ? '' : 'active'\">\n                    <template x-for=\"event in eventssl\">\n                        <div class=\"slogkoledar-eventitem\" @click=\"showDetail($data.event)\">\n                            <div class=\"slogkoledar-datewrapper\">\n                                <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                    <span class=\"slogkoledar-date\">\n                                        <span class=\"slogkoledar-dateday\" x-text=\"event.daytext\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                        <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\" ></span>\n                                    </span>\n                                </div>\n                            </div>\n                            <div class=\"slogkoledar-eventwrapper \">\n                                <span class=\"slogkoledar-eventinfo \">\n                                    <span class=\"flexme\">\n                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                            <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                            <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                        </svg>\n                                        <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_sl\" style=\"color: var(--kkcolorplacetext);\" ></p>\n                                    </span>\n                                    <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_sl\" style=\"color: var(--kkcolortitletext);\" ></p>\n                                </span>\n                                \n                            </div>\n                        </div>  \n                    </template>\n                </div>\n            </template>\n            <template x-if=\"eventsat\" >\n                <div x-show=\"listview\" x-transition=\"\" class=\"langme\" x-bind:class=\"lngorg ? 'active' : ''\">\n                    <template x-for=\"event in eventsat\">\n                        <div class=\"slogkoledar-eventitem\" @click=\"showDetail($data.event)\">\n                            <div class=\"slogkoledar-datewrapper\">\n                                <div class=\"slogkoledar-datewrapper2 slogkoledar-flex slogkoledar-items-center\"  style=\"background-color: var(--kkcolorbgdate);\">\n                                    <span class=\"slogkoledar-date\">\n                                        <span class=\"slogkoledar-dateday\" x-text=\"event.daytextde\"  style=\"color: var(--kkcolordatetext);\"></span>\n                                        <span class=\"slogkoledar-datemonth \" x-text=\"event.datedm\"  style=\"color: var(--kkcolordatetext);\" ></span>\n                                    </span>\n                                </div>\n                            </div>\n                            <div class=\"slogkoledar-eventwrapper \">\n                                <span class=\"slogkoledar-eventinfo \">\n                                    <span class=\"flexme\">\n                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                            <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                            <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                        </svg>\n                                        <p class=\"slogkoledar-eventinfoplace\" x-text=\"event.loc.name_de\" style=\"color: var(--kkcolorplacetext);\" ></p>\n                                    </span>\n                                    <p class=\"slogkoledar-eventinfotitle\" x-text=\"event.title_de\" style=\"color: var(--kkcolortitletext);\" ></p>\n                                </span>\n                                \n                            </div>\n                        </div>  \n                    </template>\n                </div>\n            </template>\n            <template x-if=\"actevent\">\n                <div class=\"slogkoledard-wrapper\">\n                    <div class=\"slogkoledard-datewrapper \">\n                        <span class=\"slogkoledard-date\" x-text=\"actevent.datedetail\" style=\"color: var(--kkcddatetext);\"></span>\n                        <svg xmlns=\"http://www.w3.org/2000/svg\" @click=\"hideDetail()\" style=\"fill: var(--kkcdbacktext);\" width=\"32\" height=\"32\" fill=\"currentColor\" class=\"slogkoledar-bi slogkoledar-bi-x-lg\" viewBox=\"0 0 16 16\">\n                            <path d=\"M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z\"></path>\n                        </svg>\n                        \n                    </div>\n                    <div class=\"\">\n                        \n                        <h2 class=\"slogkoledard-title\" x-text=\"actevent.title_sl\" x-bind:class=\"lngorg ? '' : 'active'\" style=\"color: var(--kkcdtitletext);\"></h2>\n                        <h2 class=\"slogkoledard-title\" x-text=\"actevent.title_de\" x-bind:class=\"lngorg ? 'active' : ''\" style=\"color: var(--kkcdtitletext);\"></h2>\n                    </div>\n\n                    <div class=\"flexme flexmetags\" > \n                        <template x-for=\"organizer in actevent.orga\">\n                            <span>\n                                <a class=\"tagg langme\" x-text=\"organizer.name_sl\" x-bind:class=\"lngorg ? '' : 'active'\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                                <a class=\"tagg langme\" x-text=\"organizer.name_de\" x-bind:class=\"lngorg ? 'active' : ''\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                            </span>\n                            \n                        </template>\n                    \n                            \n                        <a class=\"tagg langme\" x-text=\"actevent.cat.name_sl\" x-bind:class=\"lngorg ? '' : 'active'\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                        <a class=\"tagg langme\" x-text=\"actevent.cat.name_de\" x-bind:class=\"lngorg ? 'active' : ''\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"></a>\n                            \n                    </div>\n\n                    <div class=\"slogkoledard-info-wrapper\">\n                        \n                        <div class=\"slogkoledard-info\">\n                            \n\n                            <template x-if=\"actevent.starting_at\">\n                                <div class=\"flexme\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                        <path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"></path>\n                                        <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"></path>\n                                    </svg>\n                                    <span class=\"slogkoledard-infotext\" x-text=\"actevent.starting_at\" style=\"color: var(--kkcdinfotext);\"></span>\n                                </div>\n                            </template>\n                            \n                            <template x-if=\"actevent.loc\">\n                                <div class=\"flexme\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                        <path d=\"M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10\"></path>\n                                        <path d=\"M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"></path>\n                                    </svg>\n                                    <span class=\"slogkoledard-infotext langme\" x-text=\"actevent.loc.name_sl\" style=\"color: var(--kkcdinfotext);\" x-bind:class=\"lngorg ? '' : 'active'\"></span>\n                                    <span class=\"slogkoledard-infotext langme\" x-text=\"actevent.loc.name_sl\" style=\"color: var(--kkcdinfotext);\" x-bind:class=\"lngorg ? 'active' : ''\"></span>\n                                </div>\n                            </template>\n        \n                            <template x-if=\"actevent.loc\">\n                                <div class=\"flexme\">   \n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"fill: var(--kkcdinfoicon);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                        <path d=\"M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4\"></path>\n                                    </svg>\n                                    <span class=\"slogkoledard-infotext langme\" x-text=\"actevent.loc.venuename_sl\" style=\"color: var(--kkcdinfotext);\" x-bind:class=\"lngorg ? '' : 'active'\"></span>\n                                    <span class=\"slogkoledard-infotext langme\" x-text=\"actevent.loc.venuename_sl\" style=\"color: var(--kkcdinfotext);\" x-bind:class=\"lngorg ? 'active' : ''\"></span>\n\n                                </div>\n                            </template>\n        \n                        </div>\n                        \n        \n                    </div>\n                    \n                    <template x-if=\"actevent.image_landscape_thumbnail\">\n                        <img class=\"slogkoledard-image\" :src=\"`${actevent.image_landscape_thumbnail}`\">\n                    </template>\n\n                    <template x-if=\"actevent.image_portrait\">\n                        <img class=\"slogkoledard-image\" :src=\"actevent.image_portrait.url\">\n                    </template>\n\n                    <div x-data=\"{ opendesc: false }\"></div>\n                    <div x-data=\"{ opendescmargin: true }\"></div>\n                    <div x-bind:class=\"opendesc ? 'skdmaxheight' : ''\">\n                        <div id=\"slogkoledardesc\" x-html=\"actevent.desc_sl\" x-bind:class=\"lngorg ? '' : 'active'\" style=\"color: var(--kkcdtext);\"></div>\n                    </div>\n                    <div x-bind:class=\"opendesc ? 'skdmaxheight' : ''\">\n                        <div id=\"slogkoledardesc\" x-html=\"actevent.desc_de\" x-bind:class=\"lngorg ? 'active' : ''\" style=\"color: var(--kkcdtext);\"></div>\n                    </div>\n                    \n                    \n                    <div class=\"descdetail\" x-bind:class=\"lngorg ? '' : 'active'\">\n\n                        <div id=\"slogkoledardescmore\" x-on:click=\"opendescmargin = !opendescmargin\" x-bind:class=\"opendescmargin ? 'opendescmargin' : ''\">\n                            <span class=\"bg\" style=\"background-color: var(--kkcdbg);\"></span>\n                            <span class=\"morelink\" x-on:click=\"opendesc = !opendesc\" x-bind:class=\"opendescmargin ? '' : 'active'\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"> več</span>\n                            <span class=\"morelink\" x-on:click=\"opendesc = !opendesc\" x-bind:class=\"opendescmargin ? 'active' : ''\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\"> manj</span>\n                        </div>\n                    </div>\n                    <div class=\"descdetail\" x-bind:class=\"lngorg ? 'active' : ''\">\n\n                        <div id=\"slogkoledardescmore\" x-on:click=\"opendescmargin = !opendescmargin\" x-bind:class=\"opendescmargin ? 'opendescmargin' : ''\">\n                            <span class=\"bg\" style=\"background-color: var(--kkcdbg);\"></span>\n                            <span class=\"morelink\" x-on:click=\"opendesc = !opendesc\" x-bind:class=\"opendescmargin ? '' : 'active'\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\">mehr</span>\n                            <span class=\"morelink\" x-on:click=\"opendesc = !opendesc\" x-bind:class=\"opendescmargin ? 'active' : ''\" style=\"background-color: var(--kkcdbgcattext);color: var(--kkcdcattext);\">weniger</span>\n                        </div>\n                    </div>\n                        \n                    \n                    \n                    \n                    <div class=\"slogkoledard-linkwrapper \">\n                        \n                        <div class=\"slogkoledard-linkw\">\n\n\n                            <template x-for=\"link in actevent.links\">\n                                \n                                    <div class=\"flexme\">   \n                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                            <path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"></path>\n                                            <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"></path>\n                                        </svg>\n                                        <a class=\"slogkoledard-infotext\" x-text=\"link.label\" x-bind:href=\"''+link.url\" style=\"color: var(--kkcddltext);\"></a>\n                                    </div>\n                            \n                                \n                            </template>\n        \n                            <template x-for=\"attachment in actevent.attachments\">\n                                    <div class=\"flexme\">   \n                                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" style=\"fill: var(--kkcddlbg);\" class=\"slogkoledard-info-icon\" viewBox=\"0 0 16 16\">\n                                            <path d=\"M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z\"></path>\n                                            <path d=\"M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z\"></path>\n                                        </svg>\n                                        <a class=\"slogkoledard-infotext\" x-text=\"attachment.label\" x-bind:href=\"''+attachment.file.url\" style=\"color: var(--kkcddltext);\"></a>\n                                    </div>\n                            </template>\n        \n                        </div>\n\n                    </div>\n                    \n                    <div class=\"slogkoledard-exiticon\">\n                        <svg xmlns=\"http://www.w3.org/2000/svg\" @click=\"hideDetail()\" width=\"32\" height=\"32\" fill=\"currentColor\" style=\"fill: var(--kkcdbacktext);\" class=\"\" viewBox=\"0 0 16 16\">\n                            <path d=\"M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z\"></path>\n                        </svg>\n                    </div>\n                </div>\n        \n            </template>\n            <template x-if=\"showbutton\">\n                <a href=\"#\" id=\"slogkoledar-loadmorebutton\" class=\"\" x-on:click=\"fetchAddEventList('append')\" style=\"display:none;\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" style=\"margin-right: 1rem;\" viewBox=\"0 0 16 16\">\n                    <path fill-rule=\"evenodd\" d=\"M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5\"></path>\n                    <path fill-rule=\"evenodd\" d=\"M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z\"></path>\n                    </svg><span  class=\"buttontext\" x-bind:class=\"lngorg ? '' : 'active'\">več terminov</span><span class=\"buttontext\" x-bind:class=\"lngorg ? 'active' : ''\">mehr Termine</span>\n                </a>\n            </template>\n            <span class=\"mobbutton\" x-on:click=\"mobopen = !mobopen\">\n                <span class=\"buttontext\"> Koledar.at</span>\n                <image src=\"https://spz.slo.at/wp-content/uploads/2024/02/logok.png\"/>\n            </span>\n    \n    </div>\n    \n    \n    ";
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/kkapp.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _initAlpine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./initAlpine */ "./src/initAlpine.js");
/* harmony import */ var _injectCSS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./injectCSS */ "./src/injectCSS.js");
// app.js


(0,_initAlpine__WEBPACK_IMPORTED_MODULE_0__["default"])();
(0,_injectCSS__WEBPACK_IMPORTED_MODULE_1__["default"])();
})();

/******/ })()
;