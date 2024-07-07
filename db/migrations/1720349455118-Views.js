
const { getViewDefinitions } = require('../viewDefinitions')

module.exports = class Views1720349455118 {
  name = 'Views1720349455118'

  async up(db) {
    await db.query(`
        CREATE SCHEMA squid_processor;  
    `)
    await db.query(`CREATE TABLE IF NOT EXISTS squid_processor.status (
    id SERIAL PRIMARY KEY,
    height INT
    );`)
    
    const viewDefinitions = getViewDefinitions(db);
    for (const [tableName, viewConditions] of Object.entries(viewDefinitions)) {
      if (Array.isArray(viewConditions)) {
        await db.query(`
          CREATE OR REPLACE VIEW "${tableName}" AS
            SELECT *
            FROM "admin"."${tableName}" AS "this"
            WHERE ${viewConditions.map(cond => `(${cond})`).join(' AND ')}
        `);
      } else {
        await db.query(`
          CREATE OR REPLACE VIEW "${tableName}" AS (${viewConditions})
        `);
      }
    }
  }  

  async down(db) {
    const viewDefinitions = this.getViewDefinitions(db)
    for (const viewName of Object.keys(viewDefinitions)) {
      await db.query(`DROP VIEW "${viewName}"`)
    }
  }
}
