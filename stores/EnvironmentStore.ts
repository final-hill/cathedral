import { Environment } from '~/domain/Environment'
import { PegsStore } from './PegsStore'

export const EnvironmentStore = PegsStore('environments', Environment)