<script setup>
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite('idb://cathedral'),
    response = await db.query("select 'Hello world' as message;");
</script>

<template>
    <pre>{{ JSON.stringify(response) }}</pre>
</template>