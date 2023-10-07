<script setup lang="ts">
import { EnvironmentStore } from '~/stores/EnvironmentStore'

const route = useRoute(),
    environmentStore = EnvironmentStore(),
    environment = environmentStore.getById(route.path.split('/')[2])!
</script>

<template>
    <h2>{{ environment.name }}</h2>
    <ul class="mini-cards">
        <li>
            <nuxt-link :to="`/environments/${environment.id}/glossary`">
                <PhosphorIconBookOpenText size="25" />
                Glossary
            </nuxt-link>
        </li>
    </ul>
</template>

<style>
.mini-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    margin: 0;
    padding: 0;

    & li {
        align-items: center;
        background-color: var(--site-dark-bg);
        border-radius: 0.5rem;
        box-shadow: 0 0 5px 0px var(--shadow-color);
        display: flex;
        flex-direction: column;
        margin: 0.5rem;
        padding: 1rem;
        width: 10rem;

        & a {
            align-items: center;
            color: var(--site-light-bg);
            display: flex;
            flex-direction: column;
            text-decoration: none;
            width: 100%;
        }
    }
}
</style>