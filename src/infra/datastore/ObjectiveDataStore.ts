import { Objective } from "../../domain/Objective.ts";

export interface ObjectiveDataStore {
  // findAllObjective(callback: (err: Error, entities: Objective.Entity[]) => void): void;
  updateObjective(entity: Objective.Entity, callback: (err?: Error) => void): void;
  insertObjective(entity: Objective.Entity, callback: (err?: Error) => void): void;
  removeObjective(id: Objective.Id, callback: (err?: Error) => void): void;
}
