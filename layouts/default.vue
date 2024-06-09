<template>
    <GlobalNavigation />
    <TopNavigation />
    <section id="content" class="surface-ground">
        <slot />
    </section>
</template>

<style>
#__nuxt {
    box-shadow: 2px 0 5px 0px var(--shadow-color);
    box-sizing: border-box;
    color: var(--font-color);
    display: grid;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    grid-template-columns: fit-content(1.5in) 1fr;
    grid-template-rows: 0.5in 1fr;
    grid-template-areas: "global-nav breadcrumb" "global-nav content";
    height: 100vh;
    line-height: 1.5;
    overflow: hidden;
    width: 100vw;

    &>.p-menu {
        grid-area: global-nav;
        height: 100vh;
    }

    &>.p-breadcrumb {
        grid-area: breadcrumb;
    }

    &>#content {
        grid-area: content;
        overflow: auto;
        padding: 1em 2em;
    }
}
</style>