<script lang="ts" setup>
import { Environment } from '~/domain/Environment';
import { Glossary } from '~/domain/Glossary';
import { slugify } from '~/domain/slugify';
import { EnvironmentRepository } from '~/data/EnvironmentRepository';

const environmentRepo = new EnvironmentRepository(),
    router = useRouter();

const name = ref(''),
    slug = computed(() => slugify(name.value)),
    description = ref('')

// refactor to use the slug property of the entity

const createEnvironment = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form)

    const environment = new Environment({
        id: self.crypto.randomUUID(),
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        glossary: new Glossary({
            id: self.crypto.randomUUID(),
            terms: []
        })
    })
    environmentRepo.add(environment)

    router.push(`/environments/${environment.slug()}`)
}
</script>

<template>
    <h1>New Environment</h1>
    <form class="environment-form" autocomplete="off" @submit="createEnvironment">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" :maxlength="Environment.MAX_NAME_LENGTH" v-model="name"
            placeholder="Sample Environment" required />

        <label>Slug</label>
        <span>{{ slug }}</span>
        <label for="description">Description</label>
        <input type="text" id="description" name="description" :maxlength="Environment.MAX_DESCRIPTION_LENGTH"
            placeholder="A description of the environment" v-model="description" />

        <span id="actions">
            <button type="submit">Create</button>
            <button type="button" @click="$router.push('/environments')">Cancel</button>
        </span>
    </form>
</template>

<style scoped>
.environment-form {
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