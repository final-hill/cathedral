<script setup lang="ts">
const props = defineProps({
    url: {
        type: String,
        required: true
    }
})
</script>

<style scoped>
li {
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
</style>

<template>
    <li>
        <nuxt-link :to="props.url">
            <slot></slot>
        </nuxt-link>
    </li>
</template>