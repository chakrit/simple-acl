
// store.js - Tests for the the stores.
(function() {

  var assert = require('assert')
    , async = require('async')
    , acl = require('..')
    , knexConfig = require('../knexfile');

  var loadStore = function(name, module) {
    try {
      require.resolve(module);
      acl[name] = function() {
        var config = knexConfig['dev_' + module];
        return new acl.BookshelfStore(config)
      };
      stores.push(name);
    } catch (e) {
      console.log('Not loading ' + name, e.toString());
    }
  }

  // temp string
  var G = 'grantee', R = 'resource'
    , funcs = 'grant,assert,revoke'.split(',');

  var stores = ['MemoryStore', 'RedisStore'];

  loadStore('MysqlStore', 'mysql');
  loadStore('SqliteStore', 'sqlite3');
  loadStore('PgStore', 'pg');

  for (var i in stores) (function(storeName) {
    var Store = acl[storeName];

    // tests
    describe(storeName, function() {
      before(function() {
        this.oldStore = acl.store;
        this.store = new Store();
        acl.use(this.store);
      });

      after(function() {
        acl.use(this.oldStore);
        delete this['oldStore'];
        delete this['store'];
      });

      for (var i in funcs) (function(func) {
        it('should exports the ' + func + '() function', function() {
          assert(func in this.store);
          assert(typeof this.store[func] === 'function');
        });
      })(funcs[i]);

      describe('asserting right away', function() {
        before(function(done) { var me = this;
          acl.assert(G, R, function(e, success) {
            done(e, me.success = success);
          });
        });

        it('should returns false', function() {
          assert(this.success === false);
        });
      });

      describe('granting permission', function() {
        before(function(done) { acl.grant(G, R, done); });
        after(function(done) { acl.revoke(G, R, done); });

        it('should causes assert() to return true', function(done) {
          acl.assert(G, R, function(e, success) {
            done(e, assert(success === true));
          });
        });

        describe('and then revoking it', function() {
          before(function(done) { acl.revoke(G, R, done); });
          after(function(done) { acl.grant(G, R, done); });

          it('should causes assert() to return false', function(done) {
            acl.assert(G, R, function(e, success) {
              done(e, assert(success === false));
            });
          });
        });
      });

      describe('checking asserts', function() {
        before(function(done) {
          acl.grant('editor', '/admin/pages', function(err) {
            acl.grant('writer', '/admin/pages', function(err) {
              acl.grant('editor', '/admin/pages/approve', done);
            });
          });
        });
        after(function(done) {
          acl.revoke('editor', '/admin/pages', function(err) {
            acl.revoke('writer', '/admin/pages', function(err) {
              acl.revoke('editor', '/admin/pages/approve', done);
            });
          });
        });

        it('editor can access /admin/pages', function(done) {
          acl.assert('editor', '/admin/pages', function(e, success) {
            done(e, assert(success === true));
          });
        });

        it('editor can access /admin/pages/approve', function(done) {
          acl.assert('editor', '/admin/pages/approve', function(e, success) {
            done(e, assert(success === true));
          });
        });

        it('writer can access /admin/pages', function(done) {
          acl.assert('writer', '/admin/pages', function(e, success) {
            done(e, assert(success === true));
          });
        });

        it('writer cannot access /admin/pages/approve', function(done) {
          acl.assert('writer', '/admin/pages/approve', function(e, success) {
            done(e, assert(success === false));
          });
        });

        it(G + ' cannot access /admin/pages', function(done) {
          acl.assert(G, '/admin/pages', function(e, success) {
            done(e, assert(success === false));
          });
        });

        it(G + ' cannot access /admin/pages/approve', function(done) {
          acl.assert(G, '/admin/pages/approve', function(e, success) {
            done(e, assert(success === false));
          });
        });

      });

    });

  })(stores[i]);

})();
