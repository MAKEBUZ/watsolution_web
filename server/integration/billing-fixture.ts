import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invoice } from '../src/domain/invoice.entity';
import { Meter } from '../src/domain/meter.entity';
import { Person } from '../src/domain/person.entity';
import { Address } from '../src/domain/address.entity';
import { ActivityLog } from '../src/domain/activity-log.entity';
import { MobileOperation } from '../src/domain/mobile-operation.entity';
import { User } from '../src/domain/user.entity';
import { Authority } from '../src/domain/authority.entity';
import { AuthSession } from '../src/domain/auth-session.entity';
import { integrationTarget } from './target';

export async function createBillingFixture() {
  const target = integrationTarget();
  const schema = `ws_test_${randomUUID().replace(/-/g, '')}`;
  const db = new DataSource({ type: 'postgres', ...target, schema,
    entities: [Invoice, Meter, Person, Address, ActivityLog, MobileOperation, User, Authority, AuthSession], synchronize: false,
    migrationsRun: false, dropSchema: false, logging: false,
    extra: { max: 24, connectionTimeoutMillis: 5000, application_name: schema, options: `-c search_path=${schema}` } });
  let created = false;
  const close = async () => {
    if (!db.isInitialized) return;
    try {
      if (created && /^ws_test_[a-f0-9]{32}$/.test(schema)) await db.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally { await db.destroy(); }
  };
  try {
    await db.initialize();
    const [identity] = await db.query('SELECT current_database() AS db, current_user AS role');
    if (identity.db !== 'ws_integration' || identity.role !== 'ws_test') throw new Error('Unexpected database identity');
    await db.query(`CREATE SCHEMA "${schema}"`); created = true;
    const audit = '"createdBy" varchar, "createdDate" timestamp DEFAULT now(), "lastModifiedBy" varchar, "lastModifiedDate" timestamp DEFAULT now()';
    // Explicit test schema. Never derive or synchronize a production schema here.
    await db.query(`CREATE TABLE "${schema}".address (
      id serial PRIMARY KEY, ${audit}, neighborhood varchar NOT NULL, street varchar, house_number varchar,
      city varchar NOT NULL, latitude numeric(10,2), longitude numeric(10,2))`);
    await db.query(`CREATE TABLE "${schema}".person (
      id serial PRIMARY KEY, ${audit}, full_name varchar NOT NULL, document_number varchar UNIQUE NOT NULL,
      phone varchar, email varchar, status varchar NOT NULL, created_at timestamp, subscriber_number varchar UNIQUE,
      stratum integer DEFAULT 1, assigned_operator_id integer, user_id varchar, green_points integer DEFAULT 0,
      days_since_last_debt integer DEFAULT 0, savings_percent numeric(5,2) DEFAULT 0,
      "addressId" integer REFERENCES "${schema}".address(id))`);
    await db.query(`CREATE TABLE "${schema}".meter (
      id serial PRIMARY KEY, ${audit}, water_measure numeric(10,2) NOT NULL, reading_date date NOT NULL,
      observation varchar, created_at timestamp, "personId" integer REFERENCES "${schema}".person(id),
      "addressId" integer REFERENCES "${schema}".address(id))`);
    await db.query(`CREATE TABLE "${schema}".invoice (
      id serial PRIMARY KEY, ${audit}, issue_date date NOT NULL, due_date date NOT NULL,
      consumption_m_3 numeric(10,2) NOT NULL, amount_due numeric(10,2) NOT NULL,
      rate_per_m3 numeric(10,2), fixed_charge numeric(10,2), subsidy_percent numeric(5,4),
      additional_charges numeric(10,2), pdf_url varchar, status varchar NOT NULL, created_at timestamp,
      bold_order_id varchar, bold_transaction_id varchar, "meterId" integer REFERENCES "${schema}".meter(id),
      "personId" integer REFERENCES "${schema}".person(id))`);
    await db.query(`CREATE TABLE "${schema}".activity_log (
      id serial PRIMARY KEY, ${audit}, action varchar NOT NULL, description text NOT NULL,
      reference varchar, amount numeric(12,2), person_name varchar, created_at timestamp NOT NULL)`);
    await db.query(`CREATE TABLE "${schema}".mobile_operation (
      id varchar(36) NOT NULL, "userId" integer NOT NULL, "payloadHash" varchar(64) NOT NULL,
      "personId" integer NOT NULL, result text NOT NULL, "createdAt" timestamp NOT NULL,
      PRIMARY KEY (id, "userId"))`);
    await db.query(`CREATE TABLE "${schema}".jhi_authority (name varchar PRIMARY KEY)`);
    await db.query(`CREATE TABLE "${schema}".jhi_user (
      id serial PRIMARY KEY, ${audit}, login varchar UNIQUE NOT NULL, email varchar NOT NULL,
      "firstName" varchar, "lastName" varchar, activated boolean DEFAULT false, "langKey" varchar DEFAULT 'en',
      password varchar NOT NULL, "imageUrl" varchar, "activationKey" varchar, "resetKey" varchar, "resetDate" timestamp)`);
    await db.query(`CREATE TABLE "${schema}".jhi_user_authorities_jhi_authority (
      "jhiUserId" integer REFERENCES "${schema}".jhi_user(id), "jhiAuthorityName" varchar REFERENCES "${schema}".jhi_authority(name),
      PRIMARY KEY ("jhiUserId", "jhiAuthorityName"))`);
    await db.query(`CREATE TABLE "${schema}".auth_session (
      id varchar(36) PRIMARY KEY, "userId" integer NOT NULL REFERENCES "${schema}".jhi_user(id),
      "refreshHash" varchar(64) NOT NULL, "usedRefreshHashes" text NOT NULL DEFAULT '[]',
      "expiresAt" timestamp NOT NULL, revoked boolean NOT NULL DEFAULT false)`);
    await db.query(`CREATE TABLE "${schema}".auth_rate_limit (key varchar PRIMARY KEY, attempts integer NOT NULL, expires_at bigint NOT NULL)`);
    return { db, schema, close };
  } catch (error) { await close(); throw error; }
}
