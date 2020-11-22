import {
  Link,
  MetaData,
  Note,
  Task,
  TaskLimitDate,
  TaskStatus
} from '../../domain/domain.ts';
import { Action } from "../../domain/Action.ts";
import { Objective } from "../../domain/Objective.ts";



export class DataStoreUtils {

  private static dataToMetaData(mataDataObj: any, now: Date): MetaData {
    
    return new MetaData(
      mataDataObj.description,
      mataDataObj.members || [],
      mataDataObj.links ? mataDataObj.links.map((v:any) => new Link(v.name, v.path)) : [],
      new Note(mataDataObj.note || ''),
      mataDataObj.tasks ? mataDataObj.tasks.map((v:any) => new Task(v.limitDate.dateString ? new TaskLimitDate(v.limitDate.raw, v.limitDate.dateString) : TaskLimitDate.create(v.limitDate, now), v.title, new TaskStatus(v.status || ''))) : []
    )
  }

  static dataToObjectiveEntity(v: any, now: Date): Objective.Entity {
    // console.log(DataStoreUtils.dataToMetaData(v.metaData));
    return new Objective.Entity(
      new Objective.Id(v.id),
      v.title,
      DataStoreUtils.dataToMetaData(v.metaData, now),
      v.parent ? new Objective.Id(v.parent) : undefined
    );
  }

  static dataToActionEntity(v: any, now: Date): Action.Entity {
    return new Action.Entity(
      new Action.Id(v.id),
      v.title,
      v.parents.map((v:string) => new Action.Id(v)),
      DataStoreUtils.dataToMetaData(v.metaData, now)
    );
  }
}
