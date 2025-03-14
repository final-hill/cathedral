<script lang="ts" setup>
import { deSlugify } from '#shared/utils';
import type { DropdownMenuItem } from '@nuxt/ui';

const { data, signIn, signOut } = useAuth(),
    user = data.value?.user,
    router = useRouter()

let getCrumbs = () => {
    const route = router.currentRoute.value,
        crumbs = route.path.split('/').filter((crumb) => crumb !== '');

    return [
        { label: 'Home', to: '/' },
        ...crumbs.map((crumb, index) => {
            return {
                label: deSlugify(crumb),
                to: '/' + crumbs.slice(0, index + 1).join('/')
            };
        })
    ].filter(({ to }) => to !== '/o');
};

const crumbs = ref(getCrumbs());

router.afterEach(() => { crumbs.value = getCrumbs(); });

const avatarFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/g%3E%3C/svg%3E"

const menuItems = ref<DropdownMenuItem[][]>([
    [{
        type: 'label',
        label: user?.name ?? 'Guest',
        avatar: { src: user?.image ?? avatarFallback }
    }], [{
        label: user ? 'Sign Out' : 'Sign In',
        icon: user ? 'i-lucide-user-round-x' : 'i-lucide-user-check',
        onSelect: user ? () => signOut() : () => signIn(undefined)
    }]
])
</script>

<template>
    <nav
        class="top-nav p-2 grid gap-4 items-center ring ring-(--ui-border) rounded-[calc(var(--ui-radius)*2)] bg-(--ui-bg-elevated)/50">
        <NuxtLink to="/" class="site-logo w-8 h-8 justify-self-center">
            <img src="/logo.png" alt="Cathedral Logo" title="Cathedral" />
        </NuxtLink>
        <UBreadcrumb :items="crumbs" class="breadcrumb" />

        <UDropdownMenu :items="menuItems" class="profile-menu">
            <UButton icon="i-lucide-user" variant="outline" color="primary" size="xl" class="justify-self-center" />
        </UDropdownMenu>
    </nav>
</template>
<style>
.top-nav {
    grid-template-columns: 0.5in 1fr 0.5in;
    grid-template-rows: 1fr;
    grid-template-areas: "logo crumbs profile-menu";
    /* border: var(--ui-border); */

    &>.site-logo {
        grid-area: logo;
    }

    &>.breadcrumb {
        grid-area: crumbs;
    }

    &>.profile-menu {
        grid-area: profile-menu;
        cursor: pointer;
    }
}
</style>