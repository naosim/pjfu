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
exports.Link = exports.MetaData = exports.Task = exports.TaskStatus = exports.TaskLimitDate = exports.Note = void 0;

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
  function TaskLimitDate(raw, dateString) {
    this.raw = raw;
    this.dateString = dateString;
    this.date = new Date(dateString);
    this.time = this.date.getTime();
  }
  /**
   * 過去2週間から未来2週間以内(だいたい)
   * @param now
   */


  TaskLimitDate.prototype.isIn2Weeks = function (now) {
    var d = this.time;
    var day = 24 * 60 * 60 * 1000;
    return now.getTime() - 15 * day < d && d < now.getTime() + 15 * day;
  };

  TaskLimitDate.prototype.toObject = function () {
    return {
      raw: this.raw,
      dateString: this.date.toLocaleDateString()
    };
  };

  TaskLimitDate.create = function (raw, now) {
    return new TaskLimitDate(raw, TaskLimitDate.textToDate(raw, now).toLocaleDateString());
  };

  TaskLimitDate.textToDate = function (raw, now) {
    if (raw.length == 0) {
      return new Date('2999/12/31');
    }

    raw = raw.split('(')[0];
    var segs = raw.split('/');

    if (segs.length == 3) {
      // yyyy/mm/dd
      return new Date(raw);
    }

    if (segs.length == 2) {
      // mm/dd
      var year = now.getFullYear();
      return TaskLimitDate.near(now, [new Date(year - 1 + "/" + raw), new Date(year + "/" + raw), new Date(year + 1 + "/" + raw)]);
    }
  };

  TaskLimitDate.near = function (now, dates) {
    var diffs = dates.map(function (v) {
      return Math.abs(v.getTime() - now.getTime());
    });

    if (diffs[0] < diffs[1] && diffs[0] < diffs[2]) {
      return dates[0];
    }

    if (diffs[1] < diffs[0] && diffs[1] < diffs[2]) {
      return dates[1];
    }

    if (diffs[2] < diffs[0] && diffs[2] < diffs[1]) {
      return dates[2];
    }

    throw new Error('予期せぬエラー');
  };

  return TaskLimitDate;
}();

exports.TaskLimitDate = TaskLimitDate;

var TaskStatus =
/** @class */
function () {
  function TaskStatus(raw) {
    this.raw = raw;
  }

  TaskStatus.prototype.toObject = function () {
    return this.raw;
  };

  TaskStatus.prototype.isDone = function () {
    var _this = this;

    return ['完了'].filter(function (v) {
      return _this.raw == v;
    }).length > 0;
  };

  TaskStatus.prototype.isNotEmpty = function () {
    return this.raw.trim().length > 0;
  };

  return TaskStatus;
}();

exports.TaskStatus = TaskStatus;

var Task =
/** @class */
function () {
  function Task(limitDate, title, status) {
    this.limitDate = limitDate;
    this.title = title;
    this.status = status;
  }

  Task.prototype.toObject = function () {
    return {
      limitDate: this.limitDate.toObject(),
      title: this.title,
      status: this.status.toObject()
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
},{}],"domain/Action.ts":[function(require,module,exports) {
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
},{"./domain":"domain/domain.ts"}],"infra/view/MetaDataConverter.ts":[function(require,module,exports) {
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

  MetaDataForm.prototype.get = function (now) {
    return MetaDataConverter.toMetaData(this.value, now);
  };

  return MetaDataForm;
}();

exports.MetaDataForm = MetaDataForm;

var MetaDataConverter =
/** @class */
function () {
  function MetaDataConverter() {}

  MetaDataConverter.toMetaData = function (text, now) {
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
      return MetaDataConverter.parseTaskLine(v, now);
    }) : []);
  };

  MetaDataConverter.parseTaskLine = function (line, now) {
    line = line.trim();
    var limitDate = domain_1.TaskLimitDate.create(line.slice(0, line.indexOf(' ')), now);
    var title;
    var status;

    if (line[line.length - 1] == ']') {
      // ステータスあり
      var i = line.lastIndexOf('[');
      title = line.slice(line.indexOf(' '), i).trim();
      status = new domain_1.TaskStatus(line.slice(i + 1, line.length - 1).trim());
    } else {
      // ステータスなし
      title = line.slice(line.indexOf(' ')).trim();
      status = new domain_1.TaskStatus('');
    }

    console.log(status);
    return new domain_1.Task(limitDate, title, status);
  };

  MetaDataConverter.toText = function (metaData) {
    return ['# 説明: \n' + metaData.description, '', '# 担当: ' + metaData.members.join(', '), '# リンク: \n' + metaData.links.map(function (v) {
      return "- [" + v.name + "](" + v.path + ")";
    }).join('\n'), '# ノート: \n' + metaData.note.value, '# マイルストーン: \n' + metaData.tasks.map(function (v) {
      return v.limitDate.raw + " " + v.title + " " + (v.status.isNotEmpty() ? '[' + v.status.raw + ']' : '');
    }).join('\n')].join('\n');
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

  AnyId.create = function (id) {
    return new AnyId(id.value);
  };

  return AnyId;
}();

exports.AnyId = AnyId;
},{"../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts"}],"infra/view/ViewModeModel.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModeType = void 0;
var ModeType;

(function (ModeType) {
  ModeType["targetTree"] = "targetTree";
  ModeType["member"] = "member";
})(ModeType = exports.ModeType || (exports.ModeType = {}));
},{}],"infra/view/PjfuVue.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskView = exports.PjfuVue = exports.ParentsForm = void 0;

var domain_1 = require("../../domain/domain");

var Action_1 = require("../../domain/Action");

var Objective_1 = require("../../domain/Objective");

var MetaDataConverter_1 = require("./MetaDataConverter");

var AnyId_1 = require("./AnyId");

var ViewModeModel_1 = require("./ViewModeModel");

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
      viewMode: {
        modeType: ViewModeModel_1.ModeType.targetTree,
        treeTargetId: 'O0',
        selectedMembers: [],
        members: []
      },
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
      },
      tasks: [TaskView.empty(new Date())],
      windowWidth: window.innerWidth
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
          onClickUpdateButton: function onClickUpdateButton() {
            return _this.update();
          },
          onClickTreeUpdateButton: function onClickTreeUpdateButton() {
            return _this.onUpdate();
          },
          onClickApplyTreeCenteredFromSelected: function onClickApplyTreeCenteredFromSelected() {
            return _this.applyTreeCenteredFromSelected();
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
          },
          onClickTaskLinkButton: function onClickTaskLinkButton(id) {
            return _this.applyTargetId(id);
          }
        }
      });
      this.onUpdate();
      this.data.viewMode.selectedMembers = this.data.viewMode.members; // すべてをチェックする

      window.addEventListener('resize', function () {
        return _this.handleResize();
      }); // this.updateTaskList();
      // this.mermaidTreeView.update(this.data.viewMode);
    } catch (e) {
      console.error(e);
    }
  };

  PjfuVue.prototype.handleResize = function () {
    this.data.windowWidth = window.innerWidth; // console.log(this.data.windowWidth);
  };

  PjfuVue.prototype.applyTreeCenteredFromSelected = function () {
    this.data.viewMode.modeType = ViewModeModel_1.ModeType.targetTree;
    this.data.viewMode.treeTargetId = this.data.editTargetId;
    this.mermaidTreeView.update(this.data.viewMode);
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
    this.mermaidTreeView.update(this.data.viewMode, id);
  };
  /**
   * 目標または施策を更新する
   */


  PjfuVue.prototype.update = function () {
    var _this = this;

    console.log('update');

    var callbackOnSaved = function callbackOnSaved(e) {
      if (e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }

      _this.onUpdate();
    };

    var anyId = new AnyId_1.AnyId(this.data.editForm.id);

    if (anyId.isEmpty()) {
      throw new Error('IDが空');
    }

    anyId.forEach(function (id) {
      var newEntity = new Objective_1.Objective.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get()[0], _this.data.editForm.detail.get(new Date()));

      _this.objectiveRepository.update(newEntity, callbackOnSaved);
    }, function (id) {
      var newEntity = new Action_1.Action.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get(), _this.data.editForm.detail.get(new Date()));

      _this.actionRepository.update(newEntity, callbackOnSaved);
    });
  };

  PjfuVue.prototype.createSub = function () {
    this.data.editForm.parents.set([new Objective_1.Objective.Id(this.data.editForm.id)]);
    this.data.editForm.id = '';
    this.data.editForm.title = '';
    this.data.editForm.detail.set(domain_1.MetaData.empty());
  };
  /**
   * 目標を挿入（新規作成）する
   */


  PjfuVue.prototype.insertObjective = function () {
    var _this = this;

    this.objectiveRepository.createId(function (err, id) {
      var newEntity = new Objective_1.Objective.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get()[0], _this.data.editForm.detail.get(new Date()));

      _this.objectiveRepository.insert(newEntity, function (e) {
        console.log('callback');

        if (e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }

        _this.onUpdate();
      });
    });
  };
  /**
   * 施策を挿入（新規作成）する
   */


  PjfuVue.prototype.insertAction = function () {
    var _this = this;

    this.actionRepository.createId(function (err, id) {
      var newEntity = new Action_1.Action.Entity(id, _this.data.editForm.title, _this.data.editForm.parents.get(), _this.data.editForm.detail.get(new Date()));

      _this.actionRepository.insert(newEntity, function (e) {
        console.log('callback');

        if (e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }

        _this.onUpdate();
      });
    });
  };
  /**
   * 目標または施策を削除する
   */


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

        _this.onUpdate(); // onTreeUpdate();

      });
    }, function (id) {
      _this.actionRepository.remove(id, function (e) {
        if (e) {
          alert(e.message);
          throw e;
        }

        _this.onUpdate();
      });
    });
  };

  PjfuVue.prototype.onUpdate = function () {
    // TODO: ここで表示モードの選択リストをいじる
    this.updateViewModeMembers();
    this.mermaidTreeView.update(this.data.viewMode);
    this.updateTaskList();
  };

  PjfuVue.prototype.updateViewModeMembers = function () {
    var memberMap = {};
    this.objectiveRepository.findAll().forEach(function (v) {
      return v.metaData.members.forEach(function (m) {
        return memberMap[m] = true;
      });
    });
    this.actionRepository.findAll().forEach(function (v) {
      return v.metaData.members.forEach(function (m) {
        return memberMap[m] = true;
      });
    });
    this.data.viewMode.members = Object.keys(memberMap);
  };

  PjfuVue.prototype.updateTaskList = function () {
    var tasks = [];
    var now = new Date();
    this.objectiveRepository.findAll().forEach(function (v) {
      return v.metaData.tasks.forEach(function (t) {
        return tasks.push(new TaskView(AnyId_1.AnyId.create(v.id), v.title, t, now));
      });
    });
    this.actionRepository.findAll().forEach(function (v) {
      return v.metaData.tasks.forEach(function (t) {
        return tasks.push(new TaskView(AnyId_1.AnyId.create(v.id), v.title, t, now));
      });
    });
    this.data.tasks = tasks.sort(function (a, b) {
      return a.limitTimestamp - b.limitTimestamp;
    });
    console.log(tasks);
  };

  return PjfuVue;
}();

exports.PjfuVue = PjfuVue;

var TaskView =
/** @class */
function () {
  function TaskView(id, title, task, now) {
    this.id = id;
    this.text = task.limitDate.raw + " " + title + " " + task.title + (task.status.isNotEmpty() ? " [" + task.status.raw + "]" : '');
    this.limitTimestamp = task.limitDate.time;
    this.isDone = task.status.isDone();
    this.isIn2Weeks = task.limitDate.isIn2Weeks(now);
  }

  TaskView.empty = function (now) {
    return new TaskView(new AnyId_1.AnyId(''), '', new domain_1.Task(new domain_1.TaskLimitDate('', ''), '', new domain_1.TaskStatus('')), now);
  };

  return TaskView;
}();

exports.TaskView = TaskView;
},{"../../domain/domain":"domain/domain.ts","../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts","./MetaDataConverter":"infra/view/MetaDataConverter.ts","./AnyId":"infra/view/AnyId.ts","./ViewModeModel":"infra/view/ViewModeModel.ts"}],"infra/view/MermaidConvertor.ts":[function(require,module,exports) {
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
      return v.id.value + "[\"" + v.title + "<br>" + v.metaData.members.join(', ') + "\"]" + (isSelected(v.id.value) ? ':::objective_select' : '');
    }).join('\n');
    var linkText = entities.map(function (v) {
      return "click " + v.id.value + " mermaidCallback";
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
      return "click " + v.id.value + " mermaidCallback";
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
    return ("\n%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '11px', 'lineColor': '#888'}}}%%\ngraph LR\nclassDef objective_select stroke-width:4px;\nclassDef action fill:#ECFFEC, stroke: #93DB70;\nclassDef action_select fill:#ECFFEC, stroke: #93DB70, stroke-width:4px;\nclassDef note fill:#FFFFEC, stroke: #DBDB93;\n" + rectText + "\n" + linkText + "\n" + arrowText + "\n" + roundText + "\n" + actionLinkText + "\n" + actionArrowText + "\n" + noteText + "\n" + noteArrowText + "\n  ").trim();
  };

  return MermaidConvertor;
}();

exports.MermaidConvertor = MermaidConvertor;
},{}],"infra/view/MermaidTreeView.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MermaidTreeView = void 0;

var MermaidConvertor_1 = require("./MermaidConvertor");

var AnyId_1 = require("./AnyId");

var ViewModeModel_1 = require("./ViewModeModel");

function merge(a, b) {
  var c = {
    objectiveMap: {},
    actionMap: {}
  };
  Object.keys(a.objectiveMap).forEach(function (k) {
    return c.objectiveMap[k] = a.objectiveMap[k];
  });
  Object.keys(b.objectiveMap).forEach(function (k) {
    return c.objectiveMap[k] = b.objectiveMap[k];
  });
  Object.keys(a.actionMap).forEach(function (k) {
    return c.actionMap[k] = a.actionMap[k];
  });
  Object.keys(b.actionMap).forEach(function (k) {
    return c.actionMap[k] = b.actionMap[k];
  });
  return c;
}

var MermaidTreeView =
/** @class */
function () {
  function MermaidTreeView(objectiveRepository, actionRepository, mermaid) {
    this.objectiveRepository = objectiveRepository;
    this.actionRepository = actionRepository;
    this.mermaid = mermaid;
  }

  MermaidTreeView.prototype.findRelated = function (anyId) {
    var _this = this;

    var objectiveMap = {};
    var actionMap = {};
    var parents = null;
    anyId.forEach(function (id) {
      parents = [id];
    }, function (id) {
      var current = _this.actionRepository.findById(id);

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
    return {
      objectiveMap: objectiveMap,
      actionMap: actionMap
    };
  };

  MermaidTreeView.prototype.update = function (viewMode, selectedId) {
    var _this = this;

    var anyId = new AnyId_1.AnyId(viewMode.treeTargetId);
    selectedId = selectedId || [viewMode.treeTargetId].filter(function (v) {
      return v;
    }).map(function (v) {
      return new AnyId_1.AnyId(v);
    })[0];
    var related;

    if (viewMode.modeType == ViewModeModel_1.ModeType.targetTree) {
      related = this.findRelated(anyId);
    } else if (viewMode.modeType == ViewModeModel_1.ModeType.member) {
      related = {
        objectiveMap: {},
        actionMap: {}
      };
      this.objectiveRepository.findByMembers(viewMode.selectedMembers).forEach(function (e) {
        related = merge(related, _this.findRelated(new AnyId_1.AnyId(e.id.value)));
      });
      this.actionRepository.findByMembers(viewMode.selectedMembers).forEach(function (e) {
        related = merge(related, _this.findRelated(new AnyId_1.AnyId(e.id.value)));
      });
      console.log(related); // related = this.findRelated(new AnyId('O0'));
    }

    var element = document.querySelector("#profu"); // 全ての中でquerySelectorを使っていいのはここだけ！

    var text = MermaidConvertor_1.MermaidConvertor.toMermaidScript(Object.values(related.objectiveMap), Object.values(related.actionMap), anyId, selectedId); // console.log(text);

    this.mermaid.mermaidAPI.render('graphDiv', text, function (svg, bind) {
      element.innerHTML = svg;
      bind(element);
    });
  };

  return MermaidTreeView;
}();

exports.MermaidTreeView = MermaidTreeView;
},{"./MermaidConvertor":"infra/view/MermaidConvertor.ts","./AnyId":"infra/view/AnyId.ts","./ViewModeModel":"infra/view/ViewModeModel.ts"}],"infra/InMemoryDataStore.ts":[function(require,module,exports) {
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

  ActionRepositoryImpl.prototype.findByMembers = function (members) {
    console.log(members);
    var map = {};
    var list = this.findAll().filter(function (v) {
      return v.metaData.members.length > 0;
    }); // メンバー有りだけにする

    list.forEach(function (e) {
      return e.metaData.members.forEach(function (m) {
        return members.forEach(function (v) {
          if (m == v) {
            map[e.id.value] = e;
          }
        });
      });
    });
    return Object.keys(map).map(function (k) {
      return map[k];
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

  ObjectiveRepositoryImpl.prototype.findByMembers = function (members) {
    console.log(members);
    var map = {};
    var list = this.findAll().filter(function (v) {
      return v.metaData.members.length > 0;
    }); // メンバー有りだけにする

    list.forEach(function (e) {
      return e.metaData.members.forEach(function (m) {
        return members.forEach(function (v) {
          if (m == v) {
            map[e.id.value] = e;
          }
        });
      });
    });
    return Object.keys(map).map(function (k) {
      return map[k];
    });
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
},{"../domain/Objective":"domain/Objective.ts","./InMemoryDataStore":"infra/InMemoryDataStore.ts"}],"infra/datastore/TextIO.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PjfuTextIO = void 0;

var PjfuTextIO =
/** @class */
function () {
  function PjfuTextIO(keyValueIo) {
    this.keyValueIo = keyValueIo;
  }

  PjfuTextIO.prototype.saveObjectives = function (raw, callback) {
    this.keyValueIo.save(PjfuTextIOType.objectives, raw, callback);
  };

  PjfuTextIO.prototype.saveActions = function (raw, callback) {
    this.keyValueIo.save(PjfuTextIOType.actions, raw, callback);
  };

  PjfuTextIO.prototype.loadObjectives = function (callback) {
    this.keyValueIo.load(PjfuTextIOType.objectives, callback);
  };

  PjfuTextIO.prototype.loadActions = function (callback) {
    this.keyValueIo.load(PjfuTextIOType.actions, callback);
  };

  return PjfuTextIO;
}();

exports.PjfuTextIO = PjfuTextIO;
var PjfuTextIOType;

(function (PjfuTextIOType) {
  PjfuTextIOType["objectives"] = "objectives";
  PjfuTextIOType["actions"] = "actions";
})(PjfuTextIOType || (PjfuTextIOType = {}));
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

  DataStoreUtils.dataToMetaData = function (mataDataObj, now) {
    return new domain_1.MetaData(mataDataObj.description, mataDataObj.members || [], mataDataObj.links ? mataDataObj.links.map(function (v) {
      return new domain_1.Link(v.name, v.path);
    }) : [], new domain_1.Note(mataDataObj.note || ''), mataDataObj.tasks ? mataDataObj.tasks.map(function (v) {
      return new domain_1.Task(v.limitDate.dateString ? new domain_1.TaskLimitDate(v.limitDate.raw, v.limitDate.dateString) : domain_1.TaskLimitDate.create(v.limitDate, now), v.title, new domain_1.TaskStatus(v.status || ''));
    }) : []);
  };

  DataStoreUtils.dataToObjectiveEntity = function (v, now) {
    // console.log(DataStoreUtils.dataToMetaData(v.metaData));
    return new Objective_1.Objective.Entity(new Objective_1.Objective.Id(v.id), v.title, v.parent ? new Objective_1.Objective.Id(v.parent) : null, DataStoreUtils.dataToMetaData(v.metaData, now));
  };

  DataStoreUtils.dataToActionEntity = function (v, now) {
    return new Action_1.Action.Entity(new Objective_1.Objective.Id(v.id), v.title, v.parents.map(function (v) {
      return new Action_1.Action.Id(v);
    }), DataStoreUtils.dataToMetaData(v.metaData, now));
  };

  return DataStoreUtils;
}();

exports.DataStoreUtils = DataStoreUtils;
},{"../../domain/domain":"domain/domain.ts","../../domain/Action":"domain/Action.ts","../../domain/Objective":"domain/Objective.ts"}],"infra/datastore/DataStoreServer.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataStoreServer = void 0;

var Objective_1 = require("../../domain/Objective");

var DataStoreUtils_1 = require("./DataStoreUtils");

var DataStoreServer =
/** @class */
function () {
  function DataStoreServer(textIO) {
    this.textIO = textIO;
    this.callCount = 0;
  }

  DataStoreServer.prototype.findAll = function (callback) {
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

  DataStoreServer.prototype.findAllObjective = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    this.textIO.loadObjectives(function (err, raw) {
      if (err) {
        callback(err, null);
        return;
      }

      if (!raw) {
        raw = JSON.stringify([Objective_1.Objective.Entity.root()].map(function (v) {
          return v.toObject();
        }));

        _this.textIO.saveObjectives(raw, function (err) {});
      }

      console.log(raw);
      var now = new Date();
      _this.list = JSON.parse(raw).map(function (v) {
        return DataStoreUtils_1.DataStoreUtils.dataToObjectiveEntity(v, now);
      });
      callback(null, _this.list);
    });
  };

  DataStoreServer.prototype.findAllAction = function (callback) {
    var _this = this;

    if (this.callCount > 0) {
      throw '2回目の呼出です';
    }

    this.textIO.loadActions(function (err, raw) {
      if (err) {
        callback(err, null);
        return;
      }

      if (!raw) {
        raw = '[]';

        _this.textIO.saveActions(raw, function (err) {});
      }

      console.log(raw);
      var now = new Date();
      _this.actions = JSON.parse(raw).map(function (v) {
        return DataStoreUtils_1.DataStoreUtils.dataToActionEntity(v, now);
      });
      callback(null, _this.actions);
    });
  };

  DataStoreServer.prototype.saveObjective = function (callback) {
    var raw = JSON.stringify(this.list.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    this.textIO.saveObjectives(raw, callback);
  };

  DataStoreServer.prototype.saveAction = function (callback) {
    var raw = JSON.stringify(this.actions.map(function (v) {
      return v.toObject();
    }));
    console.log(raw);
    this.textIO.saveActions(raw, callback);
  };

  DataStoreServer.prototype.updateObjective = function (entity, callback) {
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

  DataStoreServer.prototype.updateAction = function (entity, callback) {
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

  DataStoreServer.prototype.insertObjective = function (entity, callback) {
    this.list.push(entity);
    this.saveObjective(callback);
  };

  DataStoreServer.prototype.insertAction = function (entity, callback) {
    this.actions.push(entity);
    this.saveAction(callback);
  };

  DataStoreServer.prototype.removeObjective = function (id, callback) {
    this.list = this.list.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveObjective(callback);
  };

  DataStoreServer.prototype.removeAction = function (id, callback) {
    this.actions = this.actions.filter(function (v) {
      return !v.id.eq(id);
    });
    this.saveAction(callback);
  };

  return DataStoreServer;
}();

exports.DataStoreServer = DataStoreServer;
},{"../../domain/Objective":"domain/Objective.ts","./DataStoreUtils":"infra/datastore/DataStoreUtils.ts"}],"infra/datastore/keyvalue/LocalStrageKeyValueIO.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStrageKeyValueIO = void 0;

var LocalStrageKeyValueIO =
/** @class */
function () {
  function LocalStrageKeyValueIO(keyMap) {
    this.keyMap = keyMap;
  }

  LocalStrageKeyValueIO.prototype.save = function (key, value, callback) {
    localStorage.setItem(this.keyMap ? this.keyMap[key] : key, value);
    setTimeout(function () {
      return callback(null);
    }, 100);
  };

  LocalStrageKeyValueIO.prototype.load = function (key, callback) {
    var value = localStorage.getItem(this.keyMap ? this.keyMap[key] : key);
    setTimeout(function () {
      return callback(null, value);
    }, 100);
  };

  return LocalStrageKeyValueIO;
}();

exports.LocalStrageKeyValueIO = LocalStrageKeyValueIO;
},{}],"infra/datastore/keyvalue/IssueRepositoryImpl.ts":[function(require,module,exports) {
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
  function IssueRepositoryImpl(githubToken, owner, repo, GitHub) {
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
},{}],"infra/datastore/keyvalue/GithubKeyValueIO.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GithubKeyValueIO = void 0;

var IssueRepositoryImpl_1 = require("./IssueRepositoryImpl");

var GithubKeyValueIO =
/** @class */
function () {
  function GithubKeyValueIO(keyMap, githubToken, owner, repo, GitHub) {
    this.keyMap = keyMap;
    this.issueRepository = new IssueRepositoryImpl_1.IssueRepositoryImpl(githubToken, owner, repo, GitHub);
  }

  GithubKeyValueIO.prototype.save = function (key, value, callback) {
    this.issueRepository.updateBody(this.keyMap[key], value, callback);
  };

  GithubKeyValueIO.prototype.load = function (key, callback) {
    this.issueRepository.getIssue(this.keyMap[key], function (err, issue) {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, issue.body);
    });
  };

  return GithubKeyValueIO;
}();

exports.GithubKeyValueIO = GithubKeyValueIO;
},{"./IssueRepositoryImpl":"infra/datastore/keyvalue/IssueRepositoryImpl.ts"}],"pjfu.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pjfu = void 0;

var PjfuVue_1 = require("./infra/view/PjfuVue");

var MermaidTreeView_1 = require("./infra/view/MermaidTreeView");

var ActionRepositoryImpl_1 = require("./infra/ActionRepositoryImpl");

var ObjectiveRepositoryImpl_1 = require("./infra/ObjectiveRepositoryImpl");

var AnyId_1 = require("./infra/view/AnyId");

var TextIO_1 = require("./infra/datastore/TextIO");

var DataStoreServer_1 = require("./infra/datastore/DataStoreServer");

var LocalStrageKeyValueIO_1 = require("./infra/datastore/keyvalue/LocalStrageKeyValueIO");

var GithubKeyValueIO_1 = require("./infra/datastore/keyvalue/GithubKeyValueIO");

var IssueRepositoryImpl_1 = require("./infra/datastore/keyvalue/IssueRepositoryImpl");

function pjfu(keyValueIo) {
  var dataStore = new DataStoreServer_1.DataStoreServer(new TextIO_1.PjfuTextIO(keyValueIo));
  dataStore.findAll(function (err, objectives, actions) {
    var objectiveRepository = new ObjectiveRepositoryImpl_1.ObjectiveRepositoryImpl(dataStore, objectives);
    var actionRepository = new ActionRepositoryImpl_1.ActionRepositoryImpl(dataStore, actions);
    var pjfuVue = new PjfuVue_1.PjfuVue(objectiveRepository, actionRepository, new MermaidTreeView_1.MermaidTreeView(objectiveRepository, actionRepository, window['mermaid']), window['Vue']); // 編集フォームはURLのハッシュに従う

    var updateFormByHash = function updateFormByHash() {
      return pjfuVue.applyTargetId(new AnyId_1.AnyId(window.location.hash.slice(1)));
    };

    window.addEventListener('hashchange', updateFormByHash);

    if (location.hash) {
      updateFormByHash();
    } // mermaidの矩形をクリックした時に呼ばれるメソッド
    // グローバルに定義するしかない


    window['mermaidCallback'] = function (id) {
      pjfuVue.applyTargetId(new AnyId_1.AnyId(id));
    };
  });
}

exports.pjfu = pjfu; // グローバルから使えるようにする

window['LocalStrageKeyValueIO'] = LocalStrageKeyValueIO_1.LocalStrageKeyValueIO;
window['GithubKeyValueIO'] = GithubKeyValueIO_1.GithubKeyValueIO;
window['IssueNumber'] = IssueRepositoryImpl_1.IssueNumber;
window['pjfu'] = pjfu;
},{"./infra/view/PjfuVue":"infra/view/PjfuVue.ts","./infra/view/MermaidTreeView":"infra/view/MermaidTreeView.ts","./infra/ActionRepositoryImpl":"infra/ActionRepositoryImpl.ts","./infra/ObjectiveRepositoryImpl":"infra/ObjectiveRepositoryImpl.ts","./infra/view/AnyId":"infra/view/AnyId.ts","./infra/datastore/TextIO":"infra/datastore/TextIO.ts","./infra/datastore/DataStoreServer":"infra/datastore/DataStoreServer.ts","./infra/datastore/keyvalue/LocalStrageKeyValueIO":"infra/datastore/keyvalue/LocalStrageKeyValueIO.ts","./infra/datastore/keyvalue/GithubKeyValueIO":"infra/datastore/keyvalue/GithubKeyValueIO.ts","./infra/datastore/keyvalue/IssueRepositoryImpl":"infra/datastore/keyvalue/IssueRepositoryImpl.ts"}],"../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55504" + '/');

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
},{}]},{},["../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js","pjfu.ts"], null)
//# sourceMappingURL=/pjfu.js.map