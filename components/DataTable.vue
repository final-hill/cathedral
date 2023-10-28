<script lang="ts" setup>
import type { Entity } from '~/domain/Entity';
import type { Uuid } from '~/domain/types/Guid';
import { Repository } from '~/usecases/Repository';

const props = defineProps({
    repository: {
        required: true,
        type: Object as PropType<Repository<any>>,
        validator: (value: Repository<any>) => {
            return value instanceof Repository;
        }
    },
    colNames: {
        type: Array,
        validator: (colNames: string[]) => {
            return colNames.every(name => typeof name == 'string')
        }
    },
    enableCreate: {
        type: Boolean,
        default: false
    },
    enableUpdate: {
        type: Boolean,
        default: false
    },
    enableDelete: {
        type: Boolean,
        default: false
    }
})

const repo = props.repository,
    EntityConstructor = repo.EntityConstructor,
    items = ref(await repo.getAll()) as Ref<Entity[]>,
    colNames = (props.colNames ?? Object.keys(items.value[0])) as string[]

const createItem = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        item = new EntityConstructor({
            id: self.crypto.randomUUID(),
            ...Object.fromEntries(formData.entries())
        });
    items.value.push(item);
    repo.add(item);
    form.reset();
}

const deleteItem = (id: Uuid) => {
    const index = items.value.findIndex(b => b.id === id);
    items.value.splice(index, 1);
    repo.delete(id)
}

const editRow = (tr: HTMLTableRowElement) => {
    const viewItems = tr.querySelectorAll<HTMLElement>('.view-data'),
        editItems = tr.querySelectorAll<HTMLElement>('.edit-data');
    viewItems.forEach(item => item.style.display = 'none');
    editItems.forEach(item => item.style.display = 'initial');
}

const cancelEdit = (tr: HTMLTableRowElement) => {
    const viewItems = tr.querySelectorAll<HTMLElement>('.view-data'),
        editItems = tr.querySelectorAll<HTMLElement>('.edit-data');
    viewItems.forEach(item => item.style.display = 'initial');
    editItems.forEach(item => item.style.display = 'none');
}

const updateItem = (item: Entity, tr: HTMLTableRowElement) => {
    const inputData = tr.querySelectorAll<HTMLInputElement>('input'),
        updatedItem = new EntityConstructor({
            ...item,
            ...Object.fromEntries(Array.from(inputData).map(input => [input.name, input.value]))
        });
    repo.update(updatedItem);
    const index = items.value.findIndex(b => b.id === item.id);
    items.value.splice(index, 1, updatedItem);
    cancelEdit(tr);
}

</script>

<template>
    <form v-if="enableCreate" id="new-item" @submit="createItem" autocomplete="off"></form>
    <table v-if="items.length > 0">
        <thead>
            <tr>
                <th v-for="colName in colNames" :key="colName">
                    {{ colName }}
                </th>
                <th v-if="enableUpdate"></th>
                <th v-if="enableDelete"></th>
            </tr>
        </thead>
        <tbody v-if="enableCreate">
            <tr>
                <td v-for="colName in colNames" :key="colName">
                    <input type="text" name="name" required form="new-item" />
                </td>
                <td>
                    <button form="new-item" class="add-item">Add</button>
                </td>
            </tr>
        </tbody>
        <tbody>
            <tr v-for="item in items" :key="item.id">
                <td v-for="colName in colNames" :key="colName">
                    <span class="view-data">
                        {{ (item as any)[colName] }}
                    </span>
                    <input type="text" class="edit-data" :name="colName" :value="(item as any)[colName]">
                </td>
                <td v-if="enableUpdate">
                    <button class="view-data" @click="editRow(($event.target as any).closest('tr')!)">
                        Edit
                    </button>
                    <button class="edit-data" @click="updateItem(item, ($event.target as any).closest('tr')!)">
                        Save
                    </button>
                    <button class="edit-data" @click="cancelEdit(($event.target as any).closest('tr')!)">
                        Cancel
                    </button>
                </td>
                <td v-if="enableDelete">
                    <button @click="deleteItem(item.id)">
                        Delete
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <span v-else>No items</span>
</template>

<style scoped>
.view-data {
    display: initial;
}

.edit-data {
    display: none;
}
</style>