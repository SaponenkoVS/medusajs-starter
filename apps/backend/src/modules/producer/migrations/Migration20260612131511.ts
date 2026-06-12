import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260612131511 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "producer" ("id" text not null, "name" text not null, "normalized_name" text not null, "handle" text not null, "country" text not null, "website" text not null, "description" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "producer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_deleted_at" ON "producer" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "producer" cascade;`);
  }

}
