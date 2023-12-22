import Limit from '~/domain/Limit.mjs';
import type Goals from '~/domain/Goals.mjs';
import GoalsRepository from '~/data/GoalsRepository.mjs';
import LimitRepository from '~/data/LimitRepository.mjs';
import html from '~/presentation/lib/html.mjs';
import { DataTable } from '~/presentation/components/DataTable.mjs';
import { SlugPage } from '../SlugPage.mjs';

const { p } = html;

export class Limitations extends SlugPage {
    static {
        customElements.define('x-limitations-page', this);
    }

    #goalsRepository = new GoalsRepository();
    #limitRepository = new LimitRepository();
    #goals?: Goals;

    constructor() {
        super({ title: 'Limitations' }, [
            p([
                `Limitations are the constraints on functionality.
                They describe What that is out-of-scope and excluded.
                Example: "Providing an interface to the user to change
                the color of the background is out-of-scope."
                `
            ])
        ]);

        const dataTable = new DataTable<Limit>({
            columns: {
                id: { headerText: 'ID', readonly: true, formType: 'hidden' },
                statement: { headerText: 'Statement', required: true, formType: 'text' }
            },
            select: async () => {
                if (!this.#goals)
                    return [];

                return await this.#limitRepository.getAll(l => this.#goals!.limits.includes(l.id));
            },
            onCreate: async item => {
                const limit = new Limit({ ...item, id: self.crypto.randomUUID() });
                await this.#limitRepository.add(limit);
                this.#goals!.limits.push(limit.id);
                await this.#goalsRepository.update(this.#goals!);
            },
            onUpdate: async item => {
                const limit = (await this.#limitRepository.get(item.id))!;
                limit.statement = item.statement;
                await this.#limitRepository.update(limit);
            },
            onDelete: async id => {
                await this.#limitRepository.delete(id);
                this.#goals!.limits = this.#goals!.limits.filter(x => x !== id);
                await this.#goalsRepository.update(this.#goals!);
            }
        });
        this.append(dataTable);

        this.#goalsRepository.addEventListener('update', () => dataTable.renderData());
        this.#limitRepository.addEventListener('update', () => dataTable.renderData());
        this.#goalsRepository.getBySlug(this.slug).then(goals => {
            this.#goals = goals;
            dataTable.renderData();
        });
    }
}