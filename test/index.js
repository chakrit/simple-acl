
// index.js - Test main simple-acl export
(function() {

  var assert = require('assert')
    , EventEmitter = require('events').EventEmitter;

  // interface info
  var stores = 'MemoryStore,RedisStore,MockStore'.split(',')
    , funcs = 'grant,revoke,assert'.split(',');

  // tests
  describe('acl', function() {
    before(function() { this.acl = require('..'); });

    it('should be an instance of EventEmitter', function() {
      assert(this.acl instanceof EventEmitter);
    });

    for (var i in stores) (function(store) {
      it('should exports the ' + store, function() {
        assert(store in this.acl);
        assert(typeof this.acl[store] === 'function');
      });
    })(stores[i]);

    for (var i in funcs) (function(func) {
      it('should exports the ' + func + '() function', function() {
        assert(func in this.acl);
        assert(typeof this.acl[func] === 'function');
      });
    })(funcs[i]);

    it('should exports an `store` property', function() {
      assert('store' in this.acl);
    });

    it('should defaults to the MemoryStore', function() {
      assert(this.acl.store);
      assert(this.acl.store instanceof this.acl.MemoryStore);
    });

    it('should exports a `use` function', function() {
      assert('use' in this.acl);
      assert(typeof this.acl.use === 'function');
    });


    describe('using another store', function() {
      before(function() {
        this.oldStore = this.acl.store;
        this.newStore = new this.acl.MockStore();

        this.acl.use(this.newStore);
      });

      after(function() {
        this.acl.use(this.oldStore);
        delete this['oldStore'];
        delete this['newStore'];
      });

      it('should changes the acl.store value', function() {
        assert(this.acl.store instanceof this.acl.MockStore);
        assert(this.acl.store === this.newStore);
      });


      for (var i in funcs) (function(func) {
        describe('calling acl.' + func + '() function', function() {
          before(function(done) {
            this.acl[func]('grantee', 'resource', done);
            this.lastFunc = this.newStore.lastFunc;
            this.lastArgs = this.newStore.lastArgs;
          });

          it('should calls the store\'s ' + func + '() function', function() {
            assert(this.lastFunc === func);
            assert(this.lastArgs.length === 3);
            assert(this.lastArgs[0] === 'grantee');
            assert(this.lastArgs[1] === 'resource');
          });
        });
      })(funcs[i]);

    }); // using another store

  }); // acl

})();
