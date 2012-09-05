
// memory-store.test.js - Tests for the MemoryStore
(function() {

  var assert = require('assert')
    , acl = require('./')
    , MemoryStore = acl.MemoryStore;

  // temp string
  var G = 'grantee', R = 'resource';

  // tests
  describe('MemoryStore', function() {
    before(function() {
      this.store = new MemoryStore();
      acl.use(this.store);
    });

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

      it('should causes assert() to succeeds', function(done) {
        acl.assert(G, R, function(e, success) {
          done(e, assert(success === true));
        });
      });

      describe('and then revoking it', function() {
        before(function(done) { acl.revoke(G, R, done); });
        after(function(done) { acl.grant(G, R, done); });

        it('should causes assert() to fails', function(done) {
          acl.assert(G, R, function(e, success) {
            done(e, assert(success === false));
          });
        });
      });
    });
  });

})();
