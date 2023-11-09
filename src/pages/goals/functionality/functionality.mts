import dataTable from 'components/dataTable.mjs';
import { GoalsRepository } from 'data/GoalsRepository.mjs';
import { BehaviorRepository } from 'data/BehaviorRepository.mjs';
import { Behavior } from 'domain/Behavior.mjs';
import layout from 'layouts/BaseLayout.mjs'
import page from 'lib/page.mjs';
import html from 'lib/html.mjs';

const goalsSlug = new URL(window.location.href).searchParams.get('slug')

const { p, strong } = html

if (!goalsSlug) {
    page({ title: 'Functionality' }, layout([
        p('No goals slug provided.')
    ]))
} else {
    const repo = new GoalsRepository(),
        goals = await repo.getBySlug(goalsSlug)

    if (!goals) {
        page({ title: 'Functionality' }, layout([
            p(`No goals found with slug ${goalsSlug}.`)
        ]))
    } else {
        const behaviorRepo = new BehaviorRepository(),
            functionalBehaviors =
                await behaviorRepo.getAll((x: Behavior) => goals.functionalBehaviors.includes(x.id));
    }
}

const createItem = ({ statement }: { statement: string }) => {
    functionalBehaviors.value.push(new Behavior({
        id: self.crypto.randomUUID(),
        statement
    }));
    repo.update(goals);
}

const updateItem = ({ id, statement }: { id: string, statement: string }) => {
    const index = functionalBehaviors.value.findIndex(x => x.id === id);
    functionalBehaviors.value[index].statement = statement;
    repo.update(goals);
}

const deleteItem = (id: string) => {
    const index = functionalBehaviors.value.findIndex(x => x.id === id);
    functionalBehaviors.value.splice(index, 1);
    repo.update(goals);
}

page({ title: 'Functionality' }, layout([
    p([
        `This section describes the high - level functional behaviors of a system.
        Specify what results or effects are expected. Describe `,
        strong('what'), ` the system should do, not `, strong('how'), ` it should do it.`
    ]),
    dataTable({
        repository: new GoalsRepository(),
        columns: [
            { dataField: 'id', headerText: 'ID', readonly: true, formType: 'hidden' },
            { dataField: 'statement', headerText: 'Statement', required: true }
        ],
        enableCreate: true,
        enableUpdate: true,
        enableDelete: true
    })
]))
