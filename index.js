
// index.js - Main interface file
module.exports = (function() {

  var acl = { };

  acl.MemoryStore = require('./memory-store');
  acl.RedisStore = require('./redis-store');
  acl.MockStore = require('./mock-store');

  // bound wrapper
  var bind = function(func, obj) {
    return function() { func.apply(obj, arguments); };
  };

  // store management.
  acl.store = null;
  acl.use = function(store) {
    acl.store = store;

    acl.grant = bind(store.grant, store);
    acl.assert = bind(store.assert, store);
    acl.revoke = bind(store.revoke, store);
  };

  // dud function (replaced by .use)
  acl.grant = function(grantee, resource, callback) { };
  acl.assert = function(grantee, resource, callback) { };
  acl.revoke = function(grantee, resource, callback) { };

  // defaults to MemoryStore on first use
  acl.use(new acl.MemoryStore());
  return acl;

})();
