<script lang="ts" setup>
import type { Entity } from '~/domain/Entity';

export interface Column {
    formType?: 'text' | 'hidden' | 'select'
    readonly?: boolean
    dataField: string
    headerText: string
    required?: boolean
    options?: string[]
}

const props = defineProps({
    dataSource: {
        type: Array as PropType<Entity[]>,
        required: true
    },
    columns: {
        type: Array as PropType<Column[]>,
        validator: (value: Column[]) => {
            if (value.length == 0)
                throw new Error('At least one column must be specified.')
            if (value.filter(x => x.dataField == 'id').length > 1)
                throw new Error('Only one column can be marked as "id".')
            if (value.filter(x => x.formType == 'select' && !x.options).length > 0)
                throw new Error('When formType is "select", options must be specified.')
            return true
        },
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
    (e: 'create', data: any): void
    (e: 'delete', data: any): void
    (e: 'update', data: any): void
}>()

const items = props.dataSource,
    qs = <E extends HTMLElement = HTMLElement>(sel: string, ctx: ParentNode = document): E =>
        ctx.querySelector(sel)!,
    qsa = <E extends HTMLElement = HTMLElement>(sel: string, ctx: ParentNode = document): E[] =>
        Array.from(ctx.querySelectorAll(sel)),
    show = ((item: HTMLElement) => item.hidden = false),
    hide = ((item: HTMLElement) => item.hidden = true);

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
    const spnId = qs<HTMLSpanElement>('span[data-name="id"]', tr)
    if (!spnId)
        throw new Error('Unable to locate "id" field in table row.')
    emit('delete', spnId.textContent?.trim())
}

const updateItem = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        item = Object.fromEntries(formData.entries())
    emit('update', item)
    form.reset();
    cancelEdit();
}

/**
 * Hide all edit items in the table and then swap the row
 * from view mode to edit mode.
 */
const editRow = (tr: HTMLTableRowElement) => {
    const tbody = tr.closest('tbody')!
    qsa('.view-data', tbody).forEach(show);
    qsa('.edit-data', tbody).forEach(hide);
    qsa('.view-data', tr).forEach(hide);
    qsa('.edit-data', tr).forEach(show);
}

const cancelEdit = () => {
    qsa('.view-data').forEach(show);
    qsa('.edit-data').forEach(hide);
}
</script>

<template>
    <form v-if="enableCreate" id="frmDataTableCreate" @submit="createItem" autocomplete="off"></form>
    <form v-if="enableUpdate" id="frmDataTableUpdate" @submit="updateItem" autocomplete="off"></form>
    <table>
        <caption>
            <span class="required">*</span> Required
        </caption>
        <thead>
            <tr>
                <th v-for="col in columns" :key="col.dataField" :hidden="col.formType == 'hidden'">
                    {{ col.headerText }}
                    <span v-if="col.required" class="required">*</span>
                </th>
            </tr>
        </thead>
        <tbody v-if="enableCreate">
            <tr class="new-item-row">
                <td v-for="col in columns" :key="col.dataField" :hidden="col.formType == 'hidden'">
                    <input v-if="col.formType != 'select'" type="text" :name="col.dataField" form="frmDataTableCreate"
                        :required="col.required">
                    <select v-else :name="col.dataField" form="frmDataTableCreate">
                        <option v-for="option in col.options" :key="option" :value="option">{{ option }}</option>
                    </select>
                </td>
                <td>
                    <button form="frmDataTableCreate" type="submit" class="add-button">Add</button>
                </td>
            </tr>
        </tbody>
        <tbody>
            <tr v-for="item in items">
                <td v-for="col in columns" :key="col.dataField" :hidden="col.formType == 'hidden'">
                    <span class="view-data" :data-name="col.dataField">{{ (item as any)[col.dataField] }}</span>
                    <input v-if="col.formType != 'select'" form="frmDataTableUpdate" type="text" class="edit-data"
                        :name="col.dataField" :value="(item as any)[col.dataField]" :required="col.required" hidden>
                    <select v-else form="frmDataTableUpdate" class="edit-data" :name="col.dataField"
                        :value="(item as any)[col.dataField]" hidden>
                        <option v-for="option in col.options" :key="option" :value="option">{{ option }}</option>
                    </select>
                </td>
                <td v-if="enableUpdate">
                    <button class="view-data edit-button" @click="editRow(($event.target as any).closest('tr')!)">
                        Edit
                    </button>
                    <button class="edit-data save-button" type="submit" form="frmDataTableUpdate" hidden>
                        Save
                    </button>
                    <button class="edit-data cancel-button" @click="cancelEdit()" hidden>
                        Cancel
                    </button>
                </td>
                <td v-if="enableDelete">
                    <button class="view-data delete-button" @click="deleteItem(($event.target as any).closest('tr')!)">
                        Delete
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <span v-if="items.length == 0">No items</span>
</template>

<style scoped>
caption {
    font-weight: bold;
    text-align: left;
    padding-bottom: 0.5rem;
}

td {
    padding: 0;

    >span {
        padding: 0.5rem;
    }
}

input,
select {
    background-color: white;
    box-sizing: border-box;
    color: black;
    width: 100%;
}

.add-button,
.save-button,
.edit-button {
    background-color: var(--btn-okay-color);
    color: white;
}

.delete-button,
.cancel-button {
    background-color: var(--btn-danger-color);
    color: white;
}
</style>