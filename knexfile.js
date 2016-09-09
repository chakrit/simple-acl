// Update with your config settings.

module.exports = {

  dev_mysql: {
    client: 'mysql',
    connection: {
      database: 'test_sacl',
      user:     'root',
      password: 'password',
      timezone: 'UTC'
    },
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    //debug: true,
  },

  dev_sqlite3: {
    client: 'sqlite3',
    connection: {
      filename: './test/test-sacl.db',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    //debug: true,
  },

  dev_pg: {
    client: 'pg',
    connection: {
      database: 'test_sacl',
      user:     'root',
      password: 'password',
    },
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    //debug: true,
  },

};
