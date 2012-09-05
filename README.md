
# SIMPLE-ACL

Because ACL needn't be overtly complex.

* Simple concept of `grant` and `revoke`
* Simple to install.
* Simple to setup.

# INSTALL

    npm install simple-acl --save

The `--save` flag adds `simple-acl` to your `package.json` file.

# SETUP

You do need to do any setup to start using simple-acl.

However, for production uses, you might want to use the `RedisStore` instead of the default `MemoryStore`.

Any of the following works:

    acl.use(new acl.RedisStore()); // uses default redis host/port and 'sacl:' for prefix.
    acl.use(new acl.RedisStore('acl:prefix')); // uses default redis host/port and `acl:prefix' for prefix.

    acl.use(new acl.RedisStore(redisClient)); // uses supplied redis client and 'sacl:' for prefix
    acl.use(new acl.RedisStore(redisClient, 'acl:prefix')); // uses everything you gave.


# API

### acl.grant(grantee, resource, callback)

Grants `grantee` acesss to `resource` and invoke `callback(e)` when done.

### acl.assert(grantee, resource, callback)

Asserts that `grantee` has access to `resource` and calls `callback(e, true)` if so or else `callback(e, false)` is called instead.

### acl.revoke(grantee, resource, callback)

Revokes `grantee` 's access to `resource` and invoke `callback(e)` when done.

# CUSTOM STORE

Writing a new store of your own choice is pretty easy, too.

    var MyStore = function() { }
    MyStore.prototype.grant = function(grantee, resource, callback);
    MyStore.prototype.assert = function(grantee, resource, callback);
    MyStore.prototype.revoke = function(grantee, resource, callback);

    acl.use(new MyStore());

Pretty simple, huh?

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

