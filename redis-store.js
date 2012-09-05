
// redis-store.js - A redis-backed store for simple-acl
module.exports = (function() {

  var RedisStore = function(client, prefix) {
    // overloads
    if (typeof client === 'string') {
      prefix = client;
      client = undefined;
    }

    // defaults
    if (!client) client = require('redis').createClient();
    if (!prefix) prefix = 'sacl:';

    this.client = client;
    this.prefix = prefix;
  };

  RedisStore.prototype =
    { 'grant':
      function(grantee, resource, callback) {
        var key = this.prefix + grantee;
        this.client.sadd(key, resource, callback);
      }

    , 'assert':
      function(grantee, resource, callback) {
        var key = this.prefix + grantee;
        this.client.sismember(key, resource, function(e, ismember) {
          callback(e, !!ismember);
        });
      }

    , 'revoke':
      function(grantee, resource, callback) {
        var key = this.prefix + grantee;
        this.client.srem(key, resource, callback);
      }
    };

  return RedisStore;

})();
