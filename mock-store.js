
// mock-store.js - Mock store for testing simple-acl
module.exports = (function() {

  var MockStore = function() {
    this.lastFunc = null;
    this.lastArgs = null;
  };

  var spy = function(name) {
    return function() {
      this.lastFunc = name;
      this.lastArgs = Array.prototype.slice.call(arguments);

      var lastArg = this.lastArgs[this.lastArgs.length - 1];
      if (typeof lastArg === 'function') { // assume last arg is a callback
        process.nextTick(lastArg);
      };
    };
  };

  MockStore.prototype.grant = spy('grant');
  MockStore.prototype.assert = spy('assert');
  MockStore.prototype.revoke = spy('revoke');

  return MockStore;

})();
