import type { Entity } from 'domain/Entity.mjs';
import { qs, qsa } from 'lib/query.mjs';
import style from "lib/style.mjs";
import html from 'lib/html.mjs';
import Repository from 'usecases/Repository.mjs';

style('data-table', `
.data-table {
    & caption {
        font-weight: bold;
        text-align: left;
        padding-bottom: 0.5rem;
    }

    & td {
        padding: 0;

        >span {
            padding: 0.5rem;
        }
    }

    & input,
    & select {
        background-color: white;
        box-sizing: border-box;
        color: black;
        width: 100%;
    }

    & .add-button,
    & .save-button,
    & .edit-button {
        background-color: var(--btn-okay-color);
        color: white;
    }

    & .delete-button,
    & .cancel-button {
        background-color: var(--btn-danger-color);
        color: white;
    }
}
`)

export interface Column {
    formType?: 'text' | 'hidden' | 'select'
    readonly?: boolean
    dataField: string
    headerText: string
    required?: boolean
    options?: string[]
}

export interface DataTableOptions {
    repository: Repository<Entity>
    columns: Column[]
    enableCreate?: boolean
    enableUpdate?: boolean
    enableDelete?: boolean
}

const show = ((item: HTMLElement) => item.hidden = false),
    hide = ((item: HTMLElement) => item.hidden = true),
    { article, button, caption, form, input, option, select, span, table, tbody, td, th, thead, tr } = html

const createItem = (e: Event, repository: Repository<Entity>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        item = Object.fromEntries(formData.entries()),
        entity = repository.EntityConstructor.fromJSON(item)
    form.reset();
    repository.add(entity)
}

const deleteItem = (tr: HTMLTableRowElement, repository: Repository<Entity>) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const spnId = qs<HTMLSpanElement>('span[data-name="id"]', tr)
    if (!spnId)
        throw new Error('Unable to locate "id" field in table row.')

    const id = spnId.textContent?.trim()! as Entity['id']
    repository.delete(id)
}

const updateItem = (e: Event, repository: Repository<Entity>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        item = Object.fromEntries(formData.entries()),
        entity = repository.EntityConstructor.fromJSON(item)
    cancelEdit();
    repository.update(entity)
}

/**
 * Hide all edit items in the table and then swap the row
 * from edit mode to view mode.
 */
const cancelEdit = () => {
    qsa<HTMLElement>('.view-data').forEach(show);
    qsa<HTMLElement>('.edit-data').forEach(hide);
}

/**
 * Hide all edit items in the table and then swap the row
 * from view mode to edit mode.
 */
const editRow = (tr: HTMLTableRowElement) => {
    const tbody = tr.closest('tbody')!
    qsa<HTMLElement>('.view-data', tbody).forEach(show);
    qsa<HTMLElement>('.edit-data', tbody).forEach(hide);
    qsa<HTMLElement>('.view-data', tr).forEach(hide);
    qsa<HTMLElement>('.edit-data', tr).forEach(show);
}

const renderData = async (options: DataTableOptions, form: HTMLFormElement) => {
    const tbodyData = qs<HTMLTableSectionElement>('.data-table .data-rows')!,
        tbodyEmpty = qs<HTMLTableSectionElement>('.data-table .data-empty')!,
        { repository, columns, enableUpdate, enableDelete } = options

    const items = await repository.getAll()

    if (items.length == 0) {
        tbodyData.hidden = true
        tbodyEmpty.hidden = false
        return
    } else {
        tbodyData.hidden = false
        tbodyEmpty.hidden = true
    }

    const tRows = items.map(item => tr([
        ...columns.map(col => td({ hidden: col.formType == 'hidden' }, [
            span({
                className: 'view-data',
                // @ts-ignore
                'data-name': col.dataField
            }, (item as any)[col.dataField]),
            col.formType != 'select' ?
                input({ form, type: 'text', className: 'edit-data', name: col.dataField, value: (item as any)[col.dataField], required: col.required, hidden: true })
                : '',
            col.formType == 'select' ?
                select({ form, className: 'edit-data', name: col.dataField, hidden: true }, [
                    ...col.options!.map(opt => option({ value: opt, selected: opt == (item as any)[col.dataField] }, opt))
                ])
                : ''
        ])),
        enableUpdate ?
            td([
                button({ className: 'view-data edit-button', onclick(e) { editRow((e.target as any).closest(tr)) } }, 'Edit'),
                button({ className: 'edit-data save-button', type: 'submit', form, hidden: true }, 'Save'),
                button({ className: 'edit-data cancel-button', onclick: cancelEdit, hidden: true }, 'Cancel')
            ])
            : '',
        enableDelete ?
            td([
                button({ className: 'view-data delete-button', onclick(e) { deleteItem((e.target as any).closest(tr), repository) } }, 'Delete')
            ])
            : ''
    ].filter(Boolean)))

    tbodyData.replaceChildren(...tRows)
}

export default (options: DataTableOptions) => {
    const { repository, columns, enableCreate, enableUpdate } = options,
        validateColumns = (cols: Column[]): void => {
            if (cols.length == 0)
                throw new Error('At least one column must be specified.')
            if (cols.filter(col => col.dataField == 'id').length > 1)
                throw new Error('Only one column can be marked as "id".')
            if (cols.filter(col => col.formType == 'select' && !col.options).length > 0)
                throw new Error('When formType is "select", options must be specified.')
        }

    validateColumns(columns)

    const frmDataTableCreate = form({
        id: 'frmDataTableCreate', hidden: !enableCreate, autocomplete: 'off',
        onsubmit(e: SubmitEvent) { createItem(e, repository) }
    }),
        frmDataTableUpdate = form({
            id: 'frmDataTableUpdate', hidden: !enableUpdate, autocomplete: 'off',
            onsubmit(e: SubmitEvent) { updateItem(e, repository) }
        })

    const dataTable = article({ className: 'data-table' }, [
        frmDataTableCreate,
        frmDataTableUpdate,
        table([
            caption([span({ className: 'required' }, '*'), ' Required']),
            thead([
                tr([
                    ...columns.map(col => th({ hidden: col.formType == 'hidden' }, [
                        col.headerText,
                        col.required ? span({ className: 'required' }, '*') : ''
                    ]))
                ])
            ]),
            tbody({ hidden: enableCreate },
                tr({ className: 'new-item-row' }, [
                    ...columns.map(col => td({ hidden: col.formType == 'hidden' }, [
                        col.formType != 'select' ?
                            input({ type: 'text', name: col.dataField, required: col.required, form: frmDataTableCreate })
                            : '',
                        col.formType == 'select' ?
                            select({ hidden: col.formType != 'select', name: col.dataField, form: frmDataTableCreate }, [
                                ...col.options!.map(opt => option({ value: opt }, opt))
                            ])
                            : ''
                    ])),
                    td(button({ type: 'submit', className: 'add-button' }, 'Add'))
                ])
            ),
            tbody({ className: 'data-rows' }, []),
            tbody({ className: 'data-empty', hidden: true },
                tr(
                    td({ colSpan: columns.length }, ['No items'])
                )
            )
        ])
    ])

    repository.addEventListener('update', () => renderData(options, frmDataTableUpdate))

    renderData(options, frmDataTableUpdate)

    return dataTable
}