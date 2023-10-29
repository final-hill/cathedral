<script lang="ts" setup>
interface Column {
    dataField: string
    headerText: string
    required?: boolean
}

const props = defineProps({
    dataSource: {
        type: Array,
        required: true
    },
    columns: {
        type: Array as PropType<Column[]>
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

const emit = defineEmits<{
    (e: 'create', item: any): void
    (e: 'delete', index: number): void
    (e: 'update', { index, updatedItem }: { index: number, updatedItem: any }): void
}>()

const items = props.dataSource

const createItem = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        item = Object.fromEntries(formData.entries())
    emit('create', item)
    form.reset();
}

const deleteItem = (tr: HTMLTableRowElement) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const tbody = tr.closest('tbody')!,
        index = Array.prototype.indexOf.call(tbody.children, tr);
    emit('delete', index)
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

const updateItem = (tr: HTMLTableRowElement) => {
    const inputData = tr.querySelectorAll<HTMLInputElement>('input'),
        updatedItem =
            Object.fromEntries(Array.from(inputData).map(input => [input.name, input.value]))
    const tbody = tr.closest('tbody')!,
        index = Array.prototype.indexOf.call(tbody.children, tr);
    emit('update', { index, updatedItem })
    cancelEdit(tr);
}
</script>

<template>
    <form v-if="enableCreate" id="new-item" @submit="createItem" autocomplete="off"></form>
    <table>
        <caption>
            <span class="required">*</span> Required
        </caption>
        <thead>
            <tr>
                <th v-for="col in columns" :key="col.dataField">
                    {{ col.headerText }}
                    <span v-if="col.required" class="required">*</span>
                </th>
            </tr>
        </thead>
        <tbody v-if="enableCreate">
            <tr class="new-item-row">
                <td v-for="col in columns" :key="col.dataField">
                    <input v-if="Boolean(col.required)" type="text" :name="col.dataField" form="new-item" required>
                    <input v-else type="text" :name="col.dataField" form="new-item">
                </td>
                <td>
                    <button form="new-item" class="add-button">Add</button>
                </td>
            </tr>
        </tbody>
        <tbody>
            <tr v-for="item in items">
                <td v-for="col in columns" :key="col.dataField">
                    <span class="view-data">
                        {{ (item as any)[col.dataField] }}
                    </span>
                    <input v-if="Boolean(col.required)" type="text" class="edit-data" :name="col.dataField"
                        :value="(item as any)[col.dataField]" required>
                    <input v-else type="text" class="edit-data" :name="col.dataField" :value="(item as any)[col.dataField]">
                </td>
                <td v-if="enableUpdate">
                    <button class="view-data edit-button" @click="editRow(($event.target as any).closest('tr')!)">
                        Edit
                    </button>
                    <button class="edit-data save-button" @click="updateItem(($event.target as any).closest('tr')!)">
                        Save
                    </button>
                    <button class="edit-data cancel-button" @click="cancelEdit(($event.target as any).closest('tr')!)">
                        Cancel
                    </button>
                </td>
                <td v-if="enableDelete">
                    <button class="delete-button" @click="deleteItem(($event.target as any).closest('tr')!)">
                        Delete
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <span v-if="items.length == 0">No items</span>
</template>

<style scoped>
.view-data {
    display: initial;
}

.edit-data {
    display: none;
}

caption {
    font-weight: bold;
    text-align: left;
    padding-bottom: 0.5rem;
}

td {
    padding: 0;
}

td>span {
    padding: 0.5rem;
}

input,
select {
    background-color: white;
    box-sizing: border-box;
    color: black;
    width: 100%;
}

.add-button {
    background-color: var(--btn-okay-color);
    color: white;
}

.edit-button {}

.save-button {}

.cancel-button {}

.delete-button {
    background-color: var(--btn-danger-color);
    color: white;
}
</style>