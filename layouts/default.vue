<template>
    <section id="app">
        <nav id="global-nav">
            <ul>
                <li>
                    <nuxt-link to="/">
                        <PhosphorIconHouseLine size="25" />
                        Home
                    </nuxt-link>
                </li>
                <li>
                    <nuxt-link to="/projects">
                        <PhosphorIconFactory size="25" />
                        Projects
                    </nuxt-link>
                </li>
                <li>
                    <nuxt-link to="/environments">
                        <PhosphorIconCloudFog size="25" />
                        Environments
                    </nuxt-link>
                </li>
            </ul>
        </nav>
        <section id="content">
            <slot />
        </section>
    </section>
</template>

<style>
#app {
    display: grid;
    grid-template-columns: fit-content(1.5in) 1fr;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
}

#global-nav {
    background-color: var(--site-dark-bg);
    box-shadow: 2px 0 5px 0px var(--shadow-color);
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;

    & ul {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
    }

    & li {
        align-items: center;
        border-bottom: 1px solid var(--shadow-color);
        border-top: 1px solid hsla(0, 0%, 100%, 0.1);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        font-size: large;
        height: 0.7in;
        text-shadow: 0 -1px 0px var(--shadow-color);
    }

    & a {
        align-items: center;
        border-right: 0.1in solid var(--site-dark-bg);
        color: var(--font-color);
        display: flex;
        flex-direction: column;
        font-size: 10pt;
        height: 100%;
        justify-content: space-evenly;
        text-decoration: none;
        width: 100%;

        &:hover,
        &:focus {
            background-color: hsla(0, 0%, 100%, 0.03);
        }
    }

    & .router-link-active {
        border-right-color: var(--link-color);
        color: var(--link-color);
    }
}

#content {
    background-color: var(--content-bg);
    overflow: auto;
    padding: 1em 2em;
}
</style>