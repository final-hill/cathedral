import mermaid from 'mermaid';
import groupBy from '~/lib/groupBy.mjs';
import type Presenter from '~/application/Presenter.mjs';
import { Component } from './Component.mjs';
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '~/domain/index.mjs';

export class StakeholdersMap extends Component implements Presenter<Stakeholder> {
    static {
        customElements.define('x-stakeholders-map', this);
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }

    async presentItem(entity: Stakeholder): Promise<void> {
        this.presentList([entity]);
    }

    async presentList(stakeholders: Stakeholder[]) {
        const mermaidContainer = this.shadowRoot,
            // TODO: waiting for Object.groupBy to be implemented in TS:
            // <https://github.com/microsoft/TypeScript/issues/47171>
            groupStakeholders = groupBy(
                stakeholders,
                ({ segmentation }) => segmentation
            ),
            clientGroup = groupStakeholders[StakeholderSegmentation.Client] ?? [],
            vendorGroup = groupStakeholders[StakeholderSegmentation.Vendor] ?? [],
            chartDefinition = (stakeholders: Stakeholder[], category: StakeholderSegmentation) => `
                quadrantChart
                title ${category}
                x-axis Low Availability --> High Availability
                y-axis Low Infuence --> High Influence
                quadrant-1 "${StakeholderCategory.KeyStakeholder} (Satisfy)"
                quadrant-2 "${StakeholderCategory.ShadowInfluencer} (Manage)"
                quadrant-3 "${StakeholderCategory.Observer} (Inform)"
                quadrant-4 "${StakeholderCategory.FellowTraveler} (Monitor)"
                ${stakeholders.map(({ name, availability, influence }) =>
                `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
                }
            `,
            { svg: svgClient } = await mermaid.render('clientMap', chartDefinition(clientGroup, StakeholderSegmentation.Client)),
            { svg: svgVendor } = await mermaid.render('vendorMap', chartDefinition(vendorGroup, StakeholderSegmentation.Vendor));
        mermaidContainer.innerHTML = `${svgClient}<br>${svgVendor}`;
    }
}