<script lang="ts" setup>
</script>

<template>
    <header>
        <TopNavigation />
    </header>
    <UContainer
        id="content"
        as="main"
        class="flex flex-col p-8 overflow-auto leading-6 space-y-8"
    >
        <slot />
    </UContainer>
    <footer>
        &copy; {{ new Date().getFullYear() }} Final Hill. All rights reserved. |
        Warning: This is Pre-release software. Use at your own risk. Data may be lost.
    </footer>
</template>

<style>
#__nuxt {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 0.6in 1fr 0.6in;
    grid-template-areas: "header" "content" "footer";
    height: 100vh;

    /* box-shadow: 2px 0 5px 0px var(--shadow-color);
    line-height: 1.5;
    width: 100vw; */

    & a:hover {
        text-decoration: underline;
    }

    & > header {
        grid-area: header;
    }

    & > #content {
        grid-area: content;

        & h1 {
            font-size: 1.5em;
        }

        & h2 {
            font-size: 1.25em;
        }

        & h3 {
            font-size: 1.1em;
        }
    }

    & > footer {
        grid-area: footer;
        padding: 1em;
        color: var(--ui-error);
        text-align: center;
    }
}
</style>
