import { type Tree } from '~/domain/index.mjs';

const treeFind = <T extends Tree>(id: T['id'], item: T): T | undefined =>
    item.id === id ? item : (item.children as T[]).flatMap(child => treeFind(id, child))[0];

export default treeFind;