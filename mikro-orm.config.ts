// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from "dotenv";
import { type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import {
    AppUser, AppUserOrganizationRole, Assumption, Behavior, Constraint, Effect, EnvironmentComponent,
    FunctionalBehavior, GlossaryTerm, Hint, Invariant, Justification, Limit, MetaRequirement, Noise,
    NonFunctionalBehavior, Obstacle, Outcome, Organization, ParsedRequirement, Person, Product,
    Requirement, Scenario, Silence, Solution, Stakeholder, SystemComponent, UseCase, UserStory
} from "./server/domain/index.js";

dotenv.config();
const config: Options = {
    extensions: [Migrator],
    driver: PostgreSqlDriver,
    dbName: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    host: process.env.POSTGRES_HOST!,
    password: process.env.POSTGRES_PASSWORD!,
    port: parseInt(process.env.POSTGRES_PORT!),
    // https://github.com/mikro-orm/mikro-orm/issues/303
    driverOptions: {
        connection: { ssl: true }
    },
    entities: [
        AppUser, AppUserOrganizationRole, Assumption, Behavior, Constraint,
        Effect, EnvironmentComponent, FunctionalBehavior, GlossaryTerm,
        Hint, Invariant, Justification, Limit, MetaRequirement, Noise,
        NonFunctionalBehavior, Obstacle, Organization, Outcome,
        ParsedRequirement, Person, Product, Requirement, Scenario, Silence, Solution,
        Stakeholder, SystemComponent, UseCase, UserStory
    ],
    discovery: { disableDynamicFileAccess: true },
    seeder: {},
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        transactional: true
    }
};

export default config;