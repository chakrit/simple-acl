
// index.js - Main interface file
module.exports = (function() {

  var EventEmitter = require('events').EventEmitter
    , acl = new EventEmitter();

  acl.MemoryStore = require('./memory-store');
  acl.RedisStore = require('./redis-store');
  acl.MockStore = require('./mock-store');

  try {
    require.resolve('bookshelf');
    acl.BookshelfStore = require('./bookshelf-store');
  } catch (e) {
  }

  // function shim
  var shim = function(obj, action) {
    var func = obj[action];

    return function(grantee, resource, callback) {
      acl.emit(action, grantee, resource);
      func.call(obj, grantee, resource, callback);
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
