<script lang="ts" setup>
const router = useRouter()

let getCrumbs = () => {
    const route = router.currentRoute.value,
        crumbs = route.path.split('/').filter((crumb) => crumb !== '');

    return [{ label: 'Home', route: '/' }].concat(
        crumbs.map((crumb, index) => {
            const crumbRoute = router.resolve({ path: '/' + crumbs.slice(0, index + 1).join('/') });

            return {
                label: (crumbRoute.name ?? '{Untitled}').toString(),
                route: '/' + crumbs.slice(0, index + 1).join('/')
            };
        })
    )
};

const crumbs = ref(getCrumbs());

router.afterEach(() => { crumbs.value = getCrumbs(); });
</script>

<template>
    <Breadcrumb :model="crumbs">
        <template #item="{ item, props }">
            <NuxtLink v-slot="{ href, navigate }" :to="item.route">
                {{ item.label }}
            </NuxtLink>
        </template>
    </Breadcrumb>
</template>

<style scoped>
:deep(.p-icon) {
    color: var(--primary-color);
}
</style>