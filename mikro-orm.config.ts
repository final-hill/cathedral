// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from "dotenv";
import { type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import AssumptionSchema from "./server/data/models/AssumptionSchema.js";
import ConstraintSchema from "./server/data/models/ConstraintSchema.js";
import EffectSchema from "./server/data/models/EffectSchema.js";
import EnvironmentComponentSchema from "./server/data/models/EnvironmentComponentSchema.js";
import FunctionalBehaviorSchema from "./server/data/models/FunctionalBehaviorSchema.js";
import GlossaryTermSchema from "./server/data/models/GlossaryTermSchema.js";
import HintSchema from "./server/data/models/HintSchema.js";
import InvariantSchema from "./server/data/models/InvariantSchema.js";
import JustificationSchema from "./server/data/models/JustificationSchema.js";
import LimitSchema from "./server/data/models/LimitSchema.js";
import NonFunctionalBehaviorSchema from "./server/data/models/NonFunctionalBehaviorSchema.js";
import ObstacleSchema from "./server/data/models/ObstacleSchema.js";
import OutcomeSchema from "./server/data/models/OutcomeSchema.js";
import PersonSchema from "./server/data/models/PersonSchema.js";
import ProductSchema from "./server/data/models/ProductSchema.js";
import SolutionSchema from "./server/data/models/SolutionSchema.js";
import StakeholderSchema from "./server/data/models/StakeholderSchema.js";
import UseCaseSchema from "./server/data/models/UseCaseSchema.js";
import UserStorySchema from "./server/data/models/UserStorySchema.js";
import SystemComponentSchema from "./server/data/models/SystemComponentSchema.js";
import OrganizationSchema from "./server/data/models/OrganizationSchema.js";
import AppRoleSchema from "./server/data/models/AppRoleSchema.js";
import AppUserSchema from "./server/data/models/AppUserSchema.js";
import AppUserOrganizationRoleSchema from "./server/data/models/AppUserOrganizationRoleSchema.js";

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
        connection: {
            ssl: Boolean(process.env.POSTGRES_SSL)
        }
    },
    entities: [
        AppRoleSchema, AppUserOrganizationRoleSchema, AppUserSchema, AssumptionSchema,
        ConstraintSchema, EffectSchema, EnvironmentComponentSchema, FunctionalBehaviorSchema,
        GlossaryTermSchema, HintSchema, InvariantSchema, JustificationSchema, LimitSchema,
        NonFunctionalBehaviorSchema, ObstacleSchema, OrganizationSchema, OutcomeSchema, PersonSchema,
        ProductSchema, SolutionSchema, StakeholderSchema, SystemComponentSchema, UseCaseSchema, UserStorySchema
    ],
    seeder: {},
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        transactional: true
    }
};

export default config;