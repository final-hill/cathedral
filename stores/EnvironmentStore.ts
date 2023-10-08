import { Environment } from '~/domain/Environment'
import { BaseStore } from './BaseStore'

export const EnvironmentStore = BaseStore('environments', Environment)