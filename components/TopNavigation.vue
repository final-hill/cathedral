<script lang="ts" setup>
import deSlugify from '~/lib/deSlugify';

const router = useRouter()

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
    ];
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