import {
  Objective,
  Action
} from '../domain/domain';


export interface DataStore {
  findAllObjective(): Objective.Entity[];
  findAllAction(): Action.Entity[];

  updateObjective(entity: Objective.Entity, callback: (err) => void);
  updateAction(entity: Action.Entity, callback: (err) => void);

  insertObjective(entity: Objective.Entity, callback: (err: Error) => void);
  insertAction(entity: Action.Entity, callback: (err: Error) => void);

  isExistObjective(id: Objective.Id, callback: (err: Error, value: boolean) => void);
  isExistAction(id: Action.Id, callback: (err: Error, value: boolean) => void);

  removeObjective(id: Objective.Id, callback: (err: Error) => void);
  removeAction(id: Action.Id, callback: (err: Error) => void);
}
