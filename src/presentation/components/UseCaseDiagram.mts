import mermaid from 'mermaid';
import { UseCase } from '~/domain/index.mjs';
import { Component } from '~components/index.mjs';
import type Presenter from '~/application/Presenter.mjs';
import slugify from '~/lib/slugify.mjs';

export class UseCaseDiagram extends Component implements Presenter<UseCase> {
    static {
        customElements.define('x-use-case-diagram', this);
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }

    actors: { id: string; name: string }[] = [];

    presentItem(_entity: UseCase) {
        throw new Error('Method not implemented.');
    }

    async presentList(useCases: UseCase[]) {
        const mermaidContainer = this.shadowRoot, chartDefinition = `
            flowchart LR
            ${useCases.map(u => {
            const { actor } = u;

            return `${actor.id}("#128100;<br>${actor.name}") --> ${slugify(u.statement)}["${u.statement}"]`;
        }).join('\n')}
            `, { svg } = await mermaid.render('diagram', chartDefinition);

        mermaidContainer.innerHTML = svg;
    }
}