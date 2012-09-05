
// index.js - Main interface file
module.exports = (function() {

  var acl = { };

  acl.MemoryStore = require('./memory-store');
  acl.RedisStore = require('./redis-store');
  acl.MockStore = require('./mock-store');

  // function shim
  var shim = function(obj, funcName) {
    var func = obj[funcName];

    return function() {
      func.apply(obj, arguments);
    };
  };

  // store management.
  acl.store = null;
  acl.use = function(store) {
    acl.store = store;

    acl.grant = shim(store, 'grant');
    acl.assert = shim(store, 'assert');
    acl.revoke = shim(store, 'revoke');
  };

  // dud function (replaced by .use)
  acl.grant = function(grantee, resource, callback) { };
  acl.assert = function(grantee, resource, callback) { };
  acl.revoke = function(grantee, resource, callback) { };

  // defaults to MemoryStore on first use
  acl.use(new acl.MemoryStore());
  return acl;

})();
