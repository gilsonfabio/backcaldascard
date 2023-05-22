// Update with your config settings.
module.exports = {

  development: {
    client: '',
    connection: {
      host : 'sindicaldas.mysql.dbaas.com.br',
      database: 'sindicaldas',
      user: 'sindicaldas',
      password: 'Admin@3112'
    },
    migrations: {
      directory: ''
    },
    useNullAsDefault: true,
  },

  staging: {
    client: '',
    connection: {
      database: '',
      user:     '',
      password: ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: ''
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host : 'sindicaldas.mysql.dbaas.com.br',
      database: 'sindicaldas',
      user: 'sindicaldas',
      password: 'Admin@3112'
    },
    
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations'
    },
    useNullAsDefault: true,
  },

};