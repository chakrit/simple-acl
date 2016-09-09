var async = require('async');
var bookshelf = require('bookshelf');
var knex = require('knex');

var dbName = function(model, field) {
  var arr = [];
  if (typeof this[model] !== 'undefined') {
    arr.push(this[model].prototype.tableName);
  }
  if (field) {
    arr.push(field);
  }
  return arr.join('.');
}

var tableName = function(table, prefix) {
  return prefix ? prefix + table : table;
}

// bookshelf-store.js - bookshelf.js adapter for simple-acl
module.exports = (function() {

  var Store = function(config, prefix) {
    var self = this;
    var driver = knex(config)
    var orm = bookshelf(driver);
    var Aro, Aco, Permission;

    this.dbName = dbName.bind(this);

    this.Aro = Aro = orm.Model.extend({
      tableName: tableName('aros', prefix),
      hasTimestamps: true,
    });

    this.Permission = Permission = orm.Model.extend({
      tableName: tableName('permissions', prefix),
      hasTimestamps: true,
    });

    this.Aco = Aco = orm.Model.extend({
      tableName: tableName('acos', prefix),
      hasTimestamps: true,
    });

    this.Aro.getByAlias = function(alias) {
      return new Aro({alias: alias}).fetch();
    }

    this.Aco.getByAlias = function(alias) {
      return new Aco({alias: alias}).fetch();
    }

    this._getPermission = function(grantee, resource) {
      return new Promise(function(resolve, reject) {
        Aro.getByAlias(grantee).then(function(aro) {
          Aco.getByAlias(resource).then(function(aco) {
            resolve({aro: aro, aco: aco});
          })
        })
      })
    }

    this._grant = function(aro, aco, callback) {
      Permission.forge({aro_id: aro.id, aco_id: aco.id}).fetch()
        .then(function(result) {
          if (result) {
            return callback ? callback(null, true) : null;
          }
          this.save().then(function(result) {
            return callback ? callback(null, result !== null) : result !== null;
          }).catch(function(err) {
            return callback ? callback(err) : err;
          });
        }).catch(function(err) {
          return callback ? callback(err) : err;
        });
    }

  };

  Store.prototype =
    { 'createAro':
      function(grantee, callback) {
        return new this.Aro({alias: grantee}).fetch().then(function(result) {
          if (result) {
            return callback ? callback(null, result) : result;
          }
          this.save().then(function(result) {
            return callback ? callback(null, result) : result;
          });
        }).catch(function(err) {
          return callback ? callback(err) : err;
        });
      }

    , 'createAco':
      function(resource, callback) {
        return new this.Aco({alias: resource}).fetch().then(function(result) {
          if (result) {
            return callback(null, result)
          }
          this.save().then(function(result) {
            return callback(null, result)
          })
        }).catch(function(err) {
          return callback(err);
        });
      }

    , 'grant':
      function(grantee, resource, callback) {
        var self = this;
        this._getPermission(grantee, resource).then(function(result) {
          var ctx = { aro: result.aro, aco: result.aco }
          async.series({
            createAro: function(next) {
              if (ctx.aro) {
                return next();
              }
              self.createAro(grantee, function(err, aro) {
                ctx.aro = aro;
                return next();
              });
            },

            createAco: function(next) {
              if (ctx.aco) {
                return next();
              }
              self.createAco(resource, function(err, aco) {
                ctx.aco = aco;
                return next();
              });
            },

            createGrant: function(next) {
              self._grant(ctx.aro, ctx.aco, callback);
              return next()
            },
          });
        }).catch(function(err) {
          callback(err);
        })
      }

    , 'assert':
      function(grantee, resource, callback) {
        var self = this;
        var promises = [];
        var dbName = self.dbName;

        var conditions = {};
        conditions[dbName('Aro', 'alias')] = grantee;
        conditions[dbName('Aco', 'alias')] = resource;

        this.Permission.query(function(qb) {
          qb
            .innerJoin(dbName('Aro'), function() {
              this.on(dbName('Permission', 'aro_id'), '=', dbName('Aro', 'id'));
            })
            .innerJoin(dbName('Aco'), function() {
              this.on(dbName('Permission', 'aco_id'), '=', dbName('Aco', 'id'));
            });
        }).where(conditions).fetch().then(function(result) {
          return callback(null, result !== null);
        }).catch(function(err) {
          return callback(err);
        });

      }

    , 'revoke':
      function(grantee, resource, callback) {
        var self = this;
        this._getPermission(grantee, resource).then(function(result) {
          if (!result) {
            return callback(false);
          }
          return self.Permission.where({
            aro_id: result.aro.id,
            aco_id: result.aco.id,
          }).destroy().then(function(result) {
            return callback(null, result);
          }).catch(function(err) {
            return callback(err, result);
          });
        });
      }
    };

  return Store;

})();
