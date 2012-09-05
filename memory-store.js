
// memory-store.js - A memory-backed store for simple-acl
module.exports = (function() {

  var defer = process.nextTick;

  var MemoryStore = function() {
    this.rights = { };
  };

  MemoryStore.prototype =
    { 'grant':
      function(grantee, resource, callback) {
        if (!(grantee in this.rights))
          this.rights[grantee] = [];

        this.rights[grantee].push(resource);
        defer(callback);
      }

    , 'assert':
      function(grantee, resource, callback) {
        var list = this.rights[grantee]
          , ok = (list && list.indexOf(resource) != -1);

        defer(function() { callback(null, !!ok); });
      }

    , 'revoke':
      function(grantee, resource, callback) {
        if (!(grantee in this.rights))
          return defer(callback);

        var list = this.rights[grantee]
          , index = list.indexOf(resource);

        if (index !== -1)
          list.splice(index, 1);

        defer(callback); // always succeeds
      }
    };


  return MemoryStore;

})();
