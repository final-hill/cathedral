<script lang="ts" setup>
import { deSlugify } from '#shared/utils';

const { data, signIn, signOut } = useAuth(),
    router = useRouter()

let getCrumbs = () => {
    const route = router.currentRoute.value,
        crumbs = route.path.split('/').filter((crumb) => crumb !== '');

    return [
        { label: 'Home', route: '/' },
        ...crumbs.map((crumb, index) => {
            return {
                label: deSlugify(crumb),
                route: '/' + crumbs.slice(0, index + 1).join('/')
            };
        })
    ].filter(({ route }) => route !== '/o');
};

const crumbs = ref(getCrumbs());

router.afterEach(() => { crumbs.value = getCrumbs(); });

const op = ref();

const toggle = (event: Event) => op.value.toggle(event)
</script>

<template>
    <Menubar class="top-nav">
        <template #start>
            <div class="inline-flex flex-row align-items-center">
                <NuxtLink to="/" class="h-2rem">
                    <img src="/logo.png" alt="Cathedral Logo" title="Cathedral" class="h-full" />
                </NuxtLink>
                <Breadcrumb :model="crumbs" class="h-full py-0">
                    <template #item="{ item, props }">
                        <NuxtLink v-slot="{ href, navigate }" :to="item.route">
                            {{ item.label }}
                        </NuxtLink>
                    </template>
                </Breadcrumb>
            </div>
        </template>
        <template #end>
            <Button type="button" @click="toggle" link>
                <Avatar v-if="data?.user?.image" :image="data?.user?.image ?? undefined" shape="circle" />
                <Avatar v-else icon="pi pi-user" shape="circle" />
            </Button>
        </template>
    </Menubar>

    <OverlayPanel ref="op">
        <p> {{ data?.name }} </p>
        <small> {{ data?.email }} </small>
        <hr>
        <Button v-if="!data?.user" type="button" @click="signIn(undefined)" label="Sign In" icon="pi pi-sign-in" />
        <Button v-else type="button" @click="signOut()" label="Sign Out" icon="pi pi-sign-out" />
    </OverlayPanel>
</template>

<style scoped>
:deep(.p-icon) {
    color: var(--primary-color);
}
</style>