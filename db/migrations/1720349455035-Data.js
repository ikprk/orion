module.exports = class Data1720349455035 {
    name = 'Data1720349455035'

    async up(db) {
        await db.query(`CREATE TABLE "admin"."user_interaction_count" ("id" character varying NOT NULL, "type" text, "entity_id" text, "day_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "count" integer NOT NULL, CONSTRAINT "PK_8e334a51febcf02c54dff48147d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_b5261af5f3fe48d77086ebc602" ON "admin"."user_interaction_count" ("day_timestamp") `)
        await db.query(`CREATE TABLE "orion_offchain_cursor" ("cursor_name" character varying NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_7083797352af5a21224b6c8ccbc" PRIMARY KEY ("cursor_name"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "admin"."user_interaction_count"`)
        await db.query(`DROP INDEX "admin"."IDX_b5261af5f3fe48d77086ebc602"`)
        await db.query(`DROP TABLE "orion_offchain_cursor"`)
    }
}
