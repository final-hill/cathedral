<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'

const { loggedIn, user, session: _session, fetch: _fetch, clear } = useUserSession(),
    router = useRouter(),
    getCrumbs = () => {
        const route = router.currentRoute.value,
            crumbs = route.path.split('/').filter(crumb => crumb !== '')

        return [
            { label: 'Home', to: '/' },
            // eslint-disable-next-line max-params
            ...crumbs.map((crumb, index) => {
                return {
                    label: deSlugify(crumb),
                    to: '/' + crumbs.slice(0, index + 1).join('/')
                }
            })
        ].filter(({ to }) => to !== '/o')
    },
    crumbs = ref(getCrumbs())

router.afterEach(() => {
    crumbs.value = getCrumbs()
})

const handleSignOut = async () => {
        await clear()
        await navigateTo('/api/auth/logout', { external: true })
    },
    avatarFallback = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1em\' height=\'1em\' viewBox=\'0 0 24 24\'%3E%3Cg fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\'%3E%3Cpath d=\'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\'/%3E%3Ccircle cx=\'12\' cy=\'7\' r=\'4\'/%3E%3C/g%3E%3C/svg%3E',
    menuItems = ref<DropdownMenuItem[][]>([
        [{
            type: 'label',
            class: 'profile-menu_user-name',
            label: user.value?.name ?? 'Anonymous',
            avatar: { src: avatarFallback }
        }], [{
            type: 'label',
            class: 'profile-menu_user-email',
            label: user.value?.email ?? 'anonymous@example.com'
        }], [{
            label: 'Sign Out',
            class: 'profile-menu_sign-out',
            icon: 'i-lucide-user-round-x',
            onSelect: async () => await handleSignOut()
        }]
    ]),
    updateMenuItems = () => {
        if (loggedIn.value) {
            menuItems.value = [
                [{
                    type: 'label',
                    class: 'profile-menu_user-name',
                    label: user.value?.name ?? 'Anonymous',
                    avatar: { src: avatarFallback }
                }], [{
                    type: 'label',
                    class: 'profile-menu_user-email',
                    label: user.value?.email ?? 'anonymous@example.com'
                }], [{
                    label: 'Sign Out',
                    class: 'profile-menu_sign-out',
                    icon: 'i-lucide-user-round-x',
                    onSelect: async () => await handleSignOut()
                }]
            ]
        } else {
            menuItems.value = [
                [{
                    type: 'label',
                    class: 'profile-menu_user-name',
                    label: 'Anonymous',
                    avatar: { src: avatarFallback }
                }], [{
                    type: 'label',
                    class: 'profile-menu_user-email',
                    label: 'anonymous@example.com'
                }], [{
                    label: 'Sign In',
                    class: 'profile-menu_sign-in',
                    icon: 'i-lucide-user-check',
                    onSelect: async () => await navigateTo('/auth/entra-external-id', { external: true })
                }]
            ]
        }
    }

watch(user, updateMenuItems, { immediate: true })
watch(loggedIn, updateMenuItems)
</script>

<template>
    <nav class="top-navigation p-2 grid gap-4 items-center ring ring-default rounded-lg bg-elevated/50 grid-cols-[0.5in_1fr_0.5in] grid-rows-1 [grid-template-areas:'logo_crumbs_profile-menu']">
        <NuxtLink
            to="/"
            class="site-logo w-8 h-8 justify-self-center [grid-area:logo]"
        >
            <img
                src="/logo.png"
                alt="Cathedral Logo"
                title="Cathedral"
            >
        </NuxtLink>
        <UBreadcrumb
            :items="crumbs"
            class="breadcrumb [grid-area:crumbs]"
        />

        <AuthState v-slot="{ loggedIn: userLoggedIn }">
            <UDropdownMenu
                v-if="userLoggedIn"
                :items="menuItems"
                class="profile-menu cursor-pointer [grid-area:profile-menu]"
                data-testid="profile-menu"
            >
                <UButton
                    icon="i-lucide-user"
                    variant="outline"
                    color="primary"
                    size="xl"
                    class="justify-self-center"
                    data-testid="profile-button"
                />
            </UDropdownMenu>
        </AuthState>
    </nav>
</template>
