import { defineStore } from 'pinia'
import { stringify, parse } from 'zipson'
import { Entity } from '~/domain/Entity'

export type Constructor<T> = new (...args: any[]) => T

export const BaseStore = <E extends Entity<any>>(storeId: string, Entity: Constructor<E>) => {
    const serialize = (items: E[]) => stringify(
        items.map(item => item.toJSON())
    )

    const deserialize = (value: string | null): E[] =>
        !value ? [] : parse(value).map((item: E) => new Entity(item))

    const loadItems = () => deserialize(localStorage.getItem(storeId))

    return defineStore(storeId, {
        state: () => ({
            items: loadItems()
        }),
        getters: {
            getById(state): (id: string) => E | undefined {
                return (id: string) => state.items.find(item => item.id === id) as E
            },
            projects(state): E[] {
                return state.items as E[]
            }
        },
        actions: {
            add(item: E): void {
                if (this.has(item.id))
                    throw new Error(`An item with the id '${item.id}' already exists.`)
                this.items.push(item as any)
                localStorage.setItem(storeId, serialize(this.items as E[]))
            },
            has(id: string): boolean {
                return this.items.some(item => item.id === id)
            },
            remove(id: string): void {
                if (!this.has(id))
                    throw new Error(`An item with the id '${id}' does not exist.`)
                const index = this.items.findIndex(item => item.id === id)
                this.items.splice(index, 1)

                localStorage.setItem(storeId, serialize(this.items as E[]))
            }
        }
    })
}