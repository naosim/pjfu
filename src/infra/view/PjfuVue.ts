import { MetaData, Task, TaskLimitDate, TaskStatus } from '../../domain/domain';
import { Action } from "../../domain/Action";
import { Objective } from "../../domain/Objective";
import { MetaDataForm } from './MetaDataConverter';
import { AnyId } from './AnyId';
import { MermaidTreeView } from './MermaidTreeView';

export class ParentsForm {
  value = '';
  set(parents: Objective.Id[]) {
    this.value = parents.map(v => v.value).join(', ');
  }
  get(): Objective.Id[] {
    return this.value.split(',').map(v => new Objective.Id(v.trim()));
  }
}

export class PjfuVue { 
  private app: any;
  private data: {
    message: string,
    treeTargetId: string;
    editTargetId: string;
    editForm: {
      id: string;
      title: string;
      parents: ParentsForm;
      detail: MetaDataForm;
      links: { name: string; path: string; }[];
    };
    tasks: TaskView[]
  } = {
      message: 'hoge',
      treeTargetId: '',
      editTargetId: '',
      editForm: {
        id: '',
        title: '',
        parents: new ParentsForm(),
        detail: new MetaDataForm(),
        links: [{ name: '', path: '' }]
      },
      tasks: [TaskView.empty(new Date())]
    };
  constructor(
    private objectiveRepository: Objective.Repository,
    private actionRepository: Action.Repository,
    private mermaidTreeView: MermaidTreeView,
    Vue: any
  ) {

    this.init(Vue);
  }
  init(Vue: any) {
    try {
    this.app = new Vue({
      el: '#app',
      data: this.data,
      methods: {
        onClickApplyRootIdButton: () => this.applyTreeId(),
        onClickUpdateButton: () => this.update(),
        onClickSubButton: () => this.createSub(),
        onClickInsertObjectiveButton: () => this.insertObjective(),
        onClickInsertActionButton: () => this.insertAction(),
        onClickRemoveButton: () => this.remove()
      }
    });
    this.updateTaskList();
    } catch(e) {
      console.error(e);
    }
  }

  applyTreeId() {
    console.log('click', this.data.treeTargetId);
  }
  applyTargetId(id: AnyId) {
    console.log(id);
    id.forEach<void>(
      id => {
        const objective = this.objectiveRepository.findById(id);
        this.data.editTargetId = objective.id.value;
        this.data.editForm.id = objective.id.value;
        this.data.editForm.title = objective.title;
        this.data.editForm.parents.set(objective.isNotRoot ? [objective.parent] : [])
        this.data.editForm.detail.set(objective.metaData)
        this.data.editForm.links = objective.metaData.links.map(v => ({name: v.name, path: v.path}))
      },
      id => {
        const action = this.actionRepository.findById(id);
        this.data.editTargetId = action.id.value;
        this.data.editForm.id = action.id.value;
        this.data.editForm.title = action.title;
        this.data.editForm.parents.set(action.parents);
        this.data.editForm.detail.set(action.metaData);
        this.data.editForm.links = action.metaData.links.map(v => ({name: v.name, path: v.path}))
      }
    )
    this.mermaidTreeView.update(id);
  }
  update() {
    console.log('update');
    const callbackOnSaved = (e) => {
      if(e) {
        console.error(e);
        alert('エラー: ' + e.message);
        return;
      }
      this.onUpdate();
    }

    const anyId = new AnyId(this.data.editForm.id);
    if(anyId.isEmpty()) {
      throw new Error('IDが空');
    }
    anyId.forEach(
      id => {
        const newEntity = new Objective.Entity(
          id,
          this.data.editForm.title,
          this.data.editForm.parents.get()[0],
          this.data.editForm.detail.get()
        )
        this.objectiveRepository.update(newEntity, callbackOnSaved);
      },
      id => {
        const newEntity = new Action.Entity(
          id,
          this.data.editForm.title,
          this.data.editForm.parents.get(),
          this.data.editForm.detail.get()
        )
        this.actionRepository.update(newEntity, callbackOnSaved);
      }
    )
  }

  createSub() {
    this.data.editForm.parents.set([new Objective.Id(this.data.editForm.id)])
    this.data.editForm.id = '';
    this.data.editForm.title = ''
    this.data.editForm.detail.set(MetaData.empty());
  }

  insertObjective() {
    this.objectiveRepository.createId((err, id) => {
      const newEntity = new Objective.Entity(
        id,
        this.data.editForm.title,
        this.data.editForm.parents.get()[0],
        this.data.editForm.detail.get()
      )
      this.objectiveRepository.insert(newEntity, (e) => {
        console.log('callback');
        if(e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }
        this.onUpdate();
      });
    })
  }

  insertAction() {
    this.actionRepository.createId((err, id) => {
      const newEntity = new Action.Entity(
        id,
        this.data.editForm.title,
        this.data.editForm.parents.get(),
        this.data.editForm.detail.get()
      )
      this.actionRepository.insert(newEntity, (e) => {
        console.log('callback');
        if(e) {
          console.error(e);
          alert('エラー: ' + e.message);
          return;
        }
        this.onUpdate();
      });
    })
  }

  remove() {
    const anyId = new AnyId(this.data.editForm.id);
    anyId.forEach(
      id => {
        if(this.actionRepository.hasChildren(id)) {
          alert('子要素を消してください');
          throw new Error('子要素を消してください');
        }
        this.objectiveRepository.remove(
          id,
          (e) => {
            if(e) {
              alert(e.message);
              throw e;
            }
            this.onUpdate();
            // onTreeUpdate();
          }
        )
      },
      id => {
        this.actionRepository.remove(
          id,
          (e) => {
            if(e) {
              alert(e.message);
              throw e;
            }
            this.onUpdate();
          }
        )
      }
    )
  }

  onUpdate() {
    this.mermaidTreeView.update();
    this.updateTaskList();
    
  }
  updateTaskList() {
    const tasks:TaskView[] = []
    const now = new Date();
    this.objectiveRepository.findAll().forEach(v => v.metaData.tasks.forEach(t => tasks.push(new TaskView(AnyId.create(v.id), v.title, t, now))))
    this.actionRepository.findAll().forEach(v => v.metaData.tasks.forEach(t => tasks.push(new TaskView(AnyId.create(v.id), v.title, t, now))))
    this.data.tasks = tasks.sort((a, b) => a.limitTimestamp - b.limitTimestamp);
    console.log(tasks);
  }
}


export class TaskView {
  link: string;
  text: string;
  limitTimestamp: number;
  isDone: boolean;
  isIn2Weeks: boolean;// 過去2週間から未来2週間
  constructor(
    id: AnyId,
    title: string,
    task: Task,
    now: Date
  ) {
    this.link = `#${id.getValue()}`
    this.text = `${task.limitDate.raw} ${title} ${task.title}` + (task.status.isNotEmpty() ? ` [${task.status.raw}]` : '')
    this.limitTimestamp = task.limitDate.getDate(now).getTime()
    this.isDone = task.status.isDone();
    this.isIn2Weeks = task.limitDate.isIn2Weeks(now);
  }
  static empty(now: Date): TaskView {
    return new TaskView(new AnyId(''), '', new Task(new TaskLimitDate(''), '', new TaskStatus('')), now)
  }
}