import { Action } from "../../domain/Action.ts";
import { Objective } from "../../domain/Objective.ts";
import { ActionDataStore } from './ActionDataStore.ts';
import { ObjectiveDataStore } from './ObjectiveDataStore.ts';

export interface DataStore extends ObjectiveDataStore, ActionDataStore {
  findAll(callback: (err?: Error, objectives?: Objective.Entity[], actions?: Action.Entity[]) => void): void
}
