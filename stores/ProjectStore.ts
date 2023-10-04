import { defineStore } from 'pinia'
import { Project } from '~/domain/Project'

export const ProjectStore = defineStore('project', {
    state: () => ({
        items: [] as Project[]
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
        },
        hasProject(id: string): boolean {
            return this.items.some(project => project.id === id)
        },
        removeProject(id: string): void {
            if (!this.hasProject(id))
                throw new Error(`A project with the id '${id}' does not exist.`)
            const index = this.items.findIndex(project => project.id === id)
            this.items.splice(index, 1)
        }
    },
    persist: {
        // @ts-ignore: auto import not working and explicit import breaks the entire config
        storage: persistedState.localStorage,
        serializer: {
            serialize: (value: Project[]) => JSON.stringify(
                value.map(({ id, name, description }) => ({ id, name, description }))
            ),
            deserialize: (value: string) => JSON.parse(value)
                .map((item: { id: string, name: string, description: string }) =>
                    new Project({
                        id: item.id,
                        name: item.name,
                        description: item.description
                    }))
        }
    }
})