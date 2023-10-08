<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { EnvironmentStore } from '~/stores/EnvironmentStore'
import { GlossaryStore } from '~/stores/GlossaryStore'
import { GlossaryTerm } from '~/domain/GlossaryTerm'

const route = useRoute(),
    environmentId = route.path.split('/')[2],
    environmentStore = EnvironmentStore(),
    { glossaryId } = environmentStore.getById(environmentId)!,
    glossaryStore = GlossaryStore(),
    glossary = glossaryStore.getById(glossaryId)!,
    terms = glossary.terms

const createTerm = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        term = formData.get('term') as string,
        definition = formData.get('definition') as string
    terms.push(new GlossaryTerm({ term, definition }))
    terms.sort((a, b) => a.term.localeCompare(b.term))
    glossaryStore.update(glossary)
    // terms.value = [...terms.value, new GlossaryTerm({ term, definition })].sort((a, b) =>
    //     a.term.localeCompare(b.term)
    // )
    // glossaryStore.update(glossary)
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
                    <input type="text" name="term" form="new-term" />
                </td>
                <td>
                    <input type="text" name="definition" form="new-term" />
                </td>
                <td>
                    <button form="new-term" class="add-term">Add</button>
                </td>
            </tr>
            <tr v-for="term in terms" :key="term.id">
                <td>{{ term.term }}</td>
                <td>{{ term.definition }}</td>
                <td>
                    <button class="del-term">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.add-term {
    background-color: var(--btn-okay-color);
}

.del-term {
    background-color: var(--btn-danger-color);
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