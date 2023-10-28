<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { EnvironmentRepository } from '~/data/EnvironmentRepository'

const route = useRoute(),
    repo = new EnvironmentRepository(),
    environment = await repo.getBySlug(route.path.split('/')[2]),
    glossary = environment?.glossary,
    terms = ref(glossary.terms)

const createTerm = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        term = formData.get('term') as string,
        definition = formData.get('definition') as string
    terms.value.push({ term, definition })
    repo.update(environment)
    terms.value.sort((a, b) => a.term.localeCompare(b.term))
    form.reset()
}
</script>

<template>
    <h2>Glossary</h2>

    <form id="new-term" @submit="createTerm" autocomplete="off"></form>
    <table>
        <thead>
            <tr>
                <th>Term</th>
                <th>Definition</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr class="new-term-row">
                <td>
                    <input type="text" name="term" required form="new-term" />
                </td>
                <td>
                    <input type="text" name="definition" form="new-term" />
                </td>
                <td>
                    <button form="new-term" class="add-term">Add</button>
                </td>
            </tr>
            <tr v-for="term in terms" :key="term.term">
                <td>{{ term.term }}</td>
                <td>{{ term.definition }}</td>
                <td>
                    <button class="delete-button">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.add-term {
    background-color: var(--btn-okay-color);
}

tr td:last-child {
    padding: 0;
}

.new-term-row {
    & td {
        padding: 0;
    }

    & input {
        background-color: white;
        color: black;
    }
}
</style>