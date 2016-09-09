exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTable('aros', function(table) {
      table.increments('id');
      table.string('alias', 100).notNullable()
        .unique('un_aros_alias');
      table.timestamps();
    }),

    knex.schema.createTable('acos', function(table) {
      table.increments('id');
      table.string('alias', 100).notNullable()
        .unique('un_acos_alias');
      table.timestamps();
    }),

    knex.schema.createTable('permissions', function(table) {
      table.increments('id');
      table.integer('aro_id').notNullable();
      table.integer('aco_id').notNullable();
      table.unique(['aro_id', 'aco_id'], 'un_permissions');
      table.timestamps();
    }),

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('aros'),
    knex.schema.dropTable('acos'),
    knex.schema.dropTable('permissions'),
  ]);
};
