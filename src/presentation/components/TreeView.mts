import { type Tree } from '~/domain/index.mjs';
import { Component } from './Component.mjs';
import type Presenter from '~/application/Presenter.mjs';
import type { Properties } from '~/types/Properties.mjs';
import html from '../lib/html.mjs';
import buttonTheme from '../theme/buttonTheme.mjs';
import formTheme from '../theme/formTheme.mjs';
import { FeatherIcon } from './FeatherIcon.mjs';

const { details, summary, form, input, section, button, span } = html;

export class TreeView<T extends Tree> extends Component implements Presenter<T> {
    static {
        customElements.define('x-tree-view', this);
    }

    onCreate!: (item: { parentId?: T['id']; label: string }) => Promise<T>;
    onUpdate!: (item: { parentId?: T['id']; id: T['id']; label: string }) => Promise<void>;
    onDelete!: (item: { parentId?: T['id']; id: T['id'] }) => Promise<void>;
    labelField!: keyof T;

    #treeView;

    constructor(
        { onCreate, onUpdate, onDelete, labelField, ...rest }: Partial<Properties<TreeView<T>>>
            & Pick<TreeView<T>, 'onCreate' | 'onUpdate' | 'onDelete' | 'labelField'>
    ) {
        super(rest);
        Object.assign(this, { onCreate, onUpdate, onDelete, labelField });

        this.shadowRoot.append(
            this.#treeView = section({ className: 'tree-view' })
        );
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
            ...formTheme,
            ...buttonTheme,
            '.tree-view': {
                display: 'inline-flex',
                flexDirection: 'column',
            },
            'details': {
                margin: '0 0 1em 2em'
            },
            'summary': {
                cursor: 'pointer',
                marginLeft: '-2em'
            },
            'form': {
                display: 'inline-flex',
                alignItems: 'center'
            },
            'form > .label': {
                marginRight: '1em'
            },
            '.add-row': {
                display: 'flex',
                width: '20em'
            },
            '.add-row input': {
                flexGrow: '1',
                marginRight: '1em'
            },
            '.edit-input': {
                width: '18em',
                marginRight: '1em'
            },
            '.children': {
                marginLeft: '1em',
                paddingTop: '1em'
            }
        };
    }

    #createAddComponentRow(container: HTMLElement, parentId?: T['id']): void {
        container.append(
            form({
                autocomplete: 'off',
                className: 'add-row',
                onsubmit: e => this.#onCreate(e)
            }, [
                input({
                    type: 'hidden',
                    name: 'parentId',
                    value: parentId || ''
                }),
                input({
                    type: 'text',
                    name: 'label',
                    placeholder: 'New Component Name',
                    required: true
                }),
                button({
                    type: 'submit',
                    value: 'Add',
                    className: 'add-button',
                    title: 'Add'
                }, new FeatherIcon({ icon: 'plus' }))
            ])
        );
    }

    #createComponentRow(container: HTMLElement, item: T): void {
        const elChildren = section({ className: 'children' });

        for (const child of item.children as T[])
            this.#createComponentRow(elChildren, child);

        this.#createAddComponentRow(elChildren, item.id);

        container.appendChild(details({}, [
            summary(
                form({
                    autocomplete: 'off',
                    onreset: e => this.#onCancel(e),
                    onsubmit: e => {
                        if (e.submitter?.classList.contains('delete-button'))
                            this.#onDelete(e);
                        else if (e.submitter?.classList.contains('update-button'))
                            this.#onUpdate(e);
                    }
                }, [
                    span({ className: 'label' }, item[this.labelField] as string),
                    input({
                        type: 'hidden',
                        name: 'id',
                        value: item.id
                    }),
                    input({
                        className: 'edit-input',
                        type: 'text',
                        name: 'label',
                        defaultValue: item[this.labelField] as string,
                        required: true,
                        hidden: true,
                        // on enter, submit the form via the update button
                        onkeydown: e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                (e.target as HTMLElement).closest('form')!
                                    .querySelector<HTMLButtonElement>('.update-button')!.click();
                            }
                        }
                    }),
                    button({
                        type: 'button',
                        className: 'edit-button',
                        title: 'Edit',
                        onclick: e => this.#onEdit(e)
                    }, new FeatherIcon({ icon: 'edit' })),
                    button({
                        type: 'submit',
                        className: 'delete-button',
                        title: 'Delete',
                        value: item.id
                    }, new FeatherIcon({ icon: 'trash-2' })),
                    button({
                        type: 'submit',
                        value: item.id,
                        className: 'update-button',
                        title: 'Update',
                        hidden: true,
                        disabled: true
                    }, new FeatherIcon({ icon: 'check' })),
                    button({
                        type: 'reset',
                        className: 'cancel-button',
                        title: 'Cancel',
                        hidden: true
                    }, new FeatherIcon({ icon: 'x' }))
                ])
            ),
            elChildren
        ]));
    }

    #onCancel(e: Event) {
        const form = e.target as HTMLFormElement,
            qs = (s: string) => form.querySelector<HTMLElement>(s)!;
        qs('.edit-input').hidden = true;
        qs('.label').hidden = false;
        qs('.edit-button').hidden = false;
        qs('.cancel-button').hidden = true;
        Object.assign(qs('.update-button'), {
            hidden: true,
            disabled: true
        });
        Object.assign(qs('.delete-button'), {
            hidden: false,
            disabled: false
        });
    }

    async #onCreate(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            parent = form.parentElement!,
            formData = new FormData(form),
            value = (formData.get('label') as string).trim(),
            parentId = formData.get('parentId') as T['id'] ?? undefined,
            item = await this.onCreate({ parentId, label: value });

        this.#createComponentRow(form.parentElement!, item);

        // move the add row to the bottom
        form.remove();
        this.#createAddComponentRow(parent, parentId);
    }

    async #onDelete(e: SubmitEvent): Promise<void> {
        e.preventDefault();

        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            parentId = formData.get('parentId') as T['id'] ?? undefined,
            id = formData.get('id') as T['id'] ?? '',
            label = form.querySelector('.label')!.textContent;

        if (!confirm(`Are you sure you want to delete "${label}"?`))
            return;

        await this.onDelete({ parentId, id });

        form.closest('details')!.remove();
    }

    #onEdit(e: Event) {
        const summary = (e.target as HTMLElement).closest('summary')!,
            qs = (s: string) => summary.querySelector<HTMLElement>(s)!;
        qs('.edit-input').hidden = false;
        qs('.label').hidden = true;
        qs('.edit-button').hidden = true;
        qs('.cancel-button').hidden = false;
        Object.assign(qs('.update-button'), {
            hidden: false,
            disabled: false
        });
        Object.assign(qs('.delete-button'), {
            hidden: true,
            disabled: true
        });
    }

    async #onUpdate(e: SubmitEvent): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement,
            formData = new FormData(form),
            value = (formData.get('label') as string).trim(),
            parentId = form.closest('.children')?.closest('details')?.querySelector<HTMLInputElement>('input[name="id"]')?.value as T['id'],
            id = formData.get('id') as T['id'];

        form.querySelector<HTMLInputElement>('.edit-input')!.defaultValue = value;
        form.querySelector('.label')!.textContent = value;

        await this.onUpdate({ parentId, id, label: value });

        form.reset();
    }

    presentItem(item: T) {
        this.presentList([item]);
    }

    presentList(items: T[]) {
        this.#treeView.innerHTML = '';

        for (const item of items)
            this.#createComponentRow(this.#treeView, item);

        this.#createAddComponentRow(this.#treeView);
    }
}