<script lang="ts" setup>
import { PGlite } from "@electric-sql/pglite";

const appConfig = useAppConfig(),
    conn = new PGlite(appConfig.connString),
    sql = ref<string>(""),
    results = ref<Record<string, any>[]>([]),
    error = ref<string>(""),
    tables = ref<string[]>([]),
    selectedQuery = ref(""),
    sampleQueries = ref([
        { label: "All Tables", value: "SELECT * FROM pg_tables WHERE schemaname = 'cathedral';" },
        { label: "Drop Schema", value: "DROP SCHEMA cathedral CASCADE;" }
    ]);

const runSql = async () => {
    try {
        error.value = "";
        results.value = (await conn.query<Record<string, any>>(sql.value)).rows;

        getTables();
    } catch (err) {
        error.value = `${err}`;
        results.value = [];
    }
}

const getTables = async () => {
    const sql = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'cathedral'
        ORDER BY table_name;
    `;

    tables.value = (await conn.query<{ table_name: string }>(sql))
        .rows.map(row => `cathedral.${row.table_name}`);
}

const selectSampleQuery = (query: string) => {
    sql.value = query;
}

onMounted(() => {
    getTables();
});
</script>

<template>
    <h1>SQL Debugger</h1>

    <table>
        <tr>
            <td>
                <h2>Tables</h2>
                <ul>
                    <li v-for="table in tables">{{ table }}</li>
                </ul>
            </td>
            <td>
                <h2>Sample Queries</h2>
                <select v-model="selectedQuery" @change="selectSampleQuery(selectedQuery)">
                    <option value="">Sample Queries</option>
                    <option v-for="query in sampleQueries" :value="query.value">{{ query.label }}</option>
                </select>
                <br>
                <InputText v-model="sql" />
                <div>
                    <Button @click="runSql">Run</Button>
                    <Button @click="sql = ''; results = [];">Clear</Button>
                </div>
            </td>
        </tr>
    </table>

    <h2>Result</h2>

    <pre v-if="results.length">
        {{ JSON.stringify(results, null, 2) }}
    </pre>
    <p v-if="error">{{ error }}</p>
    <p v-else>No results</p>
</template>
