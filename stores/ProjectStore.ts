import { Project } from '~/domain/Project'
import { BaseStore } from './BaseStore'

export const ProjectStore = BaseStore('projects', Project)