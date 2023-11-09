import { PEGS } from "domain/PEGS.mjs"
import type Repository from "usecases/Repository.mjs"
import html from "lib/html.mjs"
import style from "lib/style.mjs"
import featherIcon from "./featherIcon.mjs"
import { Entity } from "domain/Entity.mjs"

style('pegs-cards', `
.pegs-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
    gap: 0.5in;
}

.pegs-card {
    background-color: var(--site-dark-bg);
    box-shadow: 4px 5px 5px 0px var(--shadow-color);
    padding: 1em;

    & button {
        align-self: center;
        color: var(--btn-danger-color);
        height: fit-content;
        padding: 0.5em;
        width: fit-content;
    }

    & .title {
        margin-top: 0;
    }

    &:first-of-type {
        background-color: transparent;
        border: 1px dashed var(--font-color);
    }
}
`)

const { article, h2, p, button, a, section } = html

const curPath = window.location.pathname

export default (repo: Repository<PEGS>) => {
    const deleteClick = async (e: Event) => {
        e.preventDefault()
        const target = e.target as HTMLButtonElement,
            id = target.dataset.id as PEGS['id'],
            item = (await repo.get(id))!
        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            await repo.delete(item.id)
            refreshCards(elCards)
        }
    }

    const pegsCard = (item: PEGS, hideButton?: boolean) => {
        const delButton = button({
            className: 'btn btn-danger',
            hidden: hideButton,
            onclick: deleteClick
        }, featherIcon('trash-2'))
        delButton.dataset.id = item.id.toString()

        return article({ className: 'pegs-card' }, [
            h2({ className: 'title' },
                a({
                    href: `${curPath}/${item.id === Entity.emptyId ? 'new-entry' : `?slug=${item.slug()}`}`,
                }, item.name)
            ),
            p(item.description),
            delButton
        ])
    }

    const elCards = section({ className: 'pegs-cards' }, []),
        elNewCard = pegsCard(new PEGS({
            id: Entity.emptyId,
            name: 'New Entry',
            description: 'Create a new entry'
        }), true)

    const refreshCards = async (elCards: HTMLElement) => {
        const items = await repo.getAll(),
            newCards = [elNewCard].concat(
                items.map(item => pegsCard(item))
            )

        elCards.replaceChildren(...newCards)
    }

    refreshCards(elCards)

    return elCards
}