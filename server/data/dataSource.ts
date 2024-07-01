import { MikroORM } from "@mikro-orm/better-sqlite";
import config from './mikro-orm.config'

const orm = await MikroORM.init(config)