import { Action } from "../domain/Action.ts";
import { Task, TaskLimitDate, TaskStatus } from "../domain/domain.ts";
import { Objective } from "../domain/Objective.ts";
import { AnyId } from "../infra/view/AnyId.ts";

/**
 * タスクの集約。タスクと上位の目標・施策を合わせたもの
 */
export class ActionTask {
  limitTimestamp: number;
  isDone: boolean;
  isIn2Weeks: boolean;// 過去2週間から未来2週間
  taskTitle: string;
  limitDate: TaskLimitDate;
  status: TaskStatus
  constructor(
    readonly id: AnyId,
    readonly title: string,
    readonly members: string[],
    task: Task,
    now: Date
  ) {
    this.taskTitle = task.title
    this.limitDate = task.limitDate
    this.limitTimestamp = task.limitDate.time
    this.status = task.status
    this.isDone = task.status.isDone();
    this.isIn2Weeks = task.limitDate.isIn2Weeks(now);
  }
}

export class TaskService {
  constructor(
    private objectiveRepository: Objective.ReadRepository, 
    private actionRepository: Action.ReadRepository
  ) {}

  /**
   * 全ての施策タスク取得。期限日昇順
   */
  findAllActionTask(): ActionTask[] {
    const tasks:ActionTask[] = []
    const now = new Date();
    this.actionRepository.findAll().forEach(v => v.metaData.tasks.forEach(t => tasks.push(new ActionTask(AnyId.create(v.id), v.title, v.metaData.members, t, now))))
    return tasks.sort((a, b) => a.limitTimestamp - b.limitTimestamp);
  }
}