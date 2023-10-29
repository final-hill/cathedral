<script lang="ts" setup>
import { Goals } from '~/domain/Goals';
import { slugify } from '~/domain/slugify';
import { GoalsRepository } from '~/data/GoalsRepository';
import { Stakeholders } from '~/domain/Stakeholders';

const repo = new GoalsRepository(),
    router = useRouter();

const name = ref(''),
    slug = computed(() => slugify(name.value)),
    description = ref('')

const createGoals = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form);

    const goals = new Goals({
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
    repo.add(goals)
    router.push(`/goals/${goals.slug()}`)
}

</script>

<template>
    <h1>New Goals</h1>
    <form class="goals-form" autocomplete="off" @submit="createGoals">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" :maxlength="Goals.MAX_NAME_LENGTH" v-model="name" placeholder="My Goals"
            required />

        <label>Slug</label>
        <span>{{ slug }}</span>
        <label for="description">Description</label>
        <input type="text" id="description" name="description" :maxlength="Goals.MAX_DESCRIPTION_LENGTH"
            placeholder="A description of Goals" v-model="description" />

        <span id="actions">
            <button type="submit">Create</button>
            <button type="button" @click="$router.push('/goals')">Cancel</button>
        </span>
    </form>
</template>

<style scoped>
.goals-form {
    display: grid;
    grid-template-columns: 20% 1fr;
    grid-gap: 1rem;
    margin: 1rem;
}

label {
    display: block;
}

label[for="name"]::after {
    content: ' *';
    color: red;
}

input {
    max-width: 80%;
    width: 40em;
}

button {
    width: 2in;
}

button[type="submit"] {
    background-color: var(--btn-okay-color);
}

#actions {
    grid-column: 2;
    display: flex;
    justify-content: space-between;
    max-width: 4.5in;
}
</style>