<script lang="ts" setup>
const items = ref([
    { label: 'Home', icon: 'pi pi-home', route: '/' },
    { label: 'Solutions', icon: 'pi pi-briefcase', route: '/solution' },
    { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
]);
</script>

<template>
    <Menu :model="items">
        <template #item="{ item, props }">
            <nuxt-link :to="item.route">
                <i :class="item.icon" />
                {{ item.label }}
            </nuxt-link>
        </template>
    </Menu>
</template>

<style scoped>
:deep(.p-menu) {
    height: 100vh;
}

a {
    border-left: var(--border-radius) solid var(--primary-color);
    display: inline-block;
    height: 3rem;
    padding: 1rem 0 1rem 1rem;
    text-decoration: none;
    width: 100%;
}
</style>