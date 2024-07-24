import { MikroORM } from '@mikro-orm/postgresql'
import config from '../../mikro-orm.config.js'

const orm = await MikroORM.init(config),
    fork = () => orm.em.fork()

export { orm, fork }