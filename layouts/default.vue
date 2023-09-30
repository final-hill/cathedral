<template>
    <section id="app">
        <nav id="global-nav">
            <ul>
                <li>
                    <nuxt-link to="/">
                        <Icon name="ph:house" />
                        Home
                    </nuxt-link>
                </li>
                <li>
                    <nuxt-link to="/create">
                        <Icon name="ph:plus-circle" />
                        Create
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
    grid-template-columns: 1in 1fr;
    overflow: hidden;
}

#global-nav {
    background-color: var(--site-dark-bg);
    box-shadow: 2px 0 5px 0px var(--shadow-color);
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    width: 1in;

    & ul {
        display: flex;
        flex-direction: column;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    & li {
        align-items: center;
        border-bottom: 1px solid var(--shadow-color);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
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
            background-color: rgba(255, 255, 255, 0.03);
        }
    }

    & .icon {
        font-size: 20pt;
    }

    & .router-link-active {
        border-right-color: var(--link-color);
        color: var(--link-color);
    }
}

#content {
    padding-left: 1em;
}
</style>