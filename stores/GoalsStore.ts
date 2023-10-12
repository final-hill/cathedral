import { Goals } from '~/domain/Goals'
import { BaseStore } from './BaseStore'

export const GoalsStore = BaseStore('goals', Goals)