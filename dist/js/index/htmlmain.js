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
exports.Link = exports.MetaData = exports.Task = exports.TaskLimitDate = exports.Note = void 0;

var Note =
/** @class */
function () {
  function Note(value) {
    this.value = value;
  }

  Note.prototype.toObject = function () {
    return this.value;
  };

  Note.prototype.isNotEmpty = function () {
    return this.value.trim().length > 0;
  };

  Note.empty = function () {
    return new Note('');
  };

  return Note;
}();

exports.Note = Note;

var TaskLimitDate =
/** @class */
function () {
  function TaskLimitDate(raw) {
    this.raw = raw;
  }

  TaskLimitDate.prototype.toObject = function () {
    return this.raw;
  };

  return TaskLimitDate;
}();

exports.TaskLimitDate = TaskLimitDate;

var Task =
/** @class */
function () {
  function Task(limitDate, title) {
    this.limitDate = limitDate;
    this.title = title;
  }

  Task.prototype.toObject = function () {
    return {
      limitDate: this.limitDate.toObject(),
      title: this.title
    };
  };

  return Task;
}();

exports.Task = Task;

var MetaData =
/** @class */
function () {
  function MetaData(description, members, links, note, tasks) {
    this.description = description;
    this.members = members;
    this.links = links;
    this.note = note;
    this.tasks = tasks;
  }

  MetaData.prototype.toObject = function () {
    return {
      description: this.description,
      members: this.members,
      links: this.links.map(function (v) {
        return v.toObject();
      }),
      note: this.note.toObject(),
      tasks: this.tasks.map(function (v) {
        return v.toObject();
      })
    };
  };

  MetaData.empty = function () {
    return new MetaData('', [], [], Note.empty(), []);
  };

  return MetaData;
}();

exports.MetaData = MetaData;

var Link =
/** @class */
function () {
  function Link(name, path) {
    this.name = name;
    this.path = path;
  }

  Link.prototype.toObject = function () {
    return {
      name: this.name,
      path: this.path
    };
  };

  return Link;
}();

exports.Link = Link;
},{}],"domain/Objective.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Objective = void 0;

var domain_1 = require("./domain");

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

      if (id.eq(parent)) {
        throw new Error('IDとparentが同一です');
      }

      if (!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
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
      return new Entity(Id.create(0), 'root', null, domain_1.MetaData.empty());
    };

    return Entity;
  }();

  Objective.Entity = Entity;

  var Id =
  /** @class */
  function () {
    function Id(value) {
      this.value = value;
      this._class = 'Objective.Id';
    }

    Id.create = function (num) {
      return new Id('O' + num);
    };

    Id.prototype.toObject = function () {
      return this.value;
    };

    Id.prototype.eq = function (other) {
      return other && this.value === other.value;
    };

    return Id;
  }();

  Objective.Id = Id;
})(Objective = exports.Objective || (exports.Objective = {}));
},{"./domain":"domain/domain.ts"}],"domain/Action.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Action = void 0;
var Action;

(function (Action) {
  var Entity =
  /** @class */
  function () {
    function Entity(id, title, parents, metaData) {
      this.id = id;
      this.title = title;
      this.parents = parents;
      this.metaData = metaData;

      if (!title || title.trim().length == 0) {
        throw new Error('タイトルが空です');
      }
    }

    Entity.prototype.toObject = function () {
      return {
        id: this.id.toObject(),
        title: this.title,
        parents: this.parents.map(function (v) {
          return v.toObject();
        }),
        metaData: this.metaData.toObject()
      };
    };

    return Entity;
  }();

  Action.Entity = Entity;

  var Id =
  /** @class */
  function () {
    function Id(value) {
      this.value = value;
    }

    Id.create = function (num) {
      return new Id('A' + num);
    };

    Id.prototype.toObject = function () {
      return this.value;
    };

    Id.prototype.eq = function (other) {
      return other && this.value === other.value;
    };

    return Id;
  }();

  Action.Id = Id;
})(Action = exports.Action || (exports.Action = {}));
},{}],"infra/datastore/DataStoreUtils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataStoreUtils = void 0;

var domain_1 = require("../../domain/domain");

var Action_1 = require("../../domain/Action");

var Objective_1 = require("../../domain/Objective");

var DataStoreUtils =
/** @class */
function () {
  function DataStoreUtils() {}

  DataStoreUtils.dataToObjectiveEntity = function (v) {
    return new Objective_1.Objective.Entity(new Objective_1.Objective.Id(v.id), v.title, v.parent ? new Objective_1.Objective.Id(v.parent) : null, new domain_1.MetaData(v.metaData.description, v.metaData.members || [], v.metaData.links ? v.metaData.links.map(function (v) {
      return new domain_1.Link(v.name, v.path);
    }) : [], new domain_1.Note(v.note || v.metaData.note || ''), v.metaData.tasks ? v.metaData.tasks.map(function (v) {
      return new domain_1.Task(new domain_1.TaskLimitDate(v.limitDate), v.title);
    }) : []));
  };

  DataStoreUtils.dataToActionEntity = function (v) {
    return new Action_1.Action.Entity(new Objective_1.Objective.Id(v.id), v.title, v.parents.map(function (v) {
      return new Action_1.Action.Id(v);
    }), new domain_1.MetaData(v.metaData.description, v.metaData.members || [], v.metaData.links ? v.metaData.links.map(function (v) {
      return new domain_1.Link(v.name, v.path);
    }) : [], new domain_1.Note(v.note || v.metaData.note || ''), v.metaData.tasks ? v.metaData.tasks.map(function (v) {
      return new domain_1.Task(new domain_1.TaskLimitDate(v.limitDate), v.title);
    }) : []));
  };

  return DataStoreUtils;
}();

exports.DataStoreUtils = DataStoreUtils;
},{"../../domain/domain":"domain/domain.ts","../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts"}],"infra/datastore/DataStoreGithub.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataStoreGithubIssue = void 0;

var Objective_1 = require("../../domain/Objective");

var DataStoreUtils_1 = require("./DataStoreUtils");

var DataStoreGithubIssue =
/** @class */
function () {
  function DataStoreGithubIssue(objectiveIssueNumber, actionIssueNumber, issueRepository) {
    this.objectiveIssueNumber = objectiveIssueNumber;
    this.actionIssueNumber = actionIssueNumber;
    this.issueRepository = issueRepository;
    this.callCount = 0;
  }

  DataStoreGithubIssue.prototype.findAll = function (callback) {
    var _this = this;

    this.findAllObjective(function (err, objectives) {
      if (err) {
        callback(err, null, null);
        return;
      }

      _this.findAllAction(function (err, actions) {
        if (err) {
          callback(err, null, null);
          return;
        }

        setTimeout(function () {
          return callback(null, objectives, actions);
        }, 100);
      });
    });
  };

  DataStoreGithubIssue.prototype.findAllObjective = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    this.issueRepository.getIssue(this.objectiveIssueNumber, function (err, issue) {
      if (err) {
        callback(err, null);
        return;
      }

      var raw = issue.body;

      if (!raw || raw.trim().length == 0) {
        raw = JSON.stringify([Objective_1.Objective.Entity.root()].map(function (v) {
          return v.toObject();
        }));
      }

      console.log(raw);
      _this.list = JSON.parse(raw).map(function (v) {
        return DataStoreUtils_1.DataStoreUtils.dataToObjectiveEntity(v);
      });
      callback(null, _this.list);
    });
  };

  DataStoreGithubIssue.prototype.findAllAction = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    this.issueRepository.getIssue(this.actionIssueNumber, function (err, issue) {
      var raw = issue.body;

      if (!raw || raw.trim().length == 0) {
        raw = '[]';
      }

      console.log(raw);
      _this.actions = JSON.parse(raw).map(function (v) {
        return DataStoreUtils_1.DataStoreUtils.dataToActionEntity(v);
      });
      callback(null, _this.actions);
    });
  };

  DataStoreGithubIssue.prototype.updateObjective = function (entity, callback) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.saveObjective(callback);
        return;
      }
    }

    setTimeout(function () {
      return callback(new Error("entity not found: " + entity.id.value));
    }, 100);
  };

  DataStoreGithubIssue.prototype.updateAction = function (entity, callback) {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].id.value == entity.id.value) {
        this.actions[i] = entity;
        this.saveAction(callback);
        return;
      }
    }

    setTimeout(function () {
      return callback(new Error("entity not found: " + entity.id.value));
    }, 100);
  };

  DataStoreGithubIssue.prototype.insertObjective = function (entity, callback) {
    this.list.push(entity);
    this.saveObjective(callback);
  };

  DataStoreGithubIssue.prototype.insertAction = function (entity, callback) {
    this.actions.push(entity);
    this.saveAction(callback);
  };

  DataStoreGithubIssue.prototype.removeObjective = function (id, callback) {
    this.list = this.list.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveObjective(callback);
  };

  DataStoreGithubIssue.prototype.removeAction = function (id, callback) {
    this.actions = this.actions.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveAction(callback);
  };

  DataStoreGithubIssue.prototype.saveObjective = function (callback) {
    var raw = JSON.stringify(this.list.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    this.issueRepository.updateBody(this.objectiveIssueNumber, raw, callback);
  };

  DataStoreGithubIssue.prototype.saveAction = function (callback) {
    var raw = JSON.stringify(this.actions.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    this.issueRepository.updateBody(this.actionIssueNumber, raw, callback);
  };

  return DataStoreGithubIssue;
}();

exports.DataStoreGithubIssue = DataStoreGithubIssue;
},{"../../domain/Objective":"domain/Objective.ts","./DataStoreUtils":"infra/datastore/DataStoreUtils.ts"}],"infra/datastore/DataStoreLocalStorage.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataStoreLocalStorage = void 0;

var Objective_1 = require("../../domain/Objective");

var DataStoreUtils_1 = require("./DataStoreUtils");

var DataStoreLocalStorage =
/** @class */
function () {
  function DataStoreLocalStorage() {
    this.callCount = 0;
  }

  DataStoreLocalStorage.prototype.findAll = function (callback) {
    var _this = this;

    this.findAllObjective(function (err, objectives) {
      if (err) {
        callback(err, null, null);
        return;
      }

      _this.findAllAction(function (err, actions) {
        if (err) {
          callback(err, null, null);
          return;
        }

        setTimeout(function () {
          return callback(null, objectives, actions);
        }, 100);
      });
    });
  };

  DataStoreLocalStorage.prototype.findAllObjective = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    var raw = localStorage.getItem('objectiveTree');

    if (!raw) {
      raw = JSON.stringify([Objective_1.Objective.Entity.root()].map(function (v) {
        return v.toObject();
      }));
      localStorage.setItem('objectiveTree', raw);
    }

    console.log(raw);
    this.list = JSON.parse(raw).map(function (v) {
      return DataStoreUtils_1.DataStoreUtils.dataToObjectiveEntity(v);
    });
    setTimeout(function () {
      return callback(null, _this.list);
    }, 100);
  };

  DataStoreLocalStorage.prototype.findAllAction = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    var raw = localStorage.getItem('actionTree');

    if (!raw) {
      raw = '[]';
      localStorage.setItem('actionTree', raw);
    }

    console.log(raw);
    this.actions = JSON.parse(raw).map(function (v) {
      return DataStoreUtils_1.DataStoreUtils.dataToActionEntity(v);
    });
    setTimeout(function () {
      return callback(null, _this.actions);
    }, 100);
  };

  DataStoreLocalStorage.prototype.updateObjective = function (entity, callback) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id.value == entity.id.value) {
        this.list[i] = entity;
        this.saveObjective();
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

  DataStoreLocalStorage.prototype.updateAction = function (entity, callback) {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].id.value == entity.id.value) {
        this.actions[i] = entity;
        this.saveAction();
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

  DataStoreLocalStorage.prototype.insertObjective = function (entity, callback) {
    this.list.push(entity);
    this.saveObjective();
    setTimeout(function () {
      return callback(null);
    }, 100);
  };

  DataStoreLocalStorage.prototype.insertAction = function (entity, callback) {
    this.actions.push(entity);
    this.saveAction();
    setTimeout(function () {
      return callback(null);
    }, 100);
  };

  DataStoreLocalStorage.prototype.removeObjective = function (id, callback) {
    this.list = this.list.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveObjective();
    setTimeout(function () {
      return callback(null);
    }, 100);
  };

  DataStoreLocalStorage.prototype.removeAction = function (id, callback) {
    this.actions = this.actions.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveAction();
    setTimeout(function () {
      return callback(null);
    }, 100);
  };

  DataStoreLocalStorage.prototype.saveObjective = function () {
    var raw = JSON.stringify(this.list.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    localStorage.setItem('objectiveTree', raw);
  };

  DataStoreLocalStorage.prototype.saveAction = function () {
    var raw = JSON.stringify(this.actions.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    localStorage.setItem('actionTree', raw);
  };

  return DataStoreLocalStorage;
}();

exports.DataStoreLocalStorage = DataStoreLocalStorage;
},{"../../domain/Objective":"domain/Objective.ts","./DataStoreUtils":"infra/datastore/DataStoreUtils.ts"}],"infra/infra.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IssueRepositoryImpl = exports.IssueNumber = void 0;

var IssueNumber =
/** @class */
function () {
  function IssueNumber(value) {
    this.value = value;
  }

  return IssueNumber;
}();

exports.IssueNumber = IssueNumber;

var IssueRepositoryImpl =
/** @class */
function () {
  function IssueRepositoryImpl(githubToken, owner, repo, isOnlyOpenIssue, GitHub) {
    this.isOnlyOpenIssue = isOnlyOpenIssue;
    this.gh = new GitHub({
      token: githubToken
    });
    this.issues = this.gh.getIssues(owner, repo);
  }

  IssueRepositoryImpl.prototype.getIssue = function (issueNumber, callback) {
    this.issues.getIssue(issueNumber.value, callback);
  };

  IssueRepositoryImpl.prototype.updateTitle = function (issueNumber, title, callback) {
    this.issues.editIssue(issueNumber.value, {
      title: title
    }, callback);
  };

  IssueRepositoryImpl.prototype.updateBody = function (issueNumber, body, callback) {
    this.issues.editIssue(issueNumber.value, {
      body: body
    }, callback);
  };

  IssueRepositoryImpl.prototype.createIssue = function (issue, callback) {
    this.issues.createIssue(issue, callback);
  };

  return IssueRepositoryImpl;
}();

exports.IssueRepositoryImpl = IssueRepositoryImpl;
},{}],"infra/view/MermaidConvertor.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MermaidConvertor = void 0;

var MermaidConvertor =
/** @class */
function () {
  function MermaidConvertor() {}

  MermaidConvertor.toMermaidScript = function (entities, actions, treeCenterId, selectedId) {
    var isSelected = function isSelected(id) {
      return id == treeCenterId.getValue() || selectedId && id == selectedId.getValue();
    };

    var map = {};
    entities.forEach(function (v) {
      return map[v.id.value] = v;
    });
    var rectText = entities.map(function (v) {
      return v.id.value + "[\"" + v.title + "\"]" + (isSelected(v.id.value) ? ':::objective_select' : '');
    }).join('\n');
    var linkText = entities.map(function (v) {
      return "click " + v.id.value + " \"./index.html#" + v.id.value + "\"";
    }).join('\n');
    var arrowText = entities.filter(function (v) {
      return v.parent && map[v.parent.value];
    }).map(function (v) {
      return v.id.value + " --> " + v.parent.value;
    }).join('\n');
    var roundText = actions.map(function (v) {
      return v.id.value + "(\"" + v.title + "<br>" + v.metaData.members.join(', ') + "\"):::action" + (isSelected(v.id.value) ? '_select' : '');
    }).join('\n');
    var actionLinkText = actions.map(function (v) {
      return "click " + v.id.value + " \"./index.html#" + v.id.value + "\"";
    }).join('\n');
    var actionArrowText = actions.map(function (v) {
      return v.parents.map(function (p) {
        return v.id.value + " --> " + p.value;
      }).join('\n');
    }).join('\n');
    var noteText = actions.filter(function (v) {
      return v.metaData.note.isNotEmpty();
    }).map(function (v) {
      return v.id.value + "_note[\"" + v.metaData.note.value.split('\n').join('<br>') + "\"]:::note";
    }).join('\n');
    var noteArrowText = actions.filter(function (v) {
      return v.metaData.note.isNotEmpty();
    }).map(function (v) {
      return v.id.value + "_note --- " + v.id.value;
    }).join('\n');
    return ("\n%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '10px', 'lineColor': '#888'}}}%%\ngraph LR\nclassDef objective_select stroke-width:4px;\nclassDef action fill:#ECFFEC, stroke: #93DB70;\nclassDef action_select fill:#ECFFEC, stroke: #93DB70, stroke-width:4px;\nclassDef note fill:#FFFFEC, stroke: #DBDB93;\n" + rectText + "\n" + linkText + "\n" + arrowText + "\n" + roundText + "\n" + actionLinkText + "\n" + actionArrowText + "\n" + noteText + "\n" + noteArrowText + "\n  ").trim();
  };

  return MermaidConvertor;
}();

exports.MermaidConvertor = MermaidConvertor;
},{}],"infra/view/MetaDataConverter.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetaDataConverter = exports.MetaDataForm = void 0;

var domain_1 = require("../../domain/domain");

var MetaDataForm =
/** @class */
function () {
  function MetaDataForm() {
    this.value = '';
  }

  MetaDataForm.prototype.set = function (metaData) {
    this.value = MetaDataConverter.toText(metaData);
  };

  MetaDataForm.prototype.get = function () {
    return MetaDataConverter.toMetaData(this.value);
  };

  return MetaDataForm;
}();

exports.MetaDataForm = MetaDataForm;

var MetaDataConverter =
/** @class */
function () {
  function MetaDataConverter() {}

  MetaDataConverter.toMetaData = function (text) {
    if (text.trim()[0] != '#') {
      return new domain_1.MetaData(text, [], [], domain_1.Note.empty(), []);
    }

    var obj = MetaDataConverter.textToObj(text);
    console.log(obj);
    return new domain_1.MetaData(obj['説明'] || '', obj['担当'] ? obj['担当'].split(',').map(function (v) {
      return v.trim();
    }) : [], obj['リンク'] ? obj['リンク'].map(function (v) {
      return new domain_1.Link(v.name, v.path);
    }) : [], new domain_1.Note(obj['ノート'] || ''), obj['マイルストーン'] ? obj['マイルストーン'].split('\n').map(function (v) {
      return new domain_1.Task(new domain_1.TaskLimitDate(v.slice(0, v.indexOf(' '))), v.slice(v.indexOf(' ')).trim());
    }) : []);
  };

  MetaDataConverter.toText = function (metaData) {
    return ['# 説明: \n' + metaData.description, '', '# 担当: ' + metaData.members.join(', '), '# リンク: \n' + metaData.links.map(function (v) {
      return "- [" + v.name + "](" + v.path + ")";
    }), '# ノート: \n' + metaData.note.value, '# マイルストーン: \n' + metaData.tasks.map(function (v) {
      return v.limitDate.raw + " " + v.title;
    })].join('\n');
  };

  MetaDataConverter.textToObj = function (text) {
    text = text.trim();

    if (text[0] != '#') {
      throw new Error('不正なテキスト');
    }

    return text.split('\n').reduce(function (memo, v) {
      if (v.indexOf('# ') == 0) {
        memo.push([v]);
      } else {
        memo[memo.length - 1].push(v);
      }

      return memo;
    }, []).reduce(function (memo, lines) {
      var key = lines[0].split('#')[1].split(':')[0].trim();
      lines[0] = lines[0].indexOf(':') != -1 ? lines[0].slice(lines[0].indexOf(':') + 1) : '';
      var value = lines.join('\n').trim();

      if (value.indexOf('- [') == 0) {
        value = value.split('\n').map(function (v) {
          return {
            name: v.split('[')[1].split(']')[0],
            path: v.split('(')[1].split(')')[0]
          };
        }).reduce(function (memo, v) {
          memo.push(v);
          return memo;
        }, []);
      }

      memo[key] = value;
      return memo;
    }, {});
  };

  return MetaDataConverter;
}();

exports.MetaDataConverter = MetaDataConverter;
},{"../../domain/domain":"domain/domain.ts"}],"infra/view/AnyId.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnyId = void 0;

var Action_1 = require("../../domain/Action");

var Objective_1 = require("../../domain/Objective");

var AnyId =
/** @class */
function () {
  function AnyId(id) {
    this.id = id;
  }

  AnyId.prototype.forEach = function (objectiveCallback, actionCallback) {
    if (this.id[0] == 'O') {
      return objectiveCallback(new Objective_1.Objective.Id(this.id));
    } else if (this.id[0] == 'A') {
      return actionCallback(new Action_1.Action.Id(this.id));
    } else {
      throw new Error('未知のID: ' + this.id);
    }
  };

  AnyId.prototype.getValue = function () {
    return this.id.trim();
  };

  AnyId.prototype.isEmpty = function () {
    return this.getValue().length == 0;
  };

  return AnyId;
}();

exports.AnyId = AnyId;
},{"../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts"}],"infra/view/PjfuVue.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PjfuVue = exports.ParentsForm = exports.MermaidTreeView = void 0;

var domain_1 = require("../../domain/domain");

var Action_1 = require("../../domain/Action");

var Objective_1 = require("../../domain/Objective");

var MermaidConvertor_1 = require("./MermaidConvertor");

var MetaDataConverter_1 = require("./MetaDataConverter");

var AnyId_1 = require("./AnyId");

var MermaidTreeView =
/** @class */
function () {
  function MermaidTreeView(objectiveRepository, actionRepository, mermaid) {
    this.objectiveRepository = objectiveRepository;
    this.actionRepository = actionRepository;
    this.mermaid = mermaid;
  }

  MermaidTreeView.prototype.update = function (id) {
    var _this = this;

    var idInHtml = document.querySelector('#rootIdSpan').value;
    var anyId = new AnyId_1.AnyId(idInHtml);
    var selectedId = id || [document.querySelector('#selectedIdSpan')].filter(function (v) {
      return v;
    }).map(function (v) {
      return new AnyId_1.AnyId(v.innerHTML);
    })[0];
    var objectiveMap = {};
    var actionMap = {};
    var objectives = [];
    var parents = null;
    anyId.forEach(function (id) {
      parents = [id];
    }, function (id) {
      var current = _this.actionRepository.findById(new Action_1.Action.Id(idInHtml));

      parents = current.parents;
      parents.forEach(function (p) {
        _this.actionRepository.findChildren(p).forEach(function (v) {
          actionMap[v.id.value] = v;
        });
      });
    });
    parents.forEach(function (p) {
      var underObjectives = _this.objectiveRepository.findUnder(p);

      underObjectives.forEach(function (v) {
        objectiveMap[v.id.value] = v;

        _this.actionRepository.findChildren(v.id).forEach(function (v) {
          actionMap[v.id.value] = v;
        });
      });

      _this.objectiveRepository.findParentsTree(p).forEach(function (v) {
        return objectiveMap[v.id.value] = v;
      });
    });
    var element = document.querySelector("#profu");
    var text = MermaidConvertor_1.MermaidConvertor.toMermaidScript(Object.values(objectiveMap), Object.values(actionMap), anyId, selectedId);
    this.mermaid.mermaidAPI.render('graphDiv', text, function (svg) {
      return element.innerHTML = svg;
    });
  };

  return MermaidTreeView;
}();

exports.MermaidTreeView = MermaidTreeView;

var ParentsForm =
/** @class */
function () {
  function ParentsForm() {
    this.value = '';
  }

  ParentsForm.prototype.set = function (parents) {
    this.value = parents.map(function (v) {
      return v.value;
    }).join(', ');
  };

  ParentsForm.prototype.get = function () {
    return this.value.split(',').map(function (v) {
      return new Objective_1.Objective.Id(v.trim());
    });
  };

  return ParentsForm;
}();

exports.ParentsForm = ParentsForm;

var PjfuVue =
/** @class */
function () {
  function PjfuVue(objectiveRepository, actionRepository, mermaidTreeView, Vue) {
    this.objectiveRepository = objectiveRepository;
    this.actionRepository = actionRepository;
    this.mermaidTreeView = mermaidTreeView;
    this.data = {
      message: 'hoge',
      treeTargetId: '',
      editTargetId: '',
      editForm: {
        id: '',
        title: '',
        parents: new ParentsForm(),
        detail: new MetaDataConverter_1.MetaDataForm(),
        links: [{
          name: '',
          path: ''
        }]
      }
    };
    this.init(Vue);
  }

  PjfuVue.prototype.init = function (Vue) {
    var _this = this;

    try {
      this.app = new Vue({
        el: '#app',
        data: this.data,
        methods: {
          onClickApplyRootIdButton: function onClickApplyRootIdButton() {
            return _this.applyTreeId();
          },
          onClickUpdateButton: function onClickUpdateButton() {
            return _this.update();
          },
          onClickSubButton: function onClickSubButton() {
            return _this.createSub();
          },
          onClickInsertObjectiveButton: function onClickInsertObjectiveButton() {
            return _this.insertObjective();
          },
          onClickInsertActionButton: function onClickInsertActionButton() {
            return _this.insertAction();
          },
          onClickRemoveButton: function onClickRemoveButton() {
            return _this.remove();
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  PjfuVue.prototype.applyTreeId = function () {
    console.log('click', this.data.treeTargetId);
  };

  PjfuVue.prototype.applyTargetId = function (id) {
    var _this = this;

    console.log(id);
    id.forEach(function (id) {
      var objective = _this.objectiveRepository.findById(id);

      _this.data.editTargetId = objective.id.value;
      _this.data.editForm.id = objective.id.value;
      _this.data.editForm.title = objective.title;

      _this.data.editForm.parents.set(objective.isNotRoot ? [objective.parent] : []);

      _this.data.editForm.detail.set(objective.metaData);

      _this.data.editForm.links = objective.metaData.links.map(function (v) {
        return {
          name: v.name,
          path: v.path
        };
      });
    }, function (id) {
      var action = _this.actionRepository.findById(id);

      _this.data.editTargetId = action.id.value;
      _this.data.editForm.id = action.id.value;
      _this.data.editForm.title = action.title;

      _this.data.editForm.parents.set(action.parents);

      _this.data.editForm.detail.set(action.metaData);

      _this.data.editForm.links = action.metaData.links.map(function (v) {
        return {
          name: v.name,
          path: v.path
        };
      });
    });
    this.mermaidTreeView.update(id);
  };

  PjfuVue.prototype.update = function () {
    var _this = this;

    console.log('update');

    var callbackOnSaved = function callbackOnSaved(e) {
      if (e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }

      _this.mermaidTreeView.update();
    };

    var anyId = new AnyId_1.AnyId(this.data.editForm.id);

    if (anyId.isEmpty()) {
      throw new Error('IDが空');
    }

    anyId.forEach(function (id) {
      var newEntity = new Objective_1.Objective.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get()[0], _this.data.editForm.detail.get());

      _this.objectiveRepository.update(newEntity, callbackOnSaved);
    }, function (id) {
      var newEntity = new Action_1.Action.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get(), _this.data.editForm.detail.get());

      _this.actionRepository.update(newEntity, callbackOnSaved);
    });
  };

  PjfuVue.prototype.createSub = function () {
    this.data.editForm.parents.set([new Objective_1.Objective.Id(this.data.editForm.id)]);
    this.data.editForm.id = '';
    this.data.editForm.title = '';
    this.data.editForm.detail.set(domain_1.MetaData.empty());
  };

  PjfuVue.prototype.insertObjective = function () {
    var _this = this;

    this.objectiveRepository.createId(function (err, id) {
      var newEntity = new Objective_1.Objective.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get()[0], _this.data.editForm.detail.get());

      _this.objectiveRepository.insert(newEntity, function (e) {
        console.log('callback');

        if (e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }

        _this.mermaidTreeView.update();
      });
    });
  };

  PjfuVue.prototype.insertAction = function () {
    var _this = this;

    this.actionRepository.createId(function (err, id) {
      var newEntity = new Action_1.Action.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get(), _this.data.editForm.detail.get());

      _this.actionRepository.insert(newEntity, function (e) {
        console.log('callback');

        if (e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }

        _this.mermaidTreeView.update();
      });
    });
  };

  PjfuVue.prototype.remove = function () {
    var _this = this;

    var anyId = new AnyId_1.AnyId(this.data.editForm.id);
    anyId.forEach(function (id) {
      if (_this.actionRepository.hasChildren(id)) {
        alert('子要素を消してください');
        throw new Error('子要素を消してください');
      }

      _this.objectiveRepository.remove(id, function (e) {
        if (e) {
          alert(e.message);
          throw e;
        }

        _this.mermaidTreeView.update(); // onTreeUpdate();

      });
    }, function (id) {
      _this.actionRepository.remove(id, function (e) {
        if (e) {
          alert(e.message);
          throw e;
        }

        _this.mermaidTreeView.update();
      });
    });
  };

  return PjfuVue;
}();

exports.PjfuVue = PjfuVue;
},{"../../domain/domain":"domain/domain.ts","../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts","./MermaidConvertor":"infra/view/MermaidConvertor.ts","./MetaDataConverter":"infra/view/MetaDataConverter.ts","./AnyId":"infra/view/AnyId.ts"}],"infra/InMemoryDataStore.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InMemoryDataStore = void 0;

var InMemoryDataStore =
/** @class */
function () {
  function InMemoryDataStore(entities) {
    var _this = this;

    this.entityMap = {};
    entities.forEach(function (v) {
      return _this.entityMap[v.id.value] = v;
    });
  }

  InMemoryDataStore.prototype.findAll = function () {
    var _this = this;

    return Object.keys(this.entityMap).map(function (key) {
      return _this.entityMap[key];
    });
  };

  InMemoryDataStore.prototype.findById = function (id) {
    return this.entityMap[id.value];
  };

  InMemoryDataStore.prototype.isExist = function (id) {
    return this.entityMap[id.value] ? true : false;
  };

  InMemoryDataStore.prototype.update = function (entity) {
    if (!this.isExist(entity.id)) {
      throw new Error("entity not found: " + entity.id.value);
    }

    this.entityMap[entity.id.value] = entity;
    console.log('update inMemory');
  };

  InMemoryDataStore.prototype.insert = function (entity) {
    if (this.isExist(entity.id)) {
      throw new Error("entity already exists: " + entity.id.value);
    }

    this.entityMap[entity.id.value] = entity;
    console.log('insert inMemory');
  };

  InMemoryDataStore.prototype.remove = function (id) {
    delete this.entityMap[id.value];
  };

  return InMemoryDataStore;
}();

exports.InMemoryDataStore = InMemoryDataStore;
},{}],"infra/ActionRepositoryImpl.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionRepositoryImpl = void 0;

var Action_1 = require("../domain/Action");

var InMemoryDataStore_1 = require("./InMemoryDataStore");

var ActionRepositoryImpl =
/** @class */
function () {
  function ActionRepositoryImpl(dataStore, actions) {
    this.dataStore = dataStore;
    this.parentMap = {}; //key:親, value: 子たち

    this.inMemoryActionDataStore = new InMemoryDataStore_1.InMemoryDataStore(actions);
    this.onUpdate();
  }

  ActionRepositoryImpl.prototype.createId = function (callback) {
    var num = Math.floor(Date.now() / 1000);
    setTimeout(function () {
      return callback(null, Action_1.Action.Id.create(num));
    }, 100);
  };

  ActionRepositoryImpl.prototype.findAll = function () {
    return this.inMemoryActionDataStore.findAll();
  };

  ActionRepositoryImpl.prototype.findById = function (id) {
    return this.inMemoryActionDataStore.findById(id);
  };
  /**
   * 指定したIDに子要素はあるか？
   * @param parentId
   */


  ActionRepositoryImpl.prototype.hasChildren = function (parentId) {
    return this.parentMap[parentId.value] ? true : false;
  };

  ActionRepositoryImpl.prototype.findChildren = function (parentId) {
    var _this = this;

    return (this.parentMap[parentId.value] || []).map(function (id) {
      return _this.findById(id);
    });
  };

  ActionRepositoryImpl.prototype.onUpdate = function () {
    var _this = this;

    this.parentMap = {};
    this.findAll().forEach(function (v) {
      v.parents.forEach(function (parent) {
        if (!_this.parentMap[parent.value]) {
          _this.parentMap[parent.value] = [];
        }

        _this.parentMap[parent.value].push(v.id);
      });
    });
  };

  ActionRepositoryImpl.prototype.update = function (entity, callback) {
    var _this = this;

    if (!this.inMemoryActionDataStore.isExist(entity.id)) {
      throw new Error("entity not found: " + entity.id.value);
    }

    this.dataStore.updateAction(entity, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryActionDataStore.update(entity);

      callback(null);
    });
  };

  ActionRepositoryImpl.prototype.insert = function (entity, callback) {
    var _this = this;

    if (this.inMemoryActionDataStore.isExist(entity.id)) {
      throw new Error("entity already exists: " + entity.id.value);
    }

    this.dataStore.insertAction(entity, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryActionDataStore.insert(entity);

      _this.onUpdate();

      callback(null);
    });
  };

  ActionRepositoryImpl.prototype.remove = function (id, callback) {
    var _this = this;

    if (!this.inMemoryActionDataStore.isExist(id)) {
      throw new Error("entity not found: " + id.value);
    }

    this.dataStore.removeAction(id, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryActionDataStore.remove(id);

      _this.onUpdate();

      callback(null);
    });
  };

  return ActionRepositoryImpl;
}();

exports.ActionRepositoryImpl = ActionRepositoryImpl;
},{"../domain/Action":"domain/Action.ts","./InMemoryDataStore":"infra/InMemoryDataStore.ts"}],"infra/ObjectiveRepositoryImpl.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectiveRepositoryImpl = void 0;

var Objective_1 = require("../domain/Objective");

var InMemoryDataStore_1 = require("./InMemoryDataStore");

var ObjectiveRepositoryImpl =
/** @class */
function () {
  function ObjectiveRepositoryImpl(dataStore, objectives) {
    this.dataStore = dataStore;
    this.parentMap = {}; //key:親, value: 子たち

    this.inMemoryObjectiveDataStore = new InMemoryDataStore_1.InMemoryDataStore(objectives);
    this.onUpdate();
  }

  ObjectiveRepositoryImpl.prototype.createId = function (callback) {
    var num = Math.floor(Date.now() / 1000);
    setTimeout(function () {
      return callback(null, Objective_1.Objective.Id.create(num));
    }, 100);
  };

  ObjectiveRepositoryImpl.prototype.findAll = function () {
    return this.inMemoryObjectiveDataStore.findAll();
  };

  ObjectiveRepositoryImpl.prototype.findById = function (id) {
    return this.inMemoryObjectiveDataStore.findById(id);
  };

  ObjectiveRepositoryImpl.prototype.findParentsTree = function (rootId) {
    var _this = this;

    var parentTrunkList = [];

    var findParentTrunk = function findParentTrunk(id) {
      parentTrunkList.push(id);

      var entity = _this.findById(id);

      if (entity.isNotRoot) {
        findParentTrunk(entity.parent);
      }
    };

    var current = this.findById(rootId);

    if (current.isRoot) {
      return [];
    }

    findParentTrunk(current.parent);
    var result = [];
    parentTrunkList.forEach(function (p) {
      _this.parentMap[p.value].forEach(function (v) {
        return result.push(_this.findById(v));
      });
    });
    result.push(this.findById(parentTrunkList[parentTrunkList.length - 1]));
    return result;
  };

  ObjectiveRepositoryImpl.prototype.findUnder = function (rootId) {
    var _this = this;

    var getChildren = function getChildren(rootId) {
      var list = [_this.findById(rootId)];

      if (!_this.parentMap[rootId.value]) {
        return list;
      }

      _this.parentMap[rootId.value].forEach(function (ch) {
        return getChildren(ch).forEach(function (v) {
          return list.push(v);
        });
      });

      return list;
    };

    return getChildren(rootId);
  };

  ObjectiveRepositoryImpl.prototype.onUpdate = function () {
    var _this = this;

    this.parentMap = {};
    this.findAll().filter(function (v) {
      return v.parent;
    }).forEach(function (v) {
      if (!_this.parentMap[v.parent.value]) {
        _this.parentMap[v.parent.value] = [];
      }

      _this.parentMap[v.parent.value].push(v.id);
    });
  };

  ObjectiveRepositoryImpl.prototype.update = function (entity, callback) {
    var _this = this;

    if (!this.inMemoryObjectiveDataStore.isExist(entity.id)) {
      callback(new Error('entity not found: ' + entity.id.value));
      return;
    }

    this.dataStore.updateObjective(entity, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryObjectiveDataStore.update(entity);

      _this.onUpdate();

      callback(null);
    });
  };

  ObjectiveRepositoryImpl.prototype.insert = function (entity, callback) {
    var _this = this;

    if (this.inMemoryObjectiveDataStore.isExist(entity.id)) {
      callback(new Error('entity already exists: ' + entity.id.value));
      return;
    }

    this.dataStore.insertObjective(entity, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryObjectiveDataStore.insert(entity);

      _this.onUpdate();

      callback(null);
    });
  };

  ObjectiveRepositoryImpl.prototype.remove = function (id, callback) {
    var _this = this;

    if (this.parentMap[id.value]) {
      callback(new Error('children already exists'));
    }

    if (!this.inMemoryObjectiveDataStore.isExist(id)) {
      callback(new Error('entity not found: ' + id.value));
      return;
    }

    this.dataStore.removeObjective(id, function (e) {
      if (e) {
        callback(e);
        return;
      }

      _this.inMemoryObjectiveDataStore.remove(id);

      _this.onUpdate();

      callback(null);
    });
  };

  return ObjectiveRepositoryImpl;
}();

exports.ObjectiveRepositoryImpl = ObjectiveRepositoryImpl;
},{"../domain/Objective":"domain/Objective.ts","./InMemoryDataStore":"infra/InMemoryDataStore.ts"}],"htmlmain.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.htmlMain = void 0;

var DataStoreGithub_1 = require("./infra/datastore/DataStoreGithub");

var DataStoreLocalStorage_1 = require("./infra/datastore/DataStoreLocalStorage");

var infra_1 = require("./infra/infra");

var PjfuVue_1 = require("./infra/view/PjfuVue");

var ActionRepositoryImpl_1 = require("./infra/ActionRepositoryImpl");

var ObjectiveRepositoryImpl_1 = require("./infra/ObjectiveRepositoryImpl");

var AnyId_1 = require("./infra/view/AnyId");

function htmlMain(dataStore) {
  dataStore.findAll(function (err, objectives, actions) {
    var objectiveRepository = new ObjectiveRepositoryImpl_1.ObjectiveRepositoryImpl(dataStore, objectives);
    var actionRepository = new ActionRepositoryImpl_1.ActionRepositoryImpl(dataStore, actions);
    var mermaidTreeView = new PjfuVue_1.MermaidTreeView(objectiveRepository, actionRepository, window['mermaid']);
    var pjfuVue = new PjfuVue_1.PjfuVue(objectiveRepository, actionRepository, mermaidTreeView, window['Vue']); // 編集フォームはURLのハッシュに従う

    var updateFormByHash = function updateFormByHash() {
      return pjfuVue.applyTargetId(new AnyId_1.AnyId(window.location.hash.slice(1)));
    };

    window.addEventListener('hashchange', updateFormByHash);

    if (location.hash) {
      updateFormByHash();
    }

    mermaidTreeView.update();
    document.querySelector('#applyRootIdButton').addEventListener('click', function () {
      return mermaidTreeView.update();
    });
    document.querySelector('#applyTreeCenteredFromSelected').addEventListener('click', function () {
      document.querySelector('#rootIdSpan').value = document.querySelector('#selectedIdSpan').innerHTML;
      mermaidTreeView.update();
    });
  });
}

exports.htmlMain = htmlMain; // グローバルから使えるようにする

window['DataStoreLocalStorage'] = DataStoreLocalStorage_1.DataStoreLocalStorage;
window['DataStoreGithubIssue'] = DataStoreGithub_1.DataStoreGithubIssue;
window['IssueRepositoryImpl'] = infra_1.IssueRepositoryImpl;
window['IssueNumber'] = infra_1.IssueNumber;
window['htmlMain'] = htmlMain;
},{"./infra/datastore/DataStoreGithub":"infra/datastore/DataStoreGithub.ts","./infra/datastore/DataStoreLocalStorage":"infra/datastore/DataStoreLocalStorage.ts","./infra/infra":"infra/infra.ts","./infra/view/PjfuVue":"infra/view/PjfuVue.ts","./infra/ActionRepositoryImpl":"infra/ActionRepositoryImpl.ts","./infra/ObjectiveRepositoryImpl":"infra/ObjectiveRepositoryImpl.ts","./infra/view/AnyId":"infra/view/AnyId.ts"}],"../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61603" + '/');

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