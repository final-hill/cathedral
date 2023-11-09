import { Goals } from 'domain/Goals.mjs';
import { qs } from 'lib/query.mjs';
import slugify from 'lib/slugify.mjs';
import { GoalsRepository } from 'data/GoalsRepository.mjs';
import { Stakeholders } from 'domain/Stakeholders.mjs';
import layout from "layouts/BaseLayout.mjs";
import page from 'lib/page.mjs';
import html from 'lib/html.mjs';
import style from 'lib/style.mjs';

const repo = new GoalsRepository()

const { form, label, input, span, button } = html

const createGoals = async (e: SubmitEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        goals = new Goals({
            id: self.crypto.randomUUID(),
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            objective: '',
            outcomes: '',
            situation: '',
            stakeholders: new Stakeholders({
                id: self.crypto.randomUUID(),
                stakeholders: []
            }),
            functionalBehaviors: []
        })

    await repo.add(goals)
    document.location.href = `/goals/?slug=${goals.slug()}`
}

const renderSlug = (e: Event) => {
    const name = (e.target as HTMLInputElement).value,
        slug = slugify(name),
        slugInput = qs<HTMLInputElement>('#slug')!
    slugInput.value = slug
}

const cancel = () => {
    window.location.href = '/goals'
}

style('new-goals', `
.goals-form {
    display: grid;
    grid-template-columns: 20% 1fr;
    grid-gap: 1rem;
    margin: 1rem;

    & label {
        display: block;
    }

    & label[for="name"]::after {
        content: ' *';
        color: red;
    }

    & input {
        max-width: 80%;
        width: 40em;
    }

    & button {
        width: 2in;
    }

    & button[type="submit"] {
        background-color: var(--btn-okay-color);
    }

    & #actions {
        grid-column: 2;
        display: flex;
        justify-content: space-between;
        max-width: 4.5in;
    }
}
`)

page({ title: 'New Goals' }, layout([
    form({
        className: 'goals-form',
        autocomplete: 'off',
        onsubmit: createGoals,
        onreset: cancel
    }, [
        label({ htmlFor: 'name' }, 'Name'),
        input({
            type: 'text', name: 'name', id: 'name', required: true,
            placeholder: 'My Goals', maxLength: Goals.MAX_NAME_LENGTH,
            oninput: renderSlug
        }, []),
        label({ htmlFor: 'slug' }, 'Slug'),
        input({ type: 'text', name: 'slug', id: 'slug', readOnly: true }, []),
        label({ htmlFor: 'description' }, 'Description'),
        input({
            type: 'text', name: 'description', id: 'description',
            placeholder: 'A description of my goals', maxLength: Goals.MAX_DESCRIPTION_LENGTH
        }, []),
        span({ id: 'actions' }, [
            button({ type: 'submit' }, 'Create'),
            button({ type: 'reset' }, 'Cancel')
        ])
    ])
]))