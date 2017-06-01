# ENVELOAD

A node library to load disparate environment variables into a single object, with additional parsing and validation.

# What Is This Good For?

- Loading a bunch of environment variables into a single object.
- Using Meteor? Loading a bunch of environment variables into `Meteor.settings`.
- Validating that environment variables exist during startup; just ignore the object it returns. 

# Usage

```
npm i --save enveload
```

Then, as early as possible in your app's startup server code (after `require('dotenv')` if you're using it :)

```js
const settings = require('enveload')({
  FACEBOOK_API_KEY: true,
  GOOGLE_API_KEY: 'google.apiKey',
  GOOGLE_CLIENT_ID: 'public.google.clientId',
})
```

# API

```js
require('enveload')(mapping, options)
```

## Mapping

`mapping` is a map of envvar names to mapping options. The most simple mapping is:

```js
mapping = {
  GOOGLE_API_KEY: true
}
// settings.googleApiKey === process.env.GOOGLE_API_KEY
```

You can specify which key things should end up in. The string you provide is passed to `lodash.set`, and supports anything that supports.

```js
mapping = {
  FACEBOOK_API_KEY: 'facebook.key'
}
// settings.facebook.key === process.env.FACEBOOK_API_KEY
```

Obviously JSON can represent much more than a simple string. By default, this library will attempt to JSON-parse any envvar you provide it in this map. 

```js
// process.env.REQUEST_LIMIT=5
// process.env.WHITELISTED_IPS=["1.1.1.1","2.2.2.2","3.3.3.3"]
mapping = {
  REQUEST_LIMIT: true,
  WHITELISTED_IPS: true,
}
// typeof settings.requestLimit === 'number'
// typeof settings.whitelistedIps === 'object' (its an array :)
```

## Options

By default, enveload will throw an error if a requested environment variable isn't found or contains a falsey value (essentially, empty string). This can be tweaked on a global basis with the options object

```js
require('enveload')({ ...mapping }, {
  onMissing: 'error',
  onMissing: 'log',
  onMissing: 'ignore',
})
```

If you desire to use `onMissing:log`, enveload will simply write a useful log with `console.warn`. If you want to customize the log a little bit, you can optionally provide a global configuration parameter like so:

```js
require('enveload')({ ...mapping }, {
  onMissing: 'log',
  log: (missingEnv) => {
    // ... do whatever you want here, use your own logging libraries, etc.
  }
})
```

By default, enveload will JSON.parse every environment variable it comes across and throw away the error if there is one. You can tweak this behavior with two options on each mapping.

```js
require('enveload')({
  // dontParse will avoid the parsing alltogether and just copy the string into the final object
  WHITELISTED_IPS: { to: 'whitelistedIps', dontParse: true },
  // requireParse will bubble-up the error if the JSON.parse fails
  BLACKLISTED_USERS: { to: 'blacklistedUsers', requireParse: true },
})
```

You can also load a single environment variable into different places inside the resulting object, if your use-case demands it.

```js
require('enveload')({
  SECRET_API_TOKEN: { to: [ 'location1', 'location2.location3' ] },
})
```

# Meteor Support

This library is especially useful for assembling a `Meteor.settings` object from multiple envvars instead of a single big `METEOR_SETTINGS` envvar.

One cool thing: Specifying the first nested object as `public` works exactly as you'd expect; the value will available to clients. 

```js
mapping = {
  GOOGLE_CLIENT_ID: 'public.google.clientId'
}
// settings.public.google.clientId === process.env.GOOGLE_CLIENT_ID (on server)
```

The code in your Meteor app might look like:

```js
Meteor.settings = Object.assign(Meteor.settings, require('enveload')({
  GOOGLE_API_KEY: 'google.apiKey',
  GOOGLE_CLIENT_KEY: 'public.google.clientKey',
}))
```