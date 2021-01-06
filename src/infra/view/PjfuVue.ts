import { Task, TaskLimitDate, TaskStatus } from '../../domain/domain.ts';
import { Action } from "../../domain/Action.ts";
import { Objective } from "../../domain/Objective.ts";
import { AnyId } from './AnyId.ts';
import { MermaidTreeView } from './MermaidTreeView.ts';
import { ViewModeModel, ModeType } from './ViewModeModel.ts';
import { EditForm } from './EditForm.ts';
import { PjfuTask, TaskService } from "../../service/service.ts";
declare global {
  interface Window {
    alert: (message?: any) => void;
    confirm: (message?: any) => boolean;
    innerWidth: any;
  }
}

export class PjfuVue { 
  private app: any;
  private data: {
    viewMode: ViewModeModel
    editTargetId: string;
    editForm: EditForm;
    tasks: TaskView[];
    windowWidth: number;
  } = {
      viewMode: {
        modeType: ModeType.targetTree,
        treeTargetId: 'O0',
        selectedMembers: [],
        members: []
      },
      editTargetId: '',
      editForm: new EditForm(),
      tasks: [TaskView.empty()],
      windowWidth: window.innerWidth
    };
  constructor(
    private objectiveRepository: Objective.Repository,
    private actionRepository: Action.Repository,
    private mermaidTreeView: MermaidTreeView,
    private taskService: TaskService,
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
          onClickUpdateButton: () => this.update(),
          onClickTreeUpdateButton: () => this.onUpdate(),
          onClickApplyTreeCenteredFromSelected: () => this.applyTreeCenteredFromSelected(),
          onClickSubButton: () => this.createSub(),
          onClickInsertObjectiveButton: () => this.insertObjective(),
          onClickInsertActionButton: () => this.insertAction(),
          onClickRemoveButton: () => this.remove(),
          onClickTaskLinkButton: (id: AnyId) => this.applyTargetId(id)
        }
      });
      this.onUpdate();
      this.data.viewMode.selectedMembers = this.data.viewMode.members;// すべてをチェックする
      window.addEventListener('resize', () => this.handleResize())
    } catch(e) {
      console.error(e);
    }
  }
  handleResize() {
    this.data.windowWidth = window.innerWidth;
  }
  applyTreeCenteredFromSelected() {
    this.data.viewMode.modeType = ModeType.targetTree;
    this.data.viewMode.treeTargetId = this.data.editTargetId;
    this.mermaidTreeView.update(this.data.viewMode);
  }
  applyTargetId(id: AnyId) {
    console.log(id);
    id.forEach<void>(
      id => {
        const objective = this.objectiveRepository.findById(id);
        this.data.editTargetId = objective.id.value;
        this.data.editForm.setObjectiveEntity(objective);
      },
      id => {
        const action = this.actionRepository.findById(id);
        this.data.editTargetId = action.id.value;
        this.data.editForm.setActionEntity(action);
      }
    )
    this.mermaidTreeView.update(this.data.viewMode, id);
  }
  /**
   * 目標または施策を更新する
   */
  update() {
    this.data.editForm.toEntity(
      o => this.objectiveRepository.update(o, AlertCallBack.callbackVoid(() => this.onUpdate())), 
      a => this.actionRepository.update(a, AlertCallBack.callbackVoid(() => this.onUpdate()))
    );
  }

  createSub() {
    this.data.editForm.setSub()
  }

  /**
   * 目標を挿入（新規作成）する
   */
  insertObjective() {
    this.objectiveRepository.createId((err?, id?) => {
      if(err) {
        console.error(err);
        window.alert('エラー: ' + err.message);
        return;
      }
      this.objectiveRepository.insert(
        this.data.editForm.createObjectiveEntity(id!), 
        AlertCallBack.callbackVoid(() => this.onUpdate())
      );
    })
  }

  /**
   * 施策を挿入（新規作成）する
   */
  insertAction() {
    this.actionRepository.createId(
      AlertCallBack.callback(id => {
        this.actionRepository.insert(
          this.data.editForm.createActionEntity(id!), 
          AlertCallBack.callbackVoid(() => this.onUpdate())
        )
      })
    )
  }

  /**
   * 目標または施策を削除する
   */
  remove() {
    if(!window.confirm('削除してよろしいですか？')) {
      return;
    }
    this.data.editForm.forEachId(
      id => {
        if(this.actionRepository.hasChildren(id)) {
          window.alert('子要素を消してください');
          throw new Error('子要素を消してください');
        }
        this.objectiveRepository.remove(
          id,
          AlertCallBack.callbackVoid(() => this.onUpdate())
        )
      },
      id => {
        this.actionRepository.remove(
          id,
          AlertCallBack.callbackVoid(() => this.onUpdate())
        )
      }
    )
  }

  onUpdate() {
    // TODO: ここで表示モードの選択リストをいじる
    this.updateViewModeMembers();
    this.mermaidTreeView.update(this.data.viewMode);
    this.updateTaskList();
  }
  updateViewModeMembers() {
    var memberMap:{[key:string]: any} = {};
    this.objectiveRepository.findAll().forEach(v => v.metaData.members.forEach(m => memberMap[m] = true));
    this.actionRepository.findAll().forEach(v => v.metaData.members.forEach(m => memberMap[m] = true));
    this.data.viewMode.members = Object.keys(memberMap);
  }
  updateTaskList() {
    this.data.tasks = this.taskService.findAllPjfuTask().map(v => TaskView.create(v))
    console.log(this.data.tasks);
  }
}


export class TaskView {
  text: string;
  constructor(
    readonly id: AnyId,
    title: string,
    taskTitle: string,
    limitDate: TaskLimitDate,
    public limitTimestamp: number,
    status: TaskStatus,
    public isDone: boolean,
    public isIn2Weeks: boolean// 過去2週間から未来2週間

  ) {
    this.text = `${limitDate.raw} 【${title}】${taskTitle}` + (status.isNotEmpty() ? ` [${status.raw}]` : '')
  }
  static empty(): TaskView {
    var d = TaskLimitDate.unlimited()
    return new TaskView(
      new AnyId(''), 
      '', 
      '',
      d,
      d.time,
      new TaskStatus(''),
      false,
      false
    )
  }
  static create(task: PjfuTask): TaskView {
    return new TaskView(
      task.id, 
      task.title, 
      task.taskTitle, 
      task.limitDate, 
      task.limitTimestamp, 
      task.status, 
      task.isDone, 
      task.isIn2Weeks
    )
  }
}

class AlertCallBack {
  static callback<T>(cb:(t:T)=>void):(err?:Error, t?:T)=>void {
    return (err?:Error, t?:T)=> {
      if(err) {
        console.error(err);
        window.alert('エラー: ' + err.message);
        return;
      }
      cb(t!);
    }
  }
  static callbackVoid<T>(cb:()=>void):(err?:Error)=>void {
    return (err?:Error)=> {
      if(err) {
        console.error(err);
        window.alert('エラー: ' + err.message);
        return;
      }
      cb();
    }
  }
}