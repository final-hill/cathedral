<script lang="ts" setup>
useHead({ title: 'Goals' })
definePageMeta({ name: 'Goals' })

const slug = useRoute().params.slug as string

const links = [
    { name: 'Rationale', icon: 'pi-book', label: 'Rationale' },
    { name: 'Outcomes', icon: 'pi-check-circle', label: 'Outcomes' },
    { name: 'Stakeholders', icon: 'pi-users', label: 'Stakeholders' },
    { name: 'Goal Scenarios', icon: 'pi-briefcase', label: 'Scenarios' },
    { name: 'Obstacles', icon: ' pi-exclamation-triangle', label: 'Obstacles' },
    { name: 'Limitations', icon: 'pi-exclamation-circle', label: 'Limitations' }
]
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an
        organization for which a system must satisfy.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>