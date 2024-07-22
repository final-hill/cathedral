import { MikroORM } from '@mikro-orm/postgresql'
import config from '../../mikro-orm.config.js'

const orm = MikroORM.initSync(config),
    fork = () => orm.em.fork()

export { orm, fork }