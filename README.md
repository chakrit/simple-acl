# SIMPLE-ACL

Seriously, why do all these ACL modules have to be so darn complex? I just need a simple well-tested module to do ACL.

* Simple concept of `grant`, `assert` and `revoke`. See the API.
* Simple to setup.
* Simple to extend.
* [![Build Status](https://secure.travis-ci.org/chakrit/simple-acl.png)](http://travis-ci.org/chakrit/simple-acl)

# INSTALL

    npm install simple-acl --save

The `--save` flag adds `simple-acl` to your `package.json` file. Then:

    var acl = require('acl');
    
And you're ready to go.

# SETUP

You do not need to do any extra setup to start using simple-acl.

However, for production uses, you might want to use the `RedisStore` instead of the default `MemoryStore`.

Any of the following works:

    acl.use(new acl.RedisStore());              // uses default redis host/port and 'sacl:' for prefix.
    acl.use(new acl.RedisStore('acl:prefix'));  // uses default redis host/port and `acl:prefix' for prefix.

    acl.use(new acl.RedisStore(redisClient));   // uses supplied redis client and 'sacl:' for prefix
    acl.use(new acl.RedisStore(redisClient, 'acl:prefix')); // uses everything you gave it.

Don't forget to `npm install redis`, too. Since I don't want to force everyone to install `redis` which also includes `hiredis` if they're not gonna use it.

# API

All arguments to the api are expected to be strings (except for the callback, of course.)

### acl.grant(grantee, resource, callback)

Grants `grantee` acesss to `resource` and invoke `callback(e)` when done.

### acl.assert(grantee, resource, callback)

Asserts that `grantee` has access to `resource` and calls `callback(e, true)` if so or else `callback(e, false)` is called instead.

### acl.revoke(grantee, resource, callback)

Revokes `grantee` 's access to `resource` and invoke `callback(e)` when done.

# WHAT ABOUT...

### Resource-based asserts

Well... do I even need to explain this?

### Role-based asserts

Just use your role name as the resource name. Use `grant()` for assigning roles and `revoke()` for removing roles.

### Events Logging?!?

Yes, `require('acl')` is an `EventEmitter` with two events:

    acl.on('grant', function(grantee, resource) { });
    acl.on('revoke', function(grantee, resource) { });
    
It's pretty basic right now just to allows you to log grants and revokes as they happens.
I will add more event-based functionality if there is demand.

### Custom Stores

Writing a new store of your own choice is pretty easy, too.

    var MyStore = function() { }
    MyStore.prototype.grant = function(grantee, resource, callback) { };
    MyStore.prototype.assert = function(grantee, resource, callback) { };
    MyStore.prototype.revoke = function(grantee, resource, callback) { };

    acl.use(new MyStore());

Pretty simple, huh?

To verify if your store is working, check the `test/store.js` file.

# TESTING

Good if you are modifying simple-acl or writing your own custom store.

    npm install mocha -g && npm test

Hey, if you're not already using [mocha](http://visionmedia.github.com/mocha/) for your tests, you should!

# MIDDLEWARE

To use simple-acl as a connect/express middleware is pretty simple still, just add the following code to your initialization script:

    app.use(function(req, resp, next) {
      acl.assert(req.user.id, req.url, function(e, ok) {
        if (!ok)
          return resp.send(403, 'Forbidden');

        return next(e);
      });
    });

Where `req.user` is your user object if you are using `passport` for authentication and `resourceful` for the model, for example.

# LICENSE

BSD

# SUPPORT

Just open a new Github issue or ping me [@chakrit](http://twitter.com/chakrit) on Twitter.

If you see me hanging around #node.js IRC channel, that works too, just say hi :)

