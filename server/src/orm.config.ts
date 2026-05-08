import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormLogger = new Logger('OrmConfig');
import { SeedUsersRoles1570200490072 } from './migrations/1570200490072-SeedUsersRoles';
import { CreateTables1570200270081 } from './migrations/1570200270081-CreateTables';
import { User } from './domain/user.entity';
import { Authority } from './domain/authority.entity';
import { Address } from './domain/address.entity';
import { Person } from './domain/person.entity';
import { Meter } from './domain/meter.entity';
import { Invoice } from './domain/invoice.entity';
import { Noticia } from './domain/noticia.entity';
import { Reporte } from './domain/reporte.entity';
import { ActivityLog } from './domain/activity-log.entity';
// jhipster-needle-add-entity-to-ormconfig-imports - JHipster will add code here, do not remove

function ormConfig(): TypeOrmModuleOptions {
  let ormconfig: TypeOrmModuleOptions;

  if (process.env.BACKEND_ENV === 'prod') {
    ormconfig = {
      name: 'default',
      type: 'postgres',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('pg'),
      url: process.env.DATABASE_URL,
      logging: false,
    };
  } else if (process.env.BACKEND_ENV === 'test') {
    ormconfig = {
      name: 'default',
      type: 'sqlite',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: ':memory:',
      logging: true,
    };
  } else if (process.env.BACKEND_ENV === 'dev') {
    const dbUrl = process.env.DATABASE_PUBLIC_URL;
    ormLogger.log(`Connecting to: ${dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':***@') : 'UNDEFINED – check server/.env'}`);
    ormconfig = {
      name: 'default',
      type: 'postgres',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('pg'),
      url: dbUrl,
      ssl: { rejectUnauthorized: false },
      logging: false,
    };
  } else {
    ormconfig = {
      name: 'default',
      type: 'sqlite',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: `${__dirname}../../target/db/sqlite-dev-db.sql`,
      logging: true,
    };
  }

  return {
    synchronize: process.env.BACKEND_ENV === 'test' || process.env.BACKEND_ENV === 'prod',
    migrationsRun: true,
    entities: [
      User,
      Authority,
      Address,
      Person,
      Meter,
      Invoice,
      Noticia,
      Reporte,
      ActivityLog,
      // jhipster-needle-add-entity-to-ormconfig-entities - JHipster will add code here, do not remove
    ],
    migrations: [
      CreateTables1570200270081,
      SeedUsersRoles1570200490072,
      // jhipster-needle-add-migration-to-ormconfig-migrations - JHipster will add code here, do not remove
    ],
    autoLoadEntities: true,
    ...ormconfig,
  };
}

export { ormConfig };
