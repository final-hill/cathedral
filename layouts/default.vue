<script lang="ts" setup>
const { $eventBus } = useNuxtApp(),
    toast = useToast(),
    showError = (e: unknown) => {
        let error = ''

        if (e instanceof Error) error = e.message
        else if (typeof e === 'string') error = e
        else error = 'An error occurred. Check the browser console for more details.'

        console.error(error)
        toast.add({
            title: 'Error',
            description: error,
            color: 'error',
            icon: 'i-lucide-octagon-alert'
        })
    }

$eventBus.$on('page-error', showError)
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
        <slot @page-error="showError" />
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
    overflow: hidden;

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
            margin-bottom: 1em;
        }

        & h2 {
            font-size: 1.25em;
            margin-bottom: 0.75em;
        }

        & h3 {
            font-size: 1.1em;
            margin-bottom: 0.5em;
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
