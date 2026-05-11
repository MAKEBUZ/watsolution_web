import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormLogger = new Logger('OrmConfig');
import { SeedUsersRoles1570200490072 } from './migrations/1570200490072-SeedUsersRoles';
import { CreateTables1570200270081 } from './migrations/1570200270081-CreateTables';
import { AddInvoiceRateFields1747000000000 } from './migrations/1747000000000-AddInvoiceRateFields';
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
  const backendEnv = process.env.BACKEND_ENV || 'prod';

  if (backendEnv === 'prod') {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      ormLogger.error('DATABASE_URL is not set! Add it in Railway → service → Variables tab as ${{Postgres.DATABASE_URL}}');
    } else {
      ormLogger.log(`Connecting to: ${dbUrl.replace(/:([^:@]+)@/, ':***@')}`);
    }
    ormconfig = {
      name: 'default',
      type: 'postgres',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('pg'),
      url: dbUrl,
      logging: false,
    };
  } else if (backendEnv === 'test') {
    ormconfig = {
      name: 'default',
      type: 'sqlite',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: ':memory:',
      logging: true,
    };
  } else if (backendEnv === 'dev') {
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
    synchronize: backendEnv === 'test' || backendEnv === 'prod',
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
      AddInvoiceRateFields1747000000000,
      // jhipster-needle-add-migration-to-ormconfig-migrations - JHipster will add code here, do not remove
    ],
    autoLoadEntities: true,
    ...ormconfig,
  };
}

export { ormConfig };
