const assert = require('assert')
const enveload = require('../index')

describe('field mappings', function() {
  
  describe('booleans', function() {
    it('should load and rename a basic environment variable', function() {
      process.env.SECRET_API_KEY = '887766'
      const settings = enveload({ 
        SECRET_API_KEY: true,
      })
      assert.equal(settings.secretApiKey, '887766')
    })
  })

  describe('strings', function() {
    it('should load a basic environment variable to a string mapping', function() {
      process.env.SECRET_API_KEY = '643890'
      const settings = enveload({
        SECRET_API_KEY: 'anotherKey'
      })
      assert.equal(settings.anotherKey, '643890')
    })
    it('should load a basic environment variable to a nested mapping', function() {
      process.env.SECRET_API_KEY = '98234'
      const settings = enveload({
        SECRET_API_KEY: 'anotherKey.nested.key'
      })
      assert.equal(settings.anotherKey.nested.key, '98234')
    })
  })

  describe('objects', function() {
    it('should load a basic environment variable to an object mapping', function() {
      process.env.SECRET_API_KEY = '3185046'
      const settings = enveload({
        SECRET_API_KEY: { to: 'whatever' }
      })
      assert.equal(settings.whatever, '3185046')
    })
    it('should load a basic environment variable to a nested object mapping', function() {
      process.env.SECRET_API_KEY = '17493624'
      const settings = enveload({
        SECRET_API_KEY: 'secret.thing.in.here'
      })
      assert.equal(settings.secret.thing.in.here, '17493624')
    })
  })

  describe('multiple destinations', function() {
    it('should load a single envvar into multiple destinations if requested', function() {
      process.env.SECRET_API_KEY = '3742837'
      const settings = enveload({
        SECRET_API_KEY: { to: [ 'one', 'two', 'three.four.five' ] },
      })
      assert.equal(settings.one, '3742837');
      assert.equal(settings.two, '3742837');
      assert.equal(settings.three.four.five, '3742837');
    })
  })

})

describe('validation', function() {

  describe('basic', function() {
    it('should throw an error if a envvar isnt provided', function() {
      assert.throws(() => {
        enveload({
          SECRET_API_KEY_38490283409234: true 
        })
      }, (err) => !!err)
    })
    it('should throw an error if a key demands it, even if global config doesnt', function() {
      assert.throws(() => {
        enveload({
          SECRET_API_KEY_901341489135384203: { to: 'obj', onMissing: 'error' }
        }, {
          onMissing: 'warn',
        })
      })
    })
  })
  
  describe('warnings', function() {
    it('should print a warning if asked and an envar isnt provided', function() {
      enveload({
        SECRET_API_KEY_90890384203: true,
      }, {
        onMissing: 'log',
        log: (missingEnv) => {
          assert.equal(missingEnv, 'SECRET_API_KEY_90890384203')
        }
      })
    })
    it('should log a warning if asked even if global config demands an error', function() {
      enveload({
        SECRET_API_KEY_9089030890343: { to: 'obj', onMissing: 'warn' },
      }, {
        onMissing: 'error',
        log: (missingEnv) => {
          assert.equal(missingEnv, 'SECRET_API_KEY_9089030890343')
        }
      })
    })
  })

  describe('ignoring', function() {
    it('should do nothing if validation is set to ignore', function() {
      enveload({
        SECPOJFSDOFJSDF: { to: 'obj', onMissing: 'ignore' },
      })
    })
    it('should respect global ignore setting', function() {
      enveload({
        SPODJFSODJFSPDF: true,
      }, {
        onMissing: 'ignore'
      })
    })
  })

})

describe('parsing', function() {

  describe('number', function() {
    it('should parse a basic json number', function() {
      process.env.JSON_NUMBER = '55'
      const settings = enveload({
        JSON_NUMBER: true,
      })
      assert.equal(typeof settings.jsonNumber, 'number');
    })
  })

  describe('object', function() {
    it('should parse a basic json object', function() {
      process.env.JSON_OBJECT = '{"hello":"world"}'
      const settings = enveload({
        JSON_OBJECT: true,
      })
      assert.equal(typeof settings.jsonObject, 'object');
      assert.equal(settings.jsonObject.hello, 'world');
    })
  })

  describe('array', function() {
    it('should parse a basic json array', function() {
      process.env.JSON_ARRAY = '["hello","world"]';
      const settings = enveload({
        JSON_ARRAY: true,
      })
      assert.equal(typeof settings.jsonArray, 'object');
      assert.equal(settings.jsonArray[0], 'hello');
      assert.equal(settings.jsonArray[1], 'world');
    })
  })

  describe('options', function() {
    it('should refuse to parse json if asked', function() {
      process.env.JSON_OBJECT = '{"hello":"world"}'
      const settings = enveload({
        JSON_OBJECT: { to: 'obj', dontParse: true },
      })
      assert.equal(typeof settings.obj, 'string');
    })
    it('should throw an error while parsing json if asked and json is invalid', function() {
      process.env.JSON_OBJECT = '{"hello";"world"}'
      assert.throws(() => {
        enveload({
          JSON_OBJECT: { to: 'obj', requireParse: true },
        })
      }, (err) => !!err)
    })
  })

})