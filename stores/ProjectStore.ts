import { Project } from '~/domain/Project'
import { PegsStore } from './PegsStore'

export const ProjectStore = PegsStore('projects', Project)