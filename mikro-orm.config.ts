// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from "dotenv";
import { type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import AssumptionSchema from "./server/data/models/requirements/AssumptionSchema.js";
import BehaviorSchema from "./server/data/models/requirements/BehaviorSchema.js";
import ConstraintSchema from "./server/data/models/requirements/ConstraintSchema.js";
import EffectSchema from "./server/data/models/requirements/EffectSchema.js";
import EnvironmentComponentSchema from "./server/data/models/requirements/EnvironmentComponentSchema.js";
import FunctionalBehaviorSchema from "./server/data/models/requirements/FunctionalBehaviorSchema.js";
import GlossaryTermSchema from "./server/data/models/requirements/GlossaryTermSchema.js";
import HintSchema from "./server/data/models/requirements/HintSchema.js";
import InvariantSchema from "./server/data/models/requirements/InvariantSchema.js";
import JustificationSchema from "./server/data/models/requirements/JustificationSchema.js";
import LimitSchema from "./server/data/models/requirements/LimitSchema.js";
import NonFunctionalBehaviorSchema from "./server/data/models/requirements/NonFunctionalBehaviorSchema.js";
import ObstacleSchema from "./server/data/models/requirements/ObstacleSchema.js";
import OutcomeSchema from "./server/data/models/requirements/OutcomeSchema.js";
import ParsedRequirementSchema from "./server/data/models/requirements/ParsedRequirementSchema.js";
import PersonSchema from "./server/data/models/requirements/PersonSchema.js";
import ProductSchema from "./server/data/models/requirements/ProductSchema.js";
import SolutionSchema from "./server/data/models/application/SolutionSchema.js";
import StakeholderSchema from "./server/data/models/requirements/StakeholderSchema.js";
import UseCaseSchema from "./server/data/models/requirements/UseCaseSchema.js";
import UserStorySchema from "./server/data/models/requirements/UserStorySchema.js";
import SilenceSchema from "./server/data/models/requirements/SilenceSchema.js";
import SystemComponentSchema from "./server/data/models/requirements/SystemComponentSchema.js";
import OrganizationSchema from "./server/data/models/application/OrganizationSchema.js";
import AppUserOrganizationRoleSchema from "./server/data/models/application/AppUserOrganizationRoleSchema.js";
import AppUserSchema from "./server/data/models/application/AppUserSchema.js";
import MetaRequirementSchema from "./server/data/models/requirements/MetaRequirementSchema.js";
import NoiseSchema from "./server/data/models/requirements/NoiseSchema.js";

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
            ssl: true
        }
    },
    entities: [
        AppUserSchema, AppUserOrganizationRoleSchema, AssumptionSchema, BehaviorSchema, ConstraintSchema,
        EffectSchema, EnvironmentComponentSchema, FunctionalBehaviorSchema, GlossaryTermSchema,
        HintSchema, InvariantSchema, JustificationSchema, LimitSchema, MetaRequirementSchema,
        NoiseSchema, NonFunctionalBehaviorSchema, ObstacleSchema, OrganizationSchema, OutcomeSchema,
        ParsedRequirementSchema, PersonSchema, ProductSchema, SilenceSchema, SolutionSchema, StakeholderSchema,
        SystemComponentSchema, UseCaseSchema, UserStorySchema
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