<script lang="ts" setup>
import mermaid from 'mermaid'

const props = defineProps<{
    value: string
}>(),
    colorMode = useColorMode()

enum themeMap {
    light = 'default',
    dark = 'dark'
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[colorMode.value as keyof typeof themeMap]
})

const diagram = useTemplateRef('diagram')

onMounted(() => {
    mermaid.run({ nodes: [diagram.value!] })
})

watch(() => props.value, () => {
    mermaid.run({ nodes: [diagram.value!] })
})
</script>

<template>
    <section
        ref="diagram"
        class="mermaid"
    >
        {{ props.value }}
    </section>
</template>
