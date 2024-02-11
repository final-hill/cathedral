import type { Properties } from '~/types/Properties.mjs';
import { type Entity } from '~/domain/index.mjs';
import html, { renderIf } from '../lib/html.mjs';
import { Component } from './Component.mjs';
import buttonTheme from '../theme/buttonTheme.mjs';
import formTheme from '../theme/formTheme.mjs';
import type Presenter from '~/application/Presenter.mjs';

export interface BaseDataColumn {
    readonly?: boolean;
    headerText: string;
    required?: boolean;
    unique?: boolean;
}

export interface TextHiddenDataColumn {
    formType: 'text' | 'hidden' | 'textarea' | 'url';
}

export interface NumberRangeDataColumn {
    formType: 'number' | 'range';
    min: number;
    max: number;
    step: number;
}

export interface OptDataColumn {
    formType: 'select';
    options: { value: string; text: string }[];
}

export type DataColumn = BaseDataColumn &
    (TextHiddenDataColumn | NumberRangeDataColumn | OptDataColumn);

export type DataColumns<T extends Entity> =
    { id: DataColumn }
    & { [K in keyof Partial<Properties<T>>]: DataColumn };

const show = ((item: HTMLElement) => item.hidden = false),
    hide = ((item: HTMLElement) => item.hidden = true),
    disable = ((item: HTMLInputElement | HTMLSelectElement) => item.disabled = true),
    enable = ((item: HTMLInputElement | HTMLSelectElement) => item.disabled = false),
    { button, caption, form, input, option, select, span, table, textarea, tbody, td, template, th, thead, tr } = html;

export class DataTable<T extends Entity> extends Component implements Presenter<T> {
    static {
        customElements.define('x-data-table', this);
    }

    #columns: DataColumns<T>;
    accessor onCreate: (item: Omit<Properties<T>, 'id'>) => Promise<void>;
    accessor onUpdate: (item: Properties<T>) => Promise<void>;
    accessor onDelete: (id: T['id']) => Promise<void>;
    #frmDataTableCreate = this.shadowRoot.querySelector<HTMLFormElement>('#frmDataTableCreate')!;
    #frmDataTableUpdate = this.shadowRoot.querySelector<HTMLFormElement>('#frmDataTableUpdate')!;
    #frmDataTableDelete = this.shadowRoot.querySelector<HTMLFormElement>('#frmDataTableDelete')!;
    #dataEmpty = this.shadowRoot.querySelector<HTMLTableSectionElement>('.data-empty')!;
    #dataRows = this.shadowRoot.querySelector<HTMLTableSectionElement>('.data-rows')!;
    #dataHeaderTr = this.shadowRoot.querySelector<HTMLTableRowElement>('.data-header tr')!;
    #dataEmptyTd = this.shadowRoot.querySelector<HTMLTableCellElement>('.data-empty td')!;
    #newItemRow = this.shadowRoot.querySelector<HTMLTableRowElement>('.new-item-row')!;

    constructor(
        { columns, onCreate, onUpdate, onDelete, ...rest }: Partial<Properties<DataTable<T>>>
            & Pick<DataTable<T>, 'columns' | 'onCreate' | 'onUpdate' | 'onDelete'>
    ) {
        super(rest);

        this.#columns = Object.freeze(columns ?? {} as DataColumns<T>);
        this.onCreate = onCreate;
        this.onDelete = onDelete;
        this.onUpdate = onUpdate;
    }

    get columns() {
        return this.#columns;
    }
    set columns(value) {
        this.#columns = Object.freeze(value);
    }

    protected _isUnique(item: Partial<Properties<T>>): boolean {
        return Object.entries(this.#columns).every(([id, col]) => {
            if (!col.unique || id == 'id')
                return true;
            const namedInputs = Array.from(this.#dataRows.querySelectorAll<HTMLInputElement>(`[name="${id}"]`));

            return namedInputs.filter(input => input.value == (item as any)[id]).length == 0;
        });
    }

    protected async _onCreate(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            item = Object.fromEntries(formData.entries()) as Omit<Properties<T>, 'id'>;
        if (!this._isUnique(item as Partial<Properties<T>>)) {
            alert('The entry must be unique.');
        } else {
            form.reset();
            await this.onCreate?.(item);
            // focus on the first non-hidden input in the new item row
            this.#newItemRow.querySelector<HTMLInputElement>('td:not([hidden]) input')?.focus();
        }
    }

    protected async _onUpdate(e: SubmitEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            item = Object.fromEntries(formData.entries()) as Properties<T>;
        await this.onUpdate?.(item);
    }

    protected async _onDelete(e: SubmitEvent) {
        e.preventDefault();
        const id = (e.submitter as HTMLButtonElement).value as T['id'];

        if (confirm(`Are you sure you want to delete item ${id}?`))
            await this.onDelete?.(id);
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            ...buttonTheme,
            ...formTheme,
            //The following is duplicated from the theme due to
            // a browser bug
            '.required span': {
                color: 'var(--btn-danger-color)',
                paddingLeft: '0.25em'
            },
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
            }
        };
    }

    protected override _initShadowHtml(): HTMLTemplateElement {
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
     * @param btn - The button that triggered the cancel.
     * @returns void
     */
    protected _cancelEdit(btn: HTMLButtonElement) {
        if (btn.hidden)
            return;

        const tr = btn.closest('tr')!,
            fields = tr.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.data-cell > *'),
            editButtons = tr.querySelectorAll<HTMLButtonElement>('.button-cell > .edit-data'),
            viewButtons = tr.querySelectorAll<HTMLButtonElement>('.button-cell > .view-data');

        fields.forEach(disable);
        fields.forEach(field => {
            if (field instanceof HTMLSelectElement)
                field.selectedIndex = [...field.options].findIndex(opt => opt.defaultSelected);
            else
                field.value = field.defaultValue;
        });
        viewButtons.forEach(show);
        editButtons.forEach(hide);
    }

    /**
     * Hide all edit items in the table and then swap the row
     * from view mode to edit mode.
     * @param e - The event that triggered the edit.
     * @returns void
     */
    protected _editRow(e: Event) {
        const tr = (e.target as Element).closest('tr')!,
            cancelButtons = tr.closest('tbody')!.querySelectorAll<HTMLButtonElement>('.cancel-button'),
            fields = tr.querySelectorAll<HTMLInputElement>('.data-cell > *'),
            editButtons = tr.querySelectorAll<HTMLButtonElement>('.button-cell > .edit-data'),
            viewButtons = tr.querySelectorAll<HTMLButtonElement>('.button-cell > .view-data');

        // before editing, cancel any other edits
        cancelButtons.forEach(btn => this._cancelEdit(btn));

        // toggle the edit buttons and fields
        fields.forEach(enable);
        viewButtons.forEach(hide);
        editButtons.forEach(show);
    }

    connectedCallback() {
        this.#frmDataTableCreate.onsubmit = e => this._onCreate(e);
        this.#frmDataTableUpdate.onsubmit = e => this._onUpdate(e);
        this.#frmDataTableDelete.onsubmit = e => this._onDelete(e);
    }

    disconnectedCallback() {
        this.#frmDataTableCreate.onsubmit = null;
        this.#frmDataTableUpdate.onsubmit = null;
        this.#frmDataTableDelete.onsubmit = null;
    }

    async presentItem(data: T): Promise<void> {
        this.presentList([data]);
    }

    async presentList(data: T[]): Promise<void> {
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
                        type: col.formType,
                        name: id,
                        required: col.required,
                        form: this.#frmDataTableCreate,
                        [renderIf]: ['text', 'hidden', 'url'].includes(col.formType)
                    }),
                    select({
                        name: id,
                        form: this.#frmDataTableCreate,
                        [renderIf]: col.formType == 'select'
                    },
                        col.formType == 'select' ?
                            col.options.map(opt => option({ value: opt.value }, opt.text))
                            : []
                    ),
                    input({
                        type: col.formType,
                        name: id,
                        min: col.formType == 'number' || col.formType == 'range' ?
                            `${col.min}` : '0',
                        max: col.formType == 'number' || col.formType == 'range' ?
                            `${col.max}` : '0',
                        step: col.formType == 'number' || col.formType == 'range' ?
                            `${col.step}` : '1',
                        form: this.#frmDataTableCreate,
                        [renderIf]: col.formType == 'number' || col.formType == 'range'
                    }),
                    textarea({
                        name: id,
                        form: this.#frmDataTableCreate,
                        required: col.required,
                        [renderIf]: col.formType == 'textarea'
                    })
                ]))
        );
        this.#newItemRow.append(td(button({
            type: 'submit',
            className: 'add-button',
            form: this.#frmDataTableCreate
        }, 'Add')));

        const dataRows = data.map(item => tr([
            ...Object.entries(this.#columns).map(([id, col]) => {
                const colOptions = ((col as OptDataColumn).options ?? []).map(opt => option({
                    value: opt.value,
                    defaultSelected: opt.value == (item as any)[id]
                }, opt.text));

                return td({
                    className: 'data-cell',
                    hidden: col.formType == 'hidden'
                }, [
                    input({
                        [renderIf]: ['text', 'hidden', 'url'].includes(col.formType),
                        form: this.#frmDataTableUpdate,
                        type: 'text',
                        disabled: id !== 'id', // if disabled, it won't be submitted
                        required: col.required,
                        name: id,
                        defaultValue: (item as any)[id]
                    }, []),
                    textarea({
                        [renderIf]: col.formType == 'textarea',
                        form: this.#frmDataTableUpdate,
                        name: id,
                        disabled: true,
                        required: col.required,
                        defaultValue: (item as any)[id]
                    }, []),
                    input({
                        form: this.#frmDataTableUpdate,
                        type: col.formType,
                        name: id,
                        min: `${(col as NumberRangeDataColumn).min ?? 0}`,
                        max: `${(col as NumberRangeDataColumn).max ?? 0}`,
                        step: `${(col as NumberRangeDataColumn).step ?? 1}`,
                        disabled: true,
                        [renderIf]: col.formType == 'number' || col.formType == 'range',
                        defaultValue: (item as any)[id]
                    }),
                    select({
                        form: this.#frmDataTableUpdate,
                        name: id,
                        disabled: true,
                        [renderIf]: col.formType == 'select'
                    },
                        colOptions
                    )
                ]);
            }),
            td({
                className: 'button-cell',
            }, [
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
                    onclick: e => this._cancelEdit(e.target as HTMLButtonElement),
                    hidden: true,
                    [renderIf]: Boolean(this.onUpdate)
                }, 'Cancel')
            ]),
        ].filter(Boolean)));

        this.#dataRows.replaceChildren(...dataRows);
        this.#dataRows.hidden = data.length == 0;
        this.#dataEmpty.hidden = data.length > 0;
    }
}