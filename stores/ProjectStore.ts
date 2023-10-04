import { defineStore } from 'pinia'
import { Project } from '~/domain/Project'

function serialize(projects: Project[]): string {
    return JSON.stringify(
        projects.map(({ id, name, description }) => ({ id, name, description }))
    )
}

function deserialize(value: string): Project[] {
    return JSON.parse(value)
        .map((item: { id: string, name: string, description: string }) =>
            new Project({
                id: item.id,
                name: item.name,
                description: item.description
            }))
}

function loadProjects(): Project[] {
    const projects = localStorage.getItem('projects') ?? '[]'
    return deserialize(projects)
}

export const ProjectStore = defineStore('project', {
    state: () => ({
        items: loadProjects()
    }),
    getters: {
        projects(state): Project[] {
            return state.items as Project[]
        }
    },
    actions: {
        addProject(project: Project): void {
            if (this.hasProject(project.id))
                throw new Error(`A project with the id '${project.id}' already exists.`)
            this.items.push(project)

            localStorage.setItem('projects', serialize(this.items as Project[]))
        },
        hasProject(id: string): boolean {
            return this.items.some(project => project.id === id)
        },
        removeProject(id: string): void {
            if (!this.hasProject(id))
                throw new Error(`A project with the id '${id}' does not exist.`)
            const index = this.items.findIndex(project => project.id === id)
            this.items.splice(index, 1)

            localStorage.setItem('projects', serialize(this.items as Project[]))
        }
    }
})