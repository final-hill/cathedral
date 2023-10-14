<style scoped>
.mini-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    margin: 0;
    padding: 0;
}
</style>

<template>
    <ul class="mini-cards">
        <slot></slot>
    </ul>
</template>