import { GoalsRepository } from 'data/GoalsRepository.mjs';
import html from 'lib/html.mjs';
import style from 'lib/style.mjs';
import page from 'lib/page.mjs';
import layout from 'layouts/BaseLayout.mjs'
import { Goals } from 'domain/Goals.mjs';

style('rationale', `
.form-rationale {
    display: flex;
    flex-direction: column;

    & textarea {
        height: 200px;
    }
}
`)

const repo = new GoalsRepository(),
    slug = new URL(location.href).searchParams.get('slug'),
    { form, h3, p, textarea } = html

const showGoals = (goals: Goals) => {
    const { objective, situation, outcomes } = goals!;

    const updateSituation = (e: Event) => {
        const txtSituation = e.target as HTMLTextAreaElement
        goals!.situation = txtSituation.value.trim()
        repo.update(goals!)
    }

    const updateObjective = (e: Event) => {
        const txtObjective = e.target as HTMLTextAreaElement
        goals!.objective = txtObjective.value.trim()
        repo.update(goals!)
    }

    const updateOutcomes = (e: Event) => {
        const txtOutcomes = e.target as HTMLTextAreaElement
        goals!.outcomes = txtOutcomes.value.trim()
        repo.update(goals!)
    }

    page({ title: 'Rationale' }, layout([
        form({ class: 'form-rationale', autocomplete: 'off' }, [
            h3('Situation'),
            p('The situation is the current state of affairs that need to be addressed by a system created by a project.'),
            textarea({ name: 'situation', value: situation, onchange: updateSituation }, []),
            h3('Objective'),
            p('The objective is the reason for building a system and the organization context in which it will be used.'),
            textarea({ name: 'objective', value: objective, onchange: updateObjective }, []),
            h3('Outcomes'),
            p('Outcomes are the results of the project that will be achieved by the system.'),
            textarea({ name: 'outcomes', value: outcomes, onchange: updateOutcomes }, [])
        ])
    ]))
}

const showNoSlugError = () => {
    page({ title: 'Rationale' }, layout([
        p('No slug identifier provided')
    ]))
}

const showNoGoalsError = () => {
    page({ title: 'Rationale' }, layout([
        p(`No goals found for the provided slug: ${slug}`)
    ]))
}

if (!slug) {
    showNoSlugError()
} else {
    const goals = await repo.getBySlug(slug!)
    if (!goals)
        showNoGoalsError()
    else
        showGoals(goals)
}