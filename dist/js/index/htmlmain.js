// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"domain/domain.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Objective = exports.MetaData = void 0;

var MetaData =
/** @class */
function () {
  function MetaData(description, members) {
    this.description = description;
    this.members = members;
  }

  MetaData.prototype.toObject = function () {
    return {
      description: this.description,
      members: this.members
    };
  };

  return MetaData;
}();

exports.MetaData = MetaData;
var Objective;

(function (Objective) {
  var Entity =
  /** @class */
  function () {
    function Entity(id, title, parent, metaData) {
      this.id = id;
      this.title = title;
      this.parent = parent;
      this.metaData = metaData;
      this.isRoot = parent ? false : true;
      this.isNotRoot = !this.isRoot;
    }

    Entity.prototype.toObject = function () {
      return {
        id: this.id.toObject(),
        title: this.title,
        parent: this.parent ? this.parent.toObject() : null,
        metaData: this.metaData.toObject()
      };
    };

    Entity.root = function () {
      return new Entity(Id.create(0), 'root', null, new MetaData('', []));
    };

    return Entity;
  }();

  Objective.Entity = Entity;

  var Id =
  /** @class */
  function () {
    function Id(value) {
      this.value = value;
    }

    Id.create = function (num) {
      return new Id('O' + num);
    };

    Id.prototype.toObject = function () {
      return this.value;
    };

    return Id;
  }();

  Objective.Id = Id;
})(Objective = exports.Objective || (exports.Objective = {}));
},{}],"infra/infra.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataStore = exports.OnMemoryObjectiveDataStore = exports.ObjectiveRepositoryImpl = void 0;

var domain_1 = require("../domain/domain");

var ObjectiveRepositoryImpl =
/** @class */
function () {
  function ObjectiveRepositoryImpl(dataStore) {
    this.dataStore = dataStore;
    this.onMemoryObjectiveDataStore = new OnMemoryObjectiveDataStore(dataStore.findAllObjective());
  }

  ObjectiveRepositoryImpl.prototype.createId = function (callback) {
    var num = Math.floor(Date.now() / 1000);
    setTimeout(function () {
      return callback(null, domain_1.Objective.Id.create(num));
    }, 100);
  };

  ObjectiveRepositoryImpl.prototype.findAll = function () {
    return this.onMemoryObjectiveDataStore.findAll();
  };

  ObjectiveRepositoryImpl.prototype.findById = function (id) {
    return this.onMemoryObjectiveDataStore.findById(id);
  };

  ObjectiveRepositoryImpl.prototype.findUnder = function (rootId) {
    var _this = this; // 全体のツーリを作る


    var map = {}; //key:親, value: 子たち

    this.findAll().filter(function (v) {
      return v.parent;
    }).forEach(function (v) {
      if (!map[v.parent.value]) {
        map[v.parent.value] = [];
      }

      map[v.parent.value].push(v.id);
    });

    var getChildren = function getChildren(rootId) {
      var list = [_this.findById(rootId)];

      if (!map[rootId.value]) {
        return list;
      }

      map[rootId.value].forEach(function (ch) {
        return getChildren(ch).forEach(function (v) {
          return list.push(v);
        });
      });
      return list;
    };

    return getChildren(rootId);
  };

  ObjectiveRepositoryImpl.prototype.update = function (entity, callback) {
    var _this = this;

    if (!this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error("entity not found: " + entity.id.value);
    }

    this.dataStore.isExist(entity.id, function (e, v) {
      if (e) {
        callback(e);
        return;
      }

      if (!v) {
        callback(new Error('entity not found: ' + entity.id.value));
        return;
      }

      _this.dataStore.update(entity, function (e) {
        if (e) {
          callback(e);
          return;
        }

        _this.onMemoryObjectiveDataStore.update(entity);

        callback(null);
      });
    });
  };

  ObjectiveRepositoryImpl.prototype.insert = function (entity, callback) {
    var _this = this;

    if (this.onMemoryObjectiveDataStore.isExist(entity.id)) {
      throw new Error("entity already exists: " + entity.id.value);
    }

    this.dataStore.isExist(entity.id, function (e, v) {
      if (e) {
        callback(e);
        return;
      }

      if (v) {
        throw new Error("entity already exists: " + entity.id.value);
        return;
      }

      _this.dataStore.insert(entity, function (e) {
        if (e) {
          callback(e);
          return;
        }

        _this.onMemoryObjectiveDataStore.insert(entity);

        callback(null);
      });
    });
  };

  return ObjectiveRepositoryImpl;
}();

exports.ObjectiveRepositoryImpl = ObjectiveRepositoryImpl;

var OnMemoryObjectiveDataStore =
/** @class */
function () {
  function OnMemoryObjectiveDataStore(entities) {
    var _this = this;

    this.entityMap = {};
    entities.forEach(function (v) {
      return _this.entityMap[v.id.value] = v;
    });
  }

  OnMemoryObjectiveDataStore.prototype.findAll = function () {
    var _this = this;

    return Object.keys(this.entityMap).map(function (key) {
      return _this.entityMap[key];
    });
  };

  OnMemoryObjectiveDataStore.prototype.findById = function (id) {
    return this.entityMap[id.value];
  };

  OnMemoryObjectiveDataStore.prototype.isExist = function (id) {
    return this.entityMap[id.value] ? true : false;
  };

  OnMemoryObjectiveDataStore.prototype.update = function (entity) {
    if (!this.isExist(entity.id)) {
      throw new Error("entity not found: " + entity.id.value);
    }

    this.entityMap[entity.id.value] = entity;
    console.log('update onMemory');
  };

  OnMemoryObjectiveDataStore.prototype.insert = function (entity) {
    if (this.isExist(entity.id)) {
      throw new Error("entity already exists: " + entity.id.value);
    }

    this.entityMap[entity.id.value] = entity;
    console.log('insert onMemory');
  };

  return OnMemoryObjectiveDataStore;
}();

exports.OnMemoryObjectiveDataStore = OnMemoryObjectiveDataStore;

var DataStore =
/** @class */
function () {
  function DataStore() {
    this.callCount = 0;
  }

  DataStore.prototype.findAllObjective = function () {
    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    var raw = localStorage.getItem('objectiveTree');

    if (!raw) {
      raw = JSON.stringify([domain_1.Objective.Entity.root()].map(function (v) {
        return v.toObject();
      }));
      localStorage.setItem('objectiveTree', raw);
    }

    console.log(raw);
    this.list = JSON.parse(raw).map(function (v) {
      return new domain_1.Objective.Entity(new domain_1.Objective.Id(v.id), v.title, v.parent ? new domain_1.Objective.Id(v.parent) : null, new domain_1.MetaData(v.metaData.description, v.metaData.members));
    });
    return this.list;
  };

  DataStore.prototype.update = function (entity, callback) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.save();
        setTimeout(function () {
          return callback(null);
        }, 100);
        return;
      }
    }

    setTimeout(function () {
      return callback(new Error("entity not found: " + entity.id.value));
    }, 100);
  };

  DataStore.prototype.insert = function (entity, callback) {
    this.list.push(entity);
    this.save();
    callback(null);
  };

  DataStore.prototype.isExist = function (id, callback) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id.value == id.value) {
        setTimeout(function () {
          return callback(null, true);
        }, 100);
        return;
      }
    }

    setTimeout(function () {
      return callback(null, false);
    }, 100);
  };

  DataStore.prototype.save = function () {
    var raw = JSON.stringify(this.list.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    localStorage.setItem('objectiveTree', raw);
  };

  return DataStore;
}();

exports.DataStore = DataStore;
},{"../domain/domain":"domain/domain.ts"}],"htmlmain.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var domain_1 = require("./domain/domain");

var infra_1 = require("./infra/infra");

function q(selector) {
  return document.querySelector(selector);
}

function qclick(selector, callback) {
  return document.querySelector(selector).addEventListener('click', callback);
}

try {
  var toMermaid_1 = function toMermaid_1(entities) {
    var map = {};
    entities.forEach(function (v) {
      return map[v.id.value] = v;
    });
    var rectText = entities.map(function (v) {
      return v.id.value + "[\"" + v.title + "\"]";
    }).join('\n');
    var linkText = entities.map(function (v) {
      return "click " + v.id.value + " \"./index.html#" + v.id.value + "\"";
    }).join('\n');
    var arrowText = entities.filter(function (v) {
      return v.parent && map[v.parent.value];
    }).map(function (v) {
      return v.id.value + " --> " + v.parent.value;
    }).join('\n');
    return ("\ngraph LR\n" + rectText + "\n" + linkText + "\n" + arrowText + "\n  ").trim();
  };

  var objectiveRepository_1 = new infra_1.ObjectiveRepositoryImpl(new infra_1.DataStore());

  var onTreeUpdate_1 = function onTreeUpdate_1() {
    var treeRootId = new domain_1.Objective.Id(q('#rootIdSpan').value);
    var element = document.querySelector("#profu");
    console.log(objectiveRepository_1.findAll());
    var entities = objectiveRepository_1.findUnder(treeRootId);
    var text = toMermaid_1(entities);
    console.log(text);

    var insertSvg = function insertSvg(svgCode, bindFunctions) {
      element.innerHTML = svgCode;
    };

    var graph = mermaid.mermaidAPI.render('graphDiv', text, function (svg) {
      return element.innerHTML = svg;
    });
  };

  onTreeUpdate_1();
  qclick('#applyRootIdButton', function () {
    onTreeUpdate_1();
  });
  qclick('#applyTargetIdButton', function () {
    var id = new domain_1.Objective.Id(q('#targetId').value);
    var objective = objectiveRepository_1.findById(id);
    console.log(objective);
    q('#idSpan').innerHTML = objective.id.value;
    q('#titleInput').value = objective.title;
    q('#parentsInput').value = objective.parent.value;
    q('#detailTextArea').value = objective.metaData.description;
  });
  qclick('#createSubButton', function () {
    q('#parentsInput').value = q('#idSpan').innerHTML;
    q('#idSpan').innerHTML = '';
    q('#titleInput').value = '';
    q('#detailTextArea').value = '';
  });
  qclick('#saveButton', function () {
    if (q('#idSpan').innerHTML.trim().length == 0) {
      alert('ID未確定のため更新できません');
      throw new Error('ID未確定のため更新できません');
    }

    var newEntity = new domain_1.Objective.Entity(new domain_1.Objective.Id(q('#idSpan').innerHTML), q('#titleInput').value, new domain_1.Objective.Id(q('#parentsInput').value), new domain_1.MetaData(q('#detailTextArea').value, []));

    if (newEntity.id.value == newEntity.parent.value) {
      alert('IDとparentが同一です');
      throw new Error('IDとparentが同一です');
    }

    objectiveRepository_1.update(newEntity, function (e) {
      console.log('callback');

      if (e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }

      onTreeUpdate_1();
    });
  });
  qclick('#insertButton', function () {
    objectiveRepository_1.createId(function (err, id) {
      var newEntity = new domain_1.Objective.Entity(id, q('#titleInput').value, new domain_1.Objective.Id(q('#parentsInput').value), new domain_1.MetaData(q('#detailTextArea').value, []));
      objectiveRepository_1.insert(newEntity, function (e) {
        console.log('callback');

        if (e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }

        onTreeUpdate_1();
      });
    });
  });
} catch (e) {
  console.error(e);
}

window.addEventListener('hashchange', function (e) {
  q('#targetId').value = window.location.hash.slice(1);
});

if (location.hash) {
  q('#targetId').value = window.location.hash.slice(1);
}
},{"./domain/domain":"domain/domain.ts","./infra/infra":"infra/infra.ts"}],"../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55111" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js","htmlmain.ts"], null)
//# sourceMappingURL=/htmlmain.js.map