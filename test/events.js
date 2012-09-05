
// events.js - Test that the acl module properly emit events.
(function() {

  var assert = require('assert')
    , acl = require('..');

  // helper for testing EventEmitter
  var fuse = function() {
    this.triggered = false;
    this.trigger = function() { this.triggered = true; };
    this.assert = function() { assert(this.triggered); };
  };

  var G = 'grantee', R = 'resource'
    , events = 'grant,revoke'.split(',');

  // tests
  describe('acl events', function() {

    for (var i in events) (function(event) {
      describe('when ' + event + '()-ing', function() {
        before(function(done) { var me = this;
          me.emitted = false;
          me.listener = function(grantee, resource) {
            me.grantee = grantee;
            me.resource = resource;
            me.emitted = true;
          };

          acl.on(event, me.listener);
          acl[event].call(me.acl, G, R, done);
        });

        after(function() {
          acl.removeListener(event, this.listener);
          delete this['listener'];
          delete this['grantee'];
          delete this['resource'];
          delete this['emitted'];
        });

        it('the ' + event + ' event is emitted with the same params', function() {
          assert(this.emitted);
          assert(this.grantee === G);
          assert(this.resource === R);
        });
      });
    })(events[i]);

  });

})();
