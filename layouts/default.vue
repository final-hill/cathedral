<template>
    <TopNavigation />
    <section id="content" class="surface-ground">
        <slot />
    </section>
    <footer>
        &copy; Final Hill 2024. All rights reserved. |
        Warning: This is Pre-release software. Use at your own risk. Data may be lost.
    </footer>
</template>

<style>
#__nuxt {
    box-shadow: 2px 0 5px 0px var(--shadow-color);
    box-sizing: border-box;
    color: var(--font-color);
    display: grid;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    grid-template-columns: 1fr;
    grid-template-rows: 0.6in 1fr 0.6in;
    grid-template-areas: "top-nav" "content" "footer";
    height: 100vh;
    line-height: 1.5;
    overflow: hidden;
    width: 100vw;

    &>.top-nav {
        grid-area: top-nav;
    }

    &>#content {
        grid-area: content;
        overflow: auto;
        padding: 2em;
    }

    &>footer {
        grid-area: footer;
        padding: 1em;
        color: red;
        text-align: center;
    }
}
</style>