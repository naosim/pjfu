// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      const e = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(e)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
      return v;
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain", [], function (exports_1, context_1) {
    "use strict";
    var Note, TaskLimitDate, TaskStatus, Task, MetaData, Link;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Note = class Note {
                constructor(value) {
                    this.value = value;
                }
                toObject() {
                    return this.value;
                }
                isNotEmpty() {
                    return this.value.trim().length > 0;
                }
                static empty() {
                    return new Note('');
                }
            };
            exports_1("Note", Note);
            TaskLimitDate = class TaskLimitDate {
                constructor(raw, dateString) {
                    this.raw = raw;
                    this.dateString = dateString;
                    this.date = new Date(dateString);
                    this.time = this.date.getTime();
                }
                isIn2Weeks(now) {
                    const d = this.time;
                    const day = 24 * 60 * 60 * 1000;
                    return now.getTime() - 15 * day < d && d < now.getTime() + 15 * day;
                }
                toObject() {
                    return {
                        raw: this.raw,
                        dateString: this.date.toLocaleDateString()
                    };
                }
                static create(raw, now) {
                    return new TaskLimitDate(raw, TaskLimitDate.textToDate(raw, now).toLocaleDateString());
                }
                static unlimited() {
                    return new TaskLimitDate('', '2999/12/31');
                }
                static textToDate(raw, now) {
                    if (raw.length == 0) {
                        return new Date('2999/12/31');
                    }
                    raw = raw.split('(')[0];
                    var segs = raw.split('/');
                    if (segs.length == 3) {
                        return new Date(raw);
                    }
                    if (segs.length == 2) {
                        const year = now.getFullYear();
                        return TaskLimitDate.near(now, [
                            new Date(`${year - 1}/${raw}`),
                            new Date(`${year}/${raw}`),
                            new Date(`${year + 1}/${raw}`)
                        ]);
                    }
                    throw new Error('不明: ' + raw);
                }
                static near(now, dates) {
                    const diffs = dates.map(v => Math.abs(v.getTime() - now.getTime()));
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
                }
            };
            exports_1("TaskLimitDate", TaskLimitDate);
            TaskStatus = class TaskStatus {
                constructor(raw) {
                    this.raw = raw;
                }
                toObject() {
                    return this.raw;
                }
                isDone() {
                    return ['完了'].filter(v => this.raw == v).length > 0;
                }
                isNotEmpty() {
                    return this.raw.trim().length > 0;
                }
            };
            exports_1("TaskStatus", TaskStatus);
            Task = class Task {
                constructor(limitDate, title, status) {
                    this.limitDate = limitDate;
                    this.title = title;
                    this.status = status;
                }
                toObject() {
                    return {
                        limitDate: this.limitDate.toObject(),
                        title: this.title,
                        status: this.status.toObject()
                    };
                }
            };
            exports_1("Task", Task);
            MetaData = class MetaData {
                constructor(description, members, links, note, tasks) {
                    this.description = description;
                    this.members = members;
                    this.links = links;
                    this.note = note;
                    this.tasks = tasks;
                }
                toObject() {
                    return {
                        description: this.description,
                        members: this.members,
                        links: this.links.map(v => v.toObject()),
                        note: this.note.toObject(),
                        tasks: this.tasks.map(v => v.toObject())
                    };
                }
                static empty() {
                    return new MetaData('', [], [], Note.empty(), []);
                }
            };
            exports_1("MetaData", MetaData);
            Link = class Link {
                constructor(name, path) {
                    this.name = name;
                    this.path = path;
                }
                toObject() {
                    return {
                        name: this.name,
                        path: this.path
                    };
                }
            };
            exports_1("Link", Link);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain"], function (exports_2, context_2) {
    "use strict";
    var domain_ts_1, Objective;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (domain_ts_1_1) {
                domain_ts_1 = domain_ts_1_1;
            }
        ],
        execute: function () {
            (function (Objective) {
                class Entity {
                    constructor(id, title, metaData, parent) {
                        this.id = id;
                        this.title = title;
                        this.metaData = metaData;
                        this.parent = parent;
                        this.isRoot = parent ? false : true;
                        this.isNotRoot = !this.isRoot;
                        if (id.eq(parent)) {
                            throw new Error('IDとparentが同一です');
                        }
                        if (!title || title.trim().length == 0) {
                            throw new Error('タイトルが空です');
                        }
                    }
                    toObject() {
                        return {
                            id: this.id.toObject(),
                            title: this.title,
                            parent: this.parent ? this.parent.toObject() : null,
                            metaData: this.metaData.toObject()
                        };
                    }
                    static root() {
                        return new Entity(Id.create(0), 'root', domain_ts_1.MetaData.empty());
                    }
                }
                Objective.Entity = Entity;
                class Id {
                    constructor(value) {
                        this.value = value;
                        this._class = 'Objective.Id';
                    }
                    static create(num) {
                        return new Id('O' + num);
                    }
                    toObject() {
                        return this.value;
                    }
                    eq(other) {
                        if (!other) {
                            return false;
                        }
                        return other && this.value === other.value;
                    }
                }
                Objective.Id = Id;
            })(Objective || (Objective = {}));
            exports_2("Objective", Objective);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Action", [], function (exports_3, context_3) {
    "use strict";
    var Action;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            (function (Action) {
                class Entity {
                    constructor(id, title, parents, metaData) {
                        this.id = id;
                        this.title = title;
                        this.parents = parents;
                        this.metaData = metaData;
                        if (!title || title.trim().length == 0) {
                            throw new Error('タイトルが空です');
                        }
                    }
                    toObject() {
                        return {
                            id: this.id.toObject(),
                            title: this.title,
                            parents: this.parents.map(v => v.toObject()),
                            metaData: this.metaData.toObject()
                        };
                    }
                }
                Action.Entity = Entity;
                class Id {
                    constructor(value) {
                        this.value = value;
                    }
                    static create(num) {
                        return new Id('A' + num);
                    }
                    toObject() {
                        return this.value;
                    }
                    eq(other) {
                        return other && this.value === other.value;
                    }
                }
                Action.Id = Id;
            })(Action || (Action = {}));
            exports_3("Action", Action);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Action", "file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective"], function (exports_4, context_4) {
    "use strict";
    var Action_ts_1, Objective_ts_1, AnyId;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (Action_ts_1_1) {
                Action_ts_1 = Action_ts_1_1;
            },
            function (Objective_ts_1_1) {
                Objective_ts_1 = Objective_ts_1_1;
            }
        ],
        execute: function () {
            AnyId = class AnyId {
                constructor(id) {
                    this.id = id;
                }
                forEach(objectiveCallback, actionCallback) {
                    if (this.id[0] == 'O') {
                        return objectiveCallback(new Objective_ts_1.Objective.Id(this.id));
                    }
                    else if (this.id[0] == 'A') {
                        return actionCallback(new Action_ts_1.Action.Id(this.id));
                    }
                    else {
                        throw new Error('未知のID: ' + this.id);
                    }
                }
                getValue() {
                    return this.id.trim();
                }
                isEmpty() {
                    return this.getValue().length == 0;
                }
                static create(id) {
                    return new AnyId(id.value);
                }
            };
            exports_4("AnyId", AnyId);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MermaidConvertor", [], function (exports_5, context_5) {
    "use strict";
    var MermaidConvertor;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            MermaidConvertor = class MermaidConvertor {
                static toMermaidScript(entities, actions, treeCenterId, selectedId) {
                    const isSelected = (id) => id == treeCenterId.getValue() || (selectedId && id == selectedId.getValue());
                    const map = {};
                    entities.forEach(v => map[v.id.value] = v);
                    const rectText = entities.map(v => `${v.id.value}["${v.title}<br>${v.metaData.members.join(', ')}"]${isSelected(v.id.value) ? ':::objective_select' : ''}`).join('\n');
                    const linkText = entities.map(v => `click ${v.id.value} mermaidCallback`).join('\n');
                    const arrowText = entities.filter(v => v.parent && map[v.parent.value]).map(v => `${v.id.value} --> ${v.parent.value}`).join('\n');
                    const roundText = actions.map(v => `${v.id.value}("${v.title}<br>${v.metaData.members.join(', ')}"):::action${isSelected(v.id.value) ? '_select' : ''}`).join('\n');
                    const actionLinkText = actions.map(v => `click ${v.id.value} mermaidCallback`).join('\n');
                    const actionArrowText = actions.map(v => v.parents.map(p => `${v.id.value} --> ${p.value}`).join('\n')).join('\n');
                    const noteText = actions.filter(v => v.metaData.note.isNotEmpty()).map(v => `${v.id.value}_note["${v.metaData.note.value.split('\n').join('<br>')}"]:::note`).join('\n');
                    const noteArrowText = actions.filter(v => v.metaData.note.isNotEmpty()).map(v => `${v.id.value}_note --- ${v.id.value}`).join('\n');
                    return `
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '11px', 'lineColor': '#888'}}}%%
graph LR
classDef objective_select stroke-width:4px;
classDef action fill:#ECFFEC, stroke: #93DB70;
classDef action_select fill:#ECFFEC, stroke: #93DB70, stroke-width:4px;
classDef note fill:#FFFFEC, stroke: #DBDB93;
${rectText}
${linkText}
${arrowText}
${roundText}
${actionLinkText}
${actionArrowText}
${noteText}
${noteArrowText}
  `.trim();
                }
            };
            exports_5("MermaidConvertor", MermaidConvertor);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/ViewModeModel", [], function (exports_6, context_6) {
    "use strict";
    var ModeType;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            (function (ModeType) {
                ModeType["targetTree"] = "targetTree";
                ModeType["member"] = "member";
            })(ModeType || (ModeType = {}));
            exports_6("ModeType", ModeType);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MermaidTreeView", ["file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MermaidConvertor", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/ViewModeModel"], function (exports_7, context_7) {
    "use strict";
    var MermaidConvertor_ts_1, AnyId_ts_1, ViewModeModel_ts_1, MermaidTreeView;
    var __moduleName = context_7 && context_7.id;
    function merge(a, b) {
        var c = { objectiveMap: {}, actionMap: {} };
        Object.keys(a.objectiveMap).forEach(k => c.objectiveMap[k] = a.objectiveMap[k]);
        Object.keys(b.objectiveMap).forEach(k => c.objectiveMap[k] = b.objectiveMap[k]);
        Object.keys(a.actionMap).forEach(k => c.actionMap[k] = a.actionMap[k]);
        Object.keys(b.actionMap).forEach(k => c.actionMap[k] = b.actionMap[k]);
        return c;
    }
    return {
        setters: [
            function (MermaidConvertor_ts_1_1) {
                MermaidConvertor_ts_1 = MermaidConvertor_ts_1_1;
            },
            function (AnyId_ts_1_1) {
                AnyId_ts_1 = AnyId_ts_1_1;
            },
            function (ViewModeModel_ts_1_1) {
                ViewModeModel_ts_1 = ViewModeModel_ts_1_1;
            }
        ],
        execute: function () {
            MermaidTreeView = class MermaidTreeView {
                constructor(objectiveRepository, actionRepository, mermaid) {
                    this.objectiveRepository = objectiveRepository;
                    this.actionRepository = actionRepository;
                    this.mermaid = mermaid;
                }
                findRelated(anyId) {
                    const objectiveMap = {};
                    const actionMap = {};
                    var parents = [];
                    anyId.forEach(id => {
                        parents = [id];
                    }, id => {
                        const current = this.actionRepository.findById(id);
                        parents = current.parents;
                        parents.forEach(p => {
                            this.actionRepository.findChildren(p).forEach(v => {
                                actionMap[v.id.value] = v;
                            });
                        });
                    });
                    parents.forEach(p => {
                        var underObjectives = this.objectiveRepository.findUnder(p);
                        underObjectives.forEach(v => {
                            objectiveMap[v.id.value] = v;
                            this.actionRepository.findChildren(v.id).forEach(v => {
                                actionMap[v.id.value] = v;
                            });
                        });
                        this.objectiveRepository.findParentsTree(p).forEach(v => objectiveMap[v.id.value] = v);
                    });
                    return { objectiveMap, actionMap };
                }
                update(viewMode, selectedId) {
                    const anyId = new AnyId_ts_1.AnyId(viewMode.treeTargetId);
                    selectedId = selectedId || [viewMode.treeTargetId].filter(v => v).map(v => new AnyId_ts_1.AnyId(v))[0];
                    var related = { objectiveMap: {}, actionMap: {} };
                    if (viewMode.modeType == ViewModeModel_ts_1.ModeType.targetTree) {
                        related = this.findRelated(anyId);
                    }
                    else if (viewMode.modeType == ViewModeModel_ts_1.ModeType.member) {
                        related = { objectiveMap: {}, actionMap: {} };
                        this.objectiveRepository.findByMembers(viewMode.selectedMembers).forEach(e => { related = merge(related, this.findRelated(new AnyId_ts_1.AnyId(e.id.value))); });
                        this.actionRepository.findByMembers(viewMode.selectedMembers).forEach(e => { related = merge(related, this.findRelated(new AnyId_ts_1.AnyId(e.id.value))); });
                        console.log(related);
                    }
                    var element = window.document.querySelector("#profu");
                    var text = MermaidConvertor_ts_1.MermaidConvertor.toMermaidScript(Object.values(related.objectiveMap), Object.values(related.actionMap), anyId, selectedId);
                    this.mermaid.mermaidAPI.render('graphDiv', text, (svg, bind) => {
                        element.innerHTML = svg;
                        bind(element);
                    });
                }
            };
            exports_7("MermaidTreeView", MermaidTreeView);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MetaDataConverter", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain"], function (exports_8, context_8) {
    "use strict";
    var domain_ts_2, MetaDataForm, MetaDataConverter;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (domain_ts_2_1) {
                domain_ts_2 = domain_ts_2_1;
            }
        ],
        execute: function () {
            MetaDataForm = class MetaDataForm {
                constructor() {
                    this.value = '';
                }
                set(metaData) {
                    this.value = MetaDataConverter.toText(metaData);
                }
                get(now) {
                    return MetaDataConverter.toMetaData(this.value, now);
                }
            };
            exports_8("MetaDataForm", MetaDataForm);
            MetaDataConverter = class MetaDataConverter {
                static toMetaData(text, now) {
                    if (text.trim()[0] != '#') {
                        return new domain_ts_2.MetaData(text, [], [], domain_ts_2.Note.empty(), []);
                    }
                    const obj = MetaDataConverter.textToObj(text);
                    console.log(obj);
                    return new domain_ts_2.MetaData(obj['説明'] || '', obj['担当'] ? obj['担当'].split(',').map((v) => v.trim()) : [], obj['リンク'] ? obj['リンク'].map((v) => new domain_ts_2.Link(v.name, v.path)) : [], new domain_ts_2.Note(obj['ノート'] || ''), obj['マイルストーン'] ? obj['マイルストーン'].split('\n').map((v) => MetaDataConverter.parseTaskLine(v, now)) : []);
                }
                static parseTaskLine(line, now) {
                    line = line.trim();
                    const limitDate = domain_ts_2.TaskLimitDate.create(line.slice(0, line.indexOf(' ')), now);
                    var title;
                    var status;
                    if (line[line.length - 1] == ']') {
                        const i = line.lastIndexOf('[');
                        title = line.slice(line.indexOf(' '), i).trim();
                        status = new domain_ts_2.TaskStatus(line.slice(i + 1, line.length - 1).trim());
                    }
                    else {
                        title = line.slice(line.indexOf(' ')).trim();
                        status = new domain_ts_2.TaskStatus('');
                    }
                    console.log(status);
                    return new domain_ts_2.Task(limitDate, title, status);
                }
                static toText(metaData) {
                    return [
                        '# 説明: \n' + metaData.description,
                        '',
                        '# 担当: ' + metaData.members.join(', '),
                        '# リンク: \n' + metaData.links.map(v => `- [${v.name}](${v.path})`).join('\n'),
                        '# ノート: \n' + metaData.note.value,
                        '# マイルストーン: \n' + metaData.tasks.map(v => `${v.limitDate.raw} ${v.title} ${v.status.isNotEmpty() ? '[' + v.status.raw + ']' : ''}`).join('\n')
                    ].join('\n');
                }
                static textToObj(text) {
                    text = text.trim();
                    if (text[0] != '#') {
                        throw new Error('不正なテキスト');
                    }
                    return text.split('\n').reduce((memo, v) => {
                        if (v.indexOf('# ') == 0) {
                            memo.push([v]);
                        }
                        else {
                            memo[memo.length - 1].push(v);
                        }
                        return memo;
                    }, []).reduce((memo, lines) => {
                        const key = lines[0].split('#')[1].split(':')[0].trim();
                        lines[0] = lines[0].indexOf(':') != -1 ? lines[0].slice(lines[0].indexOf(':') + 1) : '';
                        var value = lines.join('\n').trim();
                        if (value.indexOf('- [') == 0) {
                            value = value.split('\n').map((v) => {
                                return {
                                    name: v.split('[')[1].split(']')[0],
                                    path: v.split('(')[1].split(')')[0],
                                };
                            }).reduce((memo, v) => {
                                memo.push(v);
                                return memo;
                            }, []);
                        }
                        memo[key] = value;
                        return memo;
                    }, {});
                }
            };
            exports_8("MetaDataConverter", MetaDataConverter);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/EditForm", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain", "file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Action", "file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MetaDataConverter", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId"], function (exports_9, context_9) {
    "use strict";
    var domain_ts_3, Action_ts_2, Objective_ts_2, MetaDataConverter_ts_1, AnyId_ts_2, ParentsForm, EditForm;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (domain_ts_3_1) {
                domain_ts_3 = domain_ts_3_1;
            },
            function (Action_ts_2_1) {
                Action_ts_2 = Action_ts_2_1;
            },
            function (Objective_ts_2_1) {
                Objective_ts_2 = Objective_ts_2_1;
            },
            function (MetaDataConverter_ts_1_1) {
                MetaDataConverter_ts_1 = MetaDataConverter_ts_1_1;
            },
            function (AnyId_ts_2_1) {
                AnyId_ts_2 = AnyId_ts_2_1;
            }
        ],
        execute: function () {
            ParentsForm = class ParentsForm {
                constructor() {
                    this.value = '';
                }
                set(parents) {
                    this.value = parents.map(v => v.value).join(', ');
                }
                get() {
                    return this.value.split(',').map(v => new Objective_ts_2.Objective.Id(v.trim()));
                }
            };
            exports_9("ParentsForm", ParentsForm);
            EditForm = class EditForm {
                constructor() {
                    this.id = '';
                    this.title = '';
                    this.parents = new ParentsForm();
                    this.detail = new MetaDataConverter_ts_1.MetaDataForm();
                    this.links = [{ name: '', path: '' }];
                }
                getAnyId() {
                    const anyId = new AnyId_ts_2.AnyId(this.id);
                    if (anyId.isEmpty()) {
                        throw new Error('IDが空');
                    }
                    return anyId;
                }
                forEachId(objectiveCallback, actionCallback) {
                    return this.getAnyId().forEach(objectiveCallback, actionCallback);
                }
                createObjectiveEntity(id) {
                    return new Objective_ts_2.Objective.Entity(id, this.title, this.detail.get(new Date()), this.parents.get()[0]);
                }
                setObjectiveEntity(entity) {
                    this.id = entity.id.value;
                    this.title = entity.title;
                    this.parents.set(entity.isNotRoot ? [entity.parent] : []);
                    this.detail.set(entity.metaData);
                    this.links = entity.metaData.links.map(v => ({ name: v.name, path: v.path }));
                }
                createActionEntity(id) {
                    return new Action_ts_2.Action.Entity(id, this.title, this.parents.get(), this.detail.get(new Date()));
                }
                setActionEntity(entity) {
                    this.id = entity.id.value;
                    this.title = entity.title;
                    this.parents.set(entity.parents);
                    this.detail.set(entity.metaData);
                    this.links = entity.metaData.links.map(v => ({ name: v.name, path: v.path }));
                }
                toEntity(objectiveCallback, actionCallback) {
                    const anyId = this.getAnyId();
                    anyId.forEach(id => {
                        objectiveCallback(new Objective_ts_2.Objective.Entity(id, this.title, this.detail.get(new Date()), this.parents.get()[0]));
                    }, id => {
                        actionCallback(new Action_ts_2.Action.Entity(id, this.title, this.parents.get(), this.detail.get(new Date())));
                    });
                }
                setSub() {
                    this.parents.set([new Objective_ts_2.Objective.Id(this.id)]);
                    this.id = '';
                    this.title = '';
                    this.detail.set(domain_ts_3.MetaData.empty());
                }
            };
            exports_9("EditForm", EditForm);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/service/service", ["file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId"], function (exports_10, context_10) {
    "use strict";
    var AnyId_ts_3, PjfuTask, TaskService;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (AnyId_ts_3_1) {
                AnyId_ts_3 = AnyId_ts_3_1;
            }
        ],
        execute: function () {
            PjfuTask = class PjfuTask {
                constructor(id, title, task, now) {
                    this.id = id;
                    this.title = title;
                    this.taskTitle = task.title;
                    this.limitDate = task.limitDate;
                    this.limitTimestamp = task.limitDate.time;
                    this.status = task.status;
                    this.isDone = task.status.isDone();
                    this.isIn2Weeks = task.limitDate.isIn2Weeks(now);
                }
            };
            exports_10("PjfuTask", PjfuTask);
            TaskService = class TaskService {
                constructor(objectiveRepository, actionRepository) {
                    this.objectiveRepository = objectiveRepository;
                    this.actionRepository = actionRepository;
                }
                findAllPjfuTask() {
                    const tasks = [];
                    const now = new Date();
                    this.objectiveRepository.findAll().forEach(v => v.metaData.tasks.forEach(t => tasks.push(new PjfuTask(AnyId_ts_3.AnyId.create(v.id), v.title, t, now))));
                    this.actionRepository.findAll().forEach(v => v.metaData.tasks.forEach(t => tasks.push(new PjfuTask(AnyId_ts_3.AnyId.create(v.id), v.title, t, now))));
                    return tasks.sort((a, b) => a.limitTimestamp - b.limitTimestamp);
                }
            };
            exports_10("TaskService", TaskService);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/PjfuVue", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/ViewModeModel", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/EditForm"], function (exports_11, context_11) {
    "use strict";
    var domain_ts_4, AnyId_ts_4, ViewModeModel_ts_2, EditForm_ts_1, PjfuVue, TaskView, AlertCallBack;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (domain_ts_4_1) {
                domain_ts_4 = domain_ts_4_1;
            },
            function (AnyId_ts_4_1) {
                AnyId_ts_4 = AnyId_ts_4_1;
            },
            function (ViewModeModel_ts_2_1) {
                ViewModeModel_ts_2 = ViewModeModel_ts_2_1;
            },
            function (EditForm_ts_1_1) {
                EditForm_ts_1 = EditForm_ts_1_1;
            }
        ],
        execute: function () {
            PjfuVue = class PjfuVue {
                constructor(objectiveRepository, actionRepository, mermaidTreeView, taskService, Vue) {
                    this.objectiveRepository = objectiveRepository;
                    this.actionRepository = actionRepository;
                    this.mermaidTreeView = mermaidTreeView;
                    this.taskService = taskService;
                    this.data = {
                        viewMode: {
                            modeType: ViewModeModel_ts_2.ModeType.targetTree,
                            treeTargetId: 'O0',
                            selectedMembers: [],
                            members: []
                        },
                        editTargetId: '',
                        editForm: new EditForm_ts_1.EditForm(),
                        tasks: [TaskView.empty()],
                        windowWidth: window.innerWidth
                    };
                    this.init(Vue);
                }
                init(Vue) {
                    try {
                        this.app = new Vue({
                            el: '#app',
                            data: this.data,
                            methods: {
                                onClickUpdateButton: () => this.update(),
                                onClickTreeUpdateButton: () => this.onUpdate(),
                                onClickApplyTreeCenteredFromSelected: () => this.applyTreeCenteredFromSelected(),
                                onClickSubButton: () => this.createSub(),
                                onClickInsertObjectiveButton: () => this.insertObjective(),
                                onClickInsertActionButton: () => this.insertAction(),
                                onClickRemoveButton: () => this.remove(),
                                onClickTaskLinkButton: (id) => this.applyTargetId(id)
                            }
                        });
                        this.onUpdate();
                        this.data.viewMode.selectedMembers = this.data.viewMode.members;
                        window.addEventListener('resize', () => this.handleResize());
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                handleResize() {
                    this.data.windowWidth = window.innerWidth;
                }
                applyTreeCenteredFromSelected() {
                    this.data.viewMode.modeType = ViewModeModel_ts_2.ModeType.targetTree;
                    this.data.viewMode.treeTargetId = this.data.editTargetId;
                    this.mermaidTreeView.update(this.data.viewMode);
                }
                applyTargetId(id) {
                    console.log(id);
                    id.forEach(id => {
                        const objective = this.objectiveRepository.findById(id);
                        this.data.editTargetId = objective.id.value;
                        this.data.editForm.setObjectiveEntity(objective);
                    }, id => {
                        const action = this.actionRepository.findById(id);
                        this.data.editTargetId = action.id.value;
                        this.data.editForm.setActionEntity(action);
                    });
                    this.mermaidTreeView.update(this.data.viewMode, id);
                }
                update() {
                    this.data.editForm.toEntity(o => this.objectiveRepository.update(o, AlertCallBack.callbackVoid(() => this.onUpdate())), a => this.actionRepository.update(a, AlertCallBack.callbackVoid(() => this.onUpdate())));
                }
                createSub() {
                    this.data.editForm.setSub();
                }
                insertObjective() {
                    this.objectiveRepository.createId((err, id) => {
                        if (err) {
                            console.error(err);
                            window.alert('エラー: ' + err.message);
                            return;
                        }
                        this.objectiveRepository.insert(this.data.editForm.createObjectiveEntity(id), AlertCallBack.callbackVoid(() => this.onUpdate()));
                    });
                }
                insertAction() {
                    this.actionRepository.createId(AlertCallBack.callback(id => {
                        this.actionRepository.insert(this.data.editForm.createActionEntity(id), AlertCallBack.callbackVoid(() => this.onUpdate()));
                    }));
                    this.actionRepository.createId((err, id) => {
                        if (err) {
                            console.error(err);
                            window.alert('エラー: ' + err.message);
                            return;
                        }
                        this.actionRepository.insert(this.data.editForm.createActionEntity(id), AlertCallBack.callbackVoid(() => this.onUpdate()));
                    });
                }
                remove() {
                    this.data.editForm.forEachId(id => {
                        if (this.actionRepository.hasChildren(id)) {
                            window.alert('子要素を消してください');
                            throw new Error('子要素を消してください');
                        }
                        this.objectiveRepository.remove(id, AlertCallBack.callbackVoid(() => this.onUpdate()));
                    }, id => {
                        this.actionRepository.remove(id, AlertCallBack.callbackVoid(() => this.onUpdate()));
                    });
                }
                onUpdate() {
                    this.updateViewModeMembers();
                    this.mermaidTreeView.update(this.data.viewMode);
                    this.updateTaskList();
                }
                updateViewModeMembers() {
                    var memberMap = {};
                    this.objectiveRepository.findAll().forEach(v => v.metaData.members.forEach(m => memberMap[m] = true));
                    this.actionRepository.findAll().forEach(v => v.metaData.members.forEach(m => memberMap[m] = true));
                    this.data.viewMode.members = Object.keys(memberMap);
                }
                updateTaskList() {
                    this.data.tasks = this.taskService.findAllPjfuTask().map(v => TaskView.create(v));
                    console.log(this.data.tasks);
                }
            };
            exports_11("PjfuVue", PjfuVue);
            TaskView = class TaskView {
                constructor(id, title, taskTitle, limitDate, limitTimestamp, status, isDone, isIn2Weeks) {
                    this.id = id;
                    this.limitTimestamp = limitTimestamp;
                    this.isDone = isDone;
                    this.isIn2Weeks = isIn2Weeks;
                    this.text = `${limitDate.raw} ${title} ${taskTitle}` + (status.isNotEmpty() ? ` [${status.raw}]` : '');
                }
                static empty() {
                    var d = domain_ts_4.TaskLimitDate.unlimited();
                    return new TaskView(new AnyId_ts_4.AnyId(''), '', '', d, d.time, new domain_ts_4.TaskStatus(''), false, false);
                }
                static create(task) {
                    return new TaskView(task.id, task.title, task.taskTitle, task.limitDate, task.limitTimestamp, task.status, task.isDone, task.isIn2Weeks);
                }
            };
            exports_11("TaskView", TaskView);
            AlertCallBack = class AlertCallBack {
                static callback(cb) {
                    return (err, t) => {
                        if (err) {
                            console.error(err);
                            window.alert('エラー: ' + err.message);
                            return;
                        }
                        cb(t);
                    };
                }
                static callbackVoid(cb) {
                    return (err) => {
                        if (err) {
                            console.error(err);
                            window.alert('エラー: ' + err.message);
                            return;
                        }
                        cb();
                    };
                }
            };
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/InMemoryDataStore", [], function (exports_12, context_12) {
    "use strict";
    var InMemoryDataStore;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [],
        execute: function () {
            InMemoryDataStore = class InMemoryDataStore {
                constructor(entities) {
                    this.entityMap = {};
                    entities.forEach(v => this.entityMap[v.id.value] = v);
                }
                findAll() {
                    return Object.keys(this.entityMap).map(key => this.entityMap[key]);
                }
                findById(id) {
                    return this.entityMap[id.value];
                }
                isExist(id) {
                    return this.entityMap[id.value] ? true : false;
                }
                update(entity) {
                    if (!this.isExist(entity.id)) {
                        throw new Error(`entity not found: ${entity.id.value}`);
                    }
                    this.entityMap[entity.id.value] = entity;
                    console.log('update inMemory');
                }
                insert(entity) {
                    if (this.isExist(entity.id)) {
                        throw new Error(`entity already exists: ${entity.id.value}`);
                    }
                    this.entityMap[entity.id.value] = entity;
                    console.log('insert inMemory');
                }
                remove(id) {
                    delete this.entityMap[id.value];
                }
            };
            exports_12("InMemoryDataStore", InMemoryDataStore);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/ActionDataStore", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/ActionRepositoryImpl", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Action", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/InMemoryDataStore"], function (exports_14, context_14) {
    "use strict";
    var Action_ts_3, InMemoryDataStore_ts_1, ActionRepositoryImpl;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (Action_ts_3_1) {
                Action_ts_3 = Action_ts_3_1;
            },
            function (InMemoryDataStore_ts_1_1) {
                InMemoryDataStore_ts_1 = InMemoryDataStore_ts_1_1;
            }
        ],
        execute: function () {
            ActionRepositoryImpl = class ActionRepositoryImpl {
                constructor(dataStore, actions) {
                    this.dataStore = dataStore;
                    this.parentMap = {};
                    this.inMemoryActionDataStore = new InMemoryDataStore_ts_1.InMemoryDataStore(actions);
                    this.onUpdate();
                }
                createId(callback) {
                    const num = Math.floor(Date.now() / 1000);
                    setTimeout(() => callback(undefined, Action_ts_3.Action.Id.create(num)), 100);
                }
                findAll() {
                    return this.inMemoryActionDataStore.findAll();
                }
                findById(id) {
                    return this.inMemoryActionDataStore.findById(id);
                }
                hasChildren(parentId) {
                    return this.parentMap[parentId.value] ? true : false;
                }
                findChildren(parentId) {
                    return (this.parentMap[parentId.value] || []).map(id => this.findById(id));
                }
                findByMembers(members) {
                    console.log(members);
                    const map = {};
                    var list = this.findAll().filter(v => v.metaData.members.length > 0);
                    list.forEach(e => e.metaData.members.forEach(m => members.forEach(v => {
                        if (m == v) {
                            map[e.id.value] = e;
                        }
                    })));
                    return Object.keys(map).map(k => map[k]);
                }
                onUpdate() {
                    this.parentMap = {};
                    this.findAll().forEach(v => {
                        v.parents.forEach(parent => {
                            if (!this.parentMap[parent.value]) {
                                this.parentMap[parent.value] = [];
                            }
                            this.parentMap[parent.value].push(v.id);
                        });
                    });
                }
                update(entity, callback) {
                    if (!this.inMemoryActionDataStore.isExist(entity.id)) {
                        throw new Error(`entity not found: ${entity.id.value}`);
                    }
                    this.dataStore.updateAction(entity, (e) => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryActionDataStore.update(entity);
                        callback();
                    });
                }
                insert(entity, callback) {
                    if (this.inMemoryActionDataStore.isExist(entity.id)) {
                        throw new Error(`entity already exists: ${entity.id.value}`);
                    }
                    this.dataStore.insertAction(entity, (e) => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryActionDataStore.insert(entity);
                        this.onUpdate();
                        callback();
                    });
                }
                remove(id, callback) {
                    if (!this.inMemoryActionDataStore.isExist(id)) {
                        throw new Error(`entity not found: ${id.value}`);
                    }
                    this.dataStore.removeAction(id, e => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryActionDataStore.remove(id);
                        this.onUpdate();
                        callback();
                    });
                }
            };
            exports_14("ActionRepositoryImpl", ActionRepositoryImpl);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/ObjectiveDataStore", [], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/ObjectiveRepositoryImpl", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/InMemoryDataStore"], function (exports_16, context_16) {
    "use strict";
    var Objective_ts_3, InMemoryDataStore_ts_2, ObjectiveRepositoryImpl;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (Objective_ts_3_1) {
                Objective_ts_3 = Objective_ts_3_1;
            },
            function (InMemoryDataStore_ts_2_1) {
                InMemoryDataStore_ts_2 = InMemoryDataStore_ts_2_1;
            }
        ],
        execute: function () {
            ObjectiveRepositoryImpl = class ObjectiveRepositoryImpl {
                constructor(dataStore, objectives) {
                    this.dataStore = dataStore;
                    this.parentMap = {};
                    this.inMemoryObjectiveDataStore = new InMemoryDataStore_ts_2.InMemoryDataStore(objectives);
                    this.onUpdate();
                }
                createId(callback) {
                    const num = Math.floor(Date.now() / 1000);
                    setTimeout(() => callback(undefined, Objective_ts_3.Objective.Id.create(num)), 100);
                }
                findAll() {
                    return this.inMemoryObjectiveDataStore.findAll();
                }
                findById(id) {
                    return this.inMemoryObjectiveDataStore.findById(id);
                }
                findParentsTree(rootId) {
                    const parentTrunkList = [];
                    const findParentTrunk = (id) => {
                        parentTrunkList.push(id);
                        const entity = this.findById(id);
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
                    parentTrunkList.forEach(p => {
                        this.parentMap[p.value].forEach(v => result.push(this.findById(v)));
                    });
                    result.push(this.findById(parentTrunkList[parentTrunkList.length - 1]));
                    return result;
                }
                findUnder(rootId) {
                    var getChildren = (rootId) => {
                        var list = [this.findById(rootId)];
                        if (!this.parentMap[rootId.value]) {
                            return list;
                        }
                        this.parentMap[rootId.value].forEach(ch => getChildren(ch).forEach(v => list.push(v)));
                        return list;
                    };
                    return getChildren(rootId);
                }
                findByMembers(members) {
                    console.log(members);
                    const map = {};
                    var list = this.findAll().filter(v => v.metaData.members.length > 0);
                    list.forEach(e => e.metaData.members.forEach(m => members.forEach(v => {
                        if (m == v) {
                            map[e.id.value] = e;
                        }
                    })));
                    return Object.keys(map).map(k => map[k]);
                }
                onUpdate() {
                    this.parentMap = {};
                    this.findAll().filter(v => v.parent).forEach(v => {
                        if (!this.parentMap[v.parent.value]) {
                            this.parentMap[v.parent.value] = [];
                        }
                        this.parentMap[v.parent.value].push(v.id);
                    });
                }
                update(entity, callback) {
                    if (!this.inMemoryObjectiveDataStore.isExist(entity.id)) {
                        callback(new Error('entity not found: ' + entity.id.value));
                        return;
                    }
                    this.dataStore.updateObjective(entity, (e) => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryObjectiveDataStore.update(entity);
                        this.onUpdate();
                        callback();
                    });
                }
                insert(entity, callback) {
                    if (this.inMemoryObjectiveDataStore.isExist(entity.id)) {
                        callback(new Error('entity already exists: ' + entity.id.value));
                        return;
                    }
                    this.dataStore.insertObjective(entity, (e) => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryObjectiveDataStore.insert(entity);
                        this.onUpdate();
                        callback();
                    });
                }
                remove(id, callback) {
                    if (this.parentMap[id.value]) {
                        callback(new Error('children already exists'));
                    }
                    if (!this.inMemoryObjectiveDataStore.isExist(id)) {
                        callback(new Error('entity not found: ' + id.value));
                        return;
                    }
                    this.dataStore.removeObjective(id, e => {
                        if (e) {
                            callback(e);
                            return;
                        }
                        this.inMemoryObjectiveDataStore.remove(id);
                        this.onUpdate();
                        callback();
                    });
                }
            };
            exports_16("ObjectiveRepositoryImpl", ObjectiveRepositoryImpl);
        }
    };
});
System.register("https://raw.githubusercontent.com/naosim/key-value-io/main/src/KeyValueIO", [], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/TextIO", [], function (exports_18, context_18) {
    "use strict";
    var PjfuTextIO, PjfuTextIOType;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
            PjfuTextIO = class PjfuTextIO {
                constructor(keyValueIo) {
                    this.keyValueIo = keyValueIo;
                }
                saveObjectives(raw, callback) {
                    this.keyValueIo.save(PjfuTextIOType.objectives, raw, callback);
                }
                saveActions(raw, callback) {
                    this.keyValueIo.save(PjfuTextIOType.actions, raw, callback);
                }
                loadObjectives(callback) {
                    this.keyValueIo.load(PjfuTextIOType.objectives, callback);
                }
                loadActions(callback) {
                    this.keyValueIo.load(PjfuTextIOType.actions, callback);
                }
            };
            exports_18("PjfuTextIO", PjfuTextIO);
            (function (PjfuTextIOType) {
                PjfuTextIOType["objectives"] = "objectives";
                PjfuTextIOType["actions"] = "actions";
            })(PjfuTextIOType || (PjfuTextIOType = {}));
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/DataStore", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/DataStoreUtils", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/domain", "file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Action", "file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective"], function (exports_20, context_20) {
    "use strict";
    var domain_ts_5, Action_ts_4, Objective_ts_4, DataStoreUtils;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (domain_ts_5_1) {
                domain_ts_5 = domain_ts_5_1;
            },
            function (Action_ts_4_1) {
                Action_ts_4 = Action_ts_4_1;
            },
            function (Objective_ts_4_1) {
                Objective_ts_4 = Objective_ts_4_1;
            }
        ],
        execute: function () {
            DataStoreUtils = class DataStoreUtils {
                static dataToMetaData(mataDataObj, now) {
                    return new domain_ts_5.MetaData(mataDataObj.description, mataDataObj.members || [], mataDataObj.links ? mataDataObj.links.map((v) => new domain_ts_5.Link(v.name, v.path)) : [], new domain_ts_5.Note(mataDataObj.note || ''), mataDataObj.tasks ? mataDataObj.tasks.map((v) => new domain_ts_5.Task(v.limitDate.dateString ? new domain_ts_5.TaskLimitDate(v.limitDate.raw, v.limitDate.dateString) : domain_ts_5.TaskLimitDate.create(v.limitDate, now), v.title, new domain_ts_5.TaskStatus(v.status || ''))) : []);
                }
                static dataToObjectiveEntity(v, now) {
                    return new Objective_ts_4.Objective.Entity(new Objective_ts_4.Objective.Id(v.id), v.title, DataStoreUtils.dataToMetaData(v.metaData, now), v.parent ? new Objective_ts_4.Objective.Id(v.parent) : undefined);
                }
                static dataToActionEntity(v, now) {
                    return new Action_ts_4.Action.Entity(new Action_ts_4.Action.Id(v.id), v.title, v.parents.map((v) => new Action_ts_4.Action.Id(v)), DataStoreUtils.dataToMetaData(v.metaData, now));
                }
            };
            exports_20("DataStoreUtils", DataStoreUtils);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/DataStoreServer", ["file:///Users/fujitanao/googledrive/script/pjfu/src/domain/Objective", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/DataStoreUtils"], function (exports_21, context_21) {
    "use strict";
    var Objective_ts_5, DataStoreUtils_ts_1, DataStoreServer;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (Objective_ts_5_1) {
                Objective_ts_5 = Objective_ts_5_1;
            },
            function (DataStoreUtils_ts_1_1) {
                DataStoreUtils_ts_1 = DataStoreUtils_ts_1_1;
            }
        ],
        execute: function () {
            DataStoreServer = class DataStoreServer {
                constructor(textIO) {
                    this.textIO = textIO;
                    this.callCount = 0;
                    this.list = [];
                    this.actions = [];
                }
                findAll(callback) {
                    this.findAllObjective((err, objectives) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        this.findAllAction((err, actions) => {
                            if (err) {
                                callback(err);
                                return;
                            }
                            setTimeout(() => callback(undefined, objectives, actions), 100);
                        });
                    });
                }
                findAllObjective(callback) {
                    if (this.callCount > 0) {
                        throw '2回目の呼出です';
                    }
                    this.textIO.loadObjectives((err, raw) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        if (!raw) {
                            raw = JSON.stringify([Objective_ts_5.Objective.Entity.root()].map(v => v.toObject()));
                            this.textIO.saveObjectives(raw, (err) => { });
                        }
                        console.log(raw);
                        var now = new Date();
                        this.list = JSON.parse(raw).map((v) => DataStoreUtils_ts_1.DataStoreUtils.dataToObjectiveEntity(v, now));
                        callback(undefined, this.list);
                    });
                }
                findAllAction(callback) {
                    if (this.callCount > 0) {
                        throw '2回目の呼出です';
                    }
                    this.textIO.loadActions((err, raw) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        if (!raw) {
                            raw = '[]';
                            this.textIO.saveActions(raw, (err) => { });
                        }
                        console.log(raw);
                        var now = new Date();
                        this.actions = JSON.parse(raw).map((v) => DataStoreUtils_ts_1.DataStoreUtils.dataToActionEntity(v, now));
                        callback(undefined, this.actions);
                    });
                }
                saveObjective(callback) {
                    const raw = JSON.stringify(this.list.map(v => v.toObject()));
                    console.log(raw);
                    this.textIO.saveObjectives(raw, callback);
                }
                saveAction(callback) {
                    const raw = JSON.stringify(this.actions.map(v => v.toObject()));
                    console.log(raw);
                    this.textIO.saveActions(raw, callback);
                }
                updateObjective(entity, callback) {
                    for (var i = 0; i < this.list.length; i++) {
                        if (this.list[i].id.value == entity.id.value) {
                            this.list[i] = entity;
                            this.saveObjective(callback);
                            return;
                        }
                    }
                    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100);
                }
                updateAction(entity, callback) {
                    for (var i = 0; i < this.actions.length; i++) {
                        if (this.actions[i].id.value == entity.id.value) {
                            this.actions[i] = entity;
                            this.saveAction(callback);
                            return;
                        }
                    }
                    setTimeout(() => callback(new Error(`entity not found: ${entity.id.value}`)), 100);
                }
                insertObjective(entity, callback) {
                    this.list.push(entity);
                    this.saveObjective(callback);
                }
                insertAction(entity, callback) {
                    this.actions.push(entity);
                    this.saveAction(callback);
                }
                removeObjective(id, callback) {
                    this.list = this.list.filter(v => !v.id.eq(id));
                    this.saveObjective(callback);
                }
                removeAction(id, callback) {
                    this.actions = this.actions.filter(v => !v.id.eq(id));
                    this.saveAction(callback);
                }
            };
            exports_21("DataStoreServer", DataStoreServer);
        }
    };
});
System.register("https://raw.githubusercontent.com/naosim/key-value-io/main/src/LocalStrageKeyValueIO", [], function (exports_22, context_22) {
    "use strict";
    var LocalStrageKeyValueIO;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [],
        execute: function () {
            LocalStrageKeyValueIO = class LocalStrageKeyValueIO {
                constructor(keyMap) {
                    this.keyMap = keyMap;
                }
                save(key, value, callback) {
                    window.localStorage.setItem(this.keyMap ? this.keyMap[key] : key, value);
                    setTimeout(() => callback(undefined), 100);
                }
                load(key, callback) {
                    const value = window.localStorage.getItem(this.keyMap ? this.keyMap[key] : key);
                    setTimeout(() => callback(undefined, value), 100);
                }
            };
            exports_22("LocalStrageKeyValueIO", LocalStrageKeyValueIO);
        }
    };
});
System.register("https://raw.githubusercontent.com/naosim/key-value-io/main/src/GithubKeyValueIO", [], function (exports_23, context_23) {
    "use strict";
    var GithubKeyValueIO, IssueNumber, IssueRepositoryImpl;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [],
        execute: function () {
            GithubKeyValueIO = class GithubKeyValueIO {
                constructor(keyMap, githubToken, owner, repo, GitHub) {
                    this.keyMap = keyMap;
                    this.issueRepository = new IssueRepositoryImpl(githubToken, owner, repo, GitHub);
                }
                save(key, value, callback) {
                    this.issueRepository.updateBody(this.keyMap[key], value, callback);
                }
                load(key, callback) {
                    this.issueRepository.getIssue(this.keyMap[key], (err, issue) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(undefined, issue.body);
                    });
                }
            };
            exports_23("GithubKeyValueIO", GithubKeyValueIO);
            IssueNumber = class IssueNumber {
                constructor(value) {
                    this.value = value;
                }
            };
            exports_23("IssueNumber", IssueNumber);
            IssueRepositoryImpl = class IssueRepositoryImpl {
                constructor(githubToken, owner, repo, GitHub) {
                    this.gh = new GitHub({ token: githubToken });
                    this.issues = this.gh.getIssues(owner, repo);
                }
                getIssue(issueNumber, callback) {
                    this.issues.getIssue(issueNumber.value, callback);
                }
                updateTitle(issueNumber, title, callback) {
                    this.issues.editIssue(issueNumber.value, { title: title }, callback);
                }
                updateBody(issueNumber, body, callback) {
                    this.issues.editIssue(issueNumber.value, { body: body }, callback);
                }
                createIssue(issue, callback) {
                    this.issues.createIssue(issue, callback);
                }
            };
            exports_23("IssueRepositoryImpl", IssueRepositoryImpl);
        }
    };
});
System.register("https://raw.githubusercontent.com/naosim/key-value-io/main/src/GasKeyValueIO", [], function (exports_24, context_24) {
    "use strict";
    var GasKeyValueIO;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [],
        execute: function () {
            GasKeyValueIO = class GasKeyValueIO {
                save(key, value, callback) {
                    window.google.script.run.withSuccessHandler((value) => callback()).withFailureHandler((e) => callback(e)).saveGasKeyValue(key, value);
                }
                load(key, callback) {
                    window.google.script.run.withSuccessHandler((value) => callback(undefined, value)).withFailureHandler((e) => callback(e)).loadGasKeyValue(key);
                }
            };
            exports_24("GasKeyValueIO", GasKeyValueIO);
        }
    };
});
System.register("file:///Users/fujitanao/googledrive/script/pjfu/src/pjfu", ["file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/PjfuVue", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/MermaidTreeView", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/ActionRepositoryImpl", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/ObjectiveRepositoryImpl", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/view/AnyId", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/TextIO", "file:///Users/fujitanao/googledrive/script/pjfu/src/infra/datastore/DataStoreServer", "https://raw.githubusercontent.com/naosim/key-value-io/main/src/LocalStrageKeyValueIO", "https://raw.githubusercontent.com/naosim/key-value-io/main/src/GithubKeyValueIO", "https://raw.githubusercontent.com/naosim/key-value-io/main/src/GasKeyValueIO", "file:///Users/fujitanao/googledrive/script/pjfu/src/service/service"], function (exports_25, context_25) {
    "use strict";
    var PjfuVue_ts_1, MermaidTreeView_ts_1, ActionRepositoryImpl_ts_1, ObjectiveRepositoryImpl_ts_1, AnyId_ts_5, TextIO_ts_1, DataStoreServer_ts_1, LocalStrageKeyValueIO_ts_1, GithubKeyValueIO_ts_1, GasKeyValueIO_ts_1, service_ts_1, keyValueIo;
    var __moduleName = context_25 && context_25.id;
    function pjfu(keyValueIo) {
        const dataStore = new DataStoreServer_ts_1.DataStoreServer(new TextIO_ts_1.PjfuTextIO(keyValueIo));
        dataStore.findAll((err, objectives, actions) => {
            if (err) {
                console.error(err);
                window.alert(err.message);
                return;
            }
            const objectiveRepository = new ObjectiveRepositoryImpl_ts_1.ObjectiveRepositoryImpl(dataStore, objectives);
            const actionRepository = new ActionRepositoryImpl_ts_1.ActionRepositoryImpl(dataStore, actions);
            const pjfuVue = new PjfuVue_ts_1.PjfuVue(objectiveRepository, actionRepository, new MermaidTreeView_ts_1.MermaidTreeView(objectiveRepository, actionRepository, window['mermaid']), new service_ts_1.TaskService(objectiveRepository, actionRepository), window['Vue']);
            const updateFormByHash = () => pjfuVue.applyTargetId(new AnyId_ts_5.AnyId(window.location.hash.slice(1)));
            window.addEventListener('hashchange', updateFormByHash);
            if (location.hash) {
                updateFormByHash();
            }
            window['mermaidCallback'] = (id) => { pjfuVue.applyTargetId(new AnyId_ts_5.AnyId(id)); };
        });
    }
    exports_25("pjfu", pjfu);
    return {
        setters: [
            function (PjfuVue_ts_1_1) {
                PjfuVue_ts_1 = PjfuVue_ts_1_1;
            },
            function (MermaidTreeView_ts_1_1) {
                MermaidTreeView_ts_1 = MermaidTreeView_ts_1_1;
            },
            function (ActionRepositoryImpl_ts_1_1) {
                ActionRepositoryImpl_ts_1 = ActionRepositoryImpl_ts_1_1;
            },
            function (ObjectiveRepositoryImpl_ts_1_1) {
                ObjectiveRepositoryImpl_ts_1 = ObjectiveRepositoryImpl_ts_1_1;
            },
            function (AnyId_ts_5_1) {
                AnyId_ts_5 = AnyId_ts_5_1;
            },
            function (TextIO_ts_1_1) {
                TextIO_ts_1 = TextIO_ts_1_1;
            },
            function (DataStoreServer_ts_1_1) {
                DataStoreServer_ts_1 = DataStoreServer_ts_1_1;
            },
            function (LocalStrageKeyValueIO_ts_1_1) {
                LocalStrageKeyValueIO_ts_1 = LocalStrageKeyValueIO_ts_1_1;
            },
            function (GithubKeyValueIO_ts_1_1) {
                GithubKeyValueIO_ts_1 = GithubKeyValueIO_ts_1_1;
            },
            function (GasKeyValueIO_ts_1_1) {
                GasKeyValueIO_ts_1 = GasKeyValueIO_ts_1_1;
            },
            function (service_ts_1_1) {
                service_ts_1 = service_ts_1_1;
            }
        ],
        execute: function () {
            window['LocalStrageKeyValueIO'] = LocalStrageKeyValueIO_ts_1.LocalStrageKeyValueIO;
            window['GithubKeyValueIO'] = GithubKeyValueIO_ts_1.GithubKeyValueIO;
            window['IssueNumber'] = GithubKeyValueIO_ts_1.IssueNumber;
            window['pjfu'] = pjfu;
            keyValueIo = window.google ? new GasKeyValueIO_ts_1.GasKeyValueIO() : new LocalStrageKeyValueIO_ts_1.LocalStrageKeyValueIO();
            pjfu(keyValueIo);
        }
    };
});

const __exp = __instantiate("file:///Users/fujitanao/googledrive/script/pjfu/src/pjfu", false);
export const pjfu = __exp["pjfu"];
