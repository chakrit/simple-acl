
// store.js - Tests for the the stores.
(function() {

  var assert = require('assert')
    , acl = require('..');

  // temp string
  var G = 'grantee', R = 'resource'
    , funcs = 'grant,assert,revoke'.split(',');

  var stores = ['MemoryStore', 'RedisStore'];

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
    });

  })(stores[i]);

})();
