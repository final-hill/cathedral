/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Properties } from '~/types/Properties.mjs';
import type { Entity } from '~/domain/Entity.mjs';
import { formTheme } from '~/presentation/themes.mjs';
import html, { renderIf } from '../lib/html.mjs';
import { Component } from './Component.mjs';

export interface DataColumn {
    formType?: 'text' | 'hidden' | 'select';
    readonly?: boolean;
    headerText: string;
    required?: boolean;
    options?: string[];
}

export type DataColumns<T extends Entity> =
    { id: DataColumn }
    & { [K in keyof Properties<T>]: DataColumn };

export interface DataTableOptions<T extends Entity> {
    columns: DataColumns<T>;
    select: () => Promise<T[]>;
    onCreate?: (item: Omit<Properties<T>, 'id'>) => Promise<void>;
    onUpdate?: (item: Properties<T>) => Promise<void>;
    onDelete?: (id: T['id']) => Promise<void>;
}

const show = ((item: HTMLElement) => item.hidden = false),
    hide = ((item: HTMLElement) => item.hidden = true),
    disable = ((item: HTMLInputElement) => item.disabled = true),
    enable = ((item: HTMLInputElement) => item.disabled = false),
    { button, caption, form, input, option, select, span, table, tbody, td, template, th, thead, tr } = html;

export class DataTable<T extends Entity> extends Component {
    static {
        customElements.define('x-data-table', this);
    }

    #columns; #select; #onCreate; #onUpdate; #onDelete;
    #frmDataTableCreate = this.shadowRoot!.querySelector<HTMLFormElement>('#frmDataTableCreate')!;
    #frmDataTableUpdate = this.shadowRoot!.querySelector<HTMLFormElement>('#frmDataTableUpdate')!;
    #frmDataTableDelete = this.shadowRoot!.querySelector<HTMLFormElement>('#frmDataTableDelete')!;
    #dataEmpty = this.shadowRoot!.querySelector<HTMLTableSectionElement>('.data-empty')!;
    #dataRows = this.shadowRoot!.querySelector<HTMLTableSectionElement>('.data-rows')!;
    #dataHeaderTr = this.shadowRoot!.querySelector<HTMLTableRowElement>('.data-header tr')!;
    #dataEmptyTd = this.shadowRoot!.querySelector<HTMLTableCellElement>('.data-empty td')!;
    #newItemRow = this.shadowRoot!.querySelector<HTMLTableRowElement>('.new-item-row')!;

    constructor({ columns, select, onCreate, onDelete, onUpdate }: DataTableOptions<T>) {
        super({});

        Object.entries(columns).forEach(([key, value]) => {
            if (value.formType == 'select' && !value.options)
                throw new Error(`When formType is "select", options must be specified for column "${key}".`);
        });

        this.#columns = Object.freeze(columns);
        this.#select = select;
        this.#onCreate = onCreate;
        this.#onDelete = onDelete;
        this.#onUpdate = onUpdate;

        this.#frmDataTableCreate.addEventListener('submit', e => this._onCreate(e));
        this.#frmDataTableUpdate.addEventListener('submit', e => this._onUpdate(e));
        this.#frmDataTableDelete.addEventListener('submit', e => this._onDelete(e));
    }

    get columns() {
        return this.#columns;
    }
    set columns(value) {
        this.#columns = Object.freeze(value);
        this.renderData();
    }

    get select() {
        return this.#select;
    }
    set select(value) {
        this.#select = value;
        this.renderData();
    }

    get onCreate() {
        return this.#onCreate;
    }
    set onCreate(value) {
        this.#onCreate = value;
        this.#frmDataTableCreate.hidden = !value;
        this.#newItemRow.parentElement!.hidden = !value;
        this.renderData();
    }

    get onUpdate() {
        return this.#onUpdate;
    }
    set onUpdate(value) {
        this.#onUpdate = value;
        this.#frmDataTableUpdate.hidden = !value;
        this.renderData();
    }

    get onDelete() {
        return this.#onDelete;
    }
    set onDelete(value) {
        this.#onDelete = value;
        this.renderData();
    }

    protected async _onCreate(e: SubmitEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            item = Object.fromEntries(formData.entries()) as Omit<Properties<T>, 'id'>;
        form.reset();
        await this.onCreate?.(item);
        // focus on the first non-hidden input in the new item row
        this.#newItemRow.querySelector<HTMLInputElement>('td:not([hidden]) input')?.focus();
    }

    protected _onUpdate(e: SubmitEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            item = Object.fromEntries(formData.entries()) as Properties<T>;
        this._cancelEdit();
        this.onUpdate?.(item);
    }

    protected _onDelete(e: SubmitEvent) {
        e.preventDefault();
        const id = (e.submitter as HTMLButtonElement).value as T['id'];

        if (confirm(`Are you sure you want to delete item ${id}?`))
            this.onDelete?.(id);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            ...formTheme,
            'caption': {
                fontWeight: 'bold',
                textAlign: 'left',
                paddingBottom: '0.5rem'
            },
            'th': {
                backgroundColor: 'var(--site-dark-bg)',
                padding: '0.5em',
            },
            'tbody tr:nth-child(even)': {
                backgroundColor: 'var(--site-dark-bg)',
            },
            'td': {
                padding: '0'
            },
            'td > span': {
                padding: '0.5rem'
            },
            'table button': {
                width: '1in'
            },
            '.edit-button': {
                backgroundColor: 'var(--btn-okay-color)',
                color: 'var(--btn-font-color)'
            },
            '.delete-button': {
                backgroundColor: 'var(--btn-danger-color)',
                color: 'var(--btn-font-color)'
            }
        };
    }

    protected override _initHtml(): HTMLTemplateElement {
        return template([
            form({
                id: 'frmDataTableCreate',
                autocomplete: 'off'
            }),
            form({
                id: 'frmDataTableUpdate',
                autocomplete: 'off'
            }),
            form({
                id: 'frmDataTableDelete'
            }),
            table([
                caption({ className: 'required' }, ['Required', span('*')]),
                thead({ className: 'data-header' }, [
                    tr()
                ]),
                tbody({ className: 'data-create' },
                    tr({ className: 'new-item-row' })
                ),
                tbody({ className: 'data-rows' }, []),
                tbody({ className: 'data-empty', hidden: true },
                    tr(
                        td(['No items'])
                    )
                )
            ])
        ]);
    }

    /**
     * Hide all edit items in the table and then swap the row
     * from edit mode to view mode.
     * @returns void
     */
    protected _cancelEdit() {
        const root = this.shadowRoot,
            viewData = root.querySelectorAll<HTMLElement>('.view-data'),
            editData = root.querySelectorAll<HTMLInputElement>('.edit-data');
        viewData.forEach(show);
        editData.forEach(hide);
        editData.forEach(disable);
    }

    /**
     * Hide all edit items in the table and then swap the row
     * from view mode to edit mode.
     * @param e - The event that triggered the edit.
     * @returns void
     */
    protected _editRow(e: Event) {
        const tr = (e.target as Element).closest('tr')!,
            tbody = tr.closest('tbody')!;
        tbody.querySelectorAll<HTMLElement>('.view-data').forEach(show);
        tbody.querySelectorAll<HTMLElement>('.edit-data').forEach(hide);
        tr.querySelectorAll<HTMLElement>('.view-data').forEach(hide);
        tr.querySelectorAll<HTMLElement>('.edit-data').forEach(show);
        tr.querySelectorAll<HTMLInputElement>('.edit-data').forEach(enable);
    }

    async renderData() {
        this.#dataEmptyTd.colSpan = Object.keys(this.#columns).length;

        this.#dataHeaderTr.replaceChildren(
            ...Object.entries(this.#columns).map(([_id, col]) =>
                th({
                    className: col.required ? 'required' : '',
                    hidden: col.formType == 'hidden'
                }, [
                    col.headerText,
                    col.required ? span('*') : ''
                ]))
        );

        this.#newItemRow.replaceChildren(
            ...Object.entries(this.#columns).map(([id, col]) =>
                td({ hidden: col.formType == 'hidden' }, [
                    input({
                        type: 'text',
                        name: id,
                        required: col.required,
                        form: this.#frmDataTableCreate,
                        [renderIf]: col.formType != 'select'
                    }),
                    select({
                        hidden: col.formType != 'select',
                        name: id,
                        form: this.#frmDataTableCreate,
                        [renderIf]: col.formType == 'select'
                    }, [
                        ...(col.options?.map(opt => option({ value: opt }, opt)) ?? [])
                    ])
                ]))
        );
        this.#newItemRow.append(td(button({
            type: 'submit',
            className: 'add-button',
            form: this.#frmDataTableCreate
        }, 'Add')));

        const dataItems = await this.select(),
            tRows = dataItems.map(item => tr([
                ...Object.entries(this.#columns).map(([id, col]) =>
                    td({ hidden: col.formType == 'hidden' }, [
                        span({
                            'className': 'view-data',
                            // @ts-expect-error: data-* attributes are valid
                            'data-name': id
                        }, (item as any)[id]),
                        col.formType != 'select' ?
                            input({
                                form: this.#frmDataTableUpdate,
                                type: 'text',
                                className: 'edit-data',
                                name: id,
                                value: (item as any)[id],
                                required: col.required,
                                disabled: true,
                                hidden: true
                            })
                            : '',
                        col.formType == 'select' ?
                            select({
                                form: this.#frmDataTableUpdate,
                                className: 'edit-data',
                                name: id,
                                disabled: true,
                                hidden: true
                            }, [
                                ...col.options!.map(opt => option({
                                    value: opt,
                                    selected: opt == (item as any)[id]
                                }, opt))
                            ])
                            : ''
                    ])),
                td([
                    button({
                        className: 'view-data edit-button',
                        onclick: e => this._editRow(e),
                        [renderIf]: Boolean(this.onUpdate)
                    }, 'Edit'),
                    button({
                        form: this.#frmDataTableDelete,
                        className: 'view-data delete-button',
                        name: 'item-id',
                        [renderIf]: Boolean(this.onDelete),
                        value: item.id
                    }, 'Delete'),
                    button({
                        form: this.#frmDataTableUpdate,
                        className: 'edit-data save-button',
                        type: 'submit',
                        hidden: true,
                        [renderIf]: Boolean(this.onUpdate)
                    }, 'Save'),
                    button({
                        className: 'edit-data cancel-button',
                        onclick: () => this._cancelEdit(),
                        hidden: true,
                        [renderIf]: Boolean(this.onUpdate)
                    }, 'Cancel')
                ]),
            ].filter(Boolean)));

        this.#dataRows.replaceChildren(...tRows);
        this.#dataRows.hidden = dataItems.length == 0;
        this.#dataEmpty.hidden = dataItems.length > 0;
    }
}