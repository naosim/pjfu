
import { DataStoreLocalStorage } from "./infra/datastore/DataStoreLocalStorage";
import { main } from './main';

// グローバルから使える
window['DataStoreLocalStorage'] = DataStoreLocalStorage
window['main'] = main