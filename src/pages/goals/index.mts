import layout from "layouts/BaseLayout.mjs";
import page from "lib/page.mjs";
import html from "lib/html.mjs";
import pegsCards from "components/pegsCards.mjs";
import { GoalsRepository } from "data/GoalsRepository.mjs";
import miniCards from "components/miniCards.mjs";

const repo = new GoalsRepository(),
    slug = new URL(document.location.href).searchParams.get('slug'),
    { p } = html

if (!slug) {
    page({ title: 'Goals' }, layout([
        p(
            `Goals are the desired outcomes and needs of an
             organization for which a system must satisfy.`
        ),
        pegsCards(repo)
    ]))
    // TODO: replace this with a service worker based solution
    // don't use a url parameter, just the slug as part of the path
} else {
    const goals = await repo.getBySlug(slug)

    if (!goals) {
        page({ title: 'Goals' }, layout([
            p(`No goals found for slug ${slug}`)
        ]))
    } else {
        page({
            title: `Goals: ${goals.name}`
        }, layout([
            miniCards([
                { title: 'Rationale', icon: 'book-open', url: `/goals/rationale?slug=${slug}` },
                { title: 'Functionality', icon: 'activity', url: `/goals/functionality?slug=${slug}` },
                { title: 'Stakeholders', icon: 'users', url: `/goals/stakeholders?slug=${slug}` }
            ])
        ]))
    }
}