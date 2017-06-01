const set = require('lodash.set')

module.exports = (mapping, options) => {
  if (!mapping) throw 'No enveload mapping specified'
  if (!options) options = {}
  const log = options.log ? options.log : (missingEnv) => {
    console.warn(missingEnv + ' not provided by the environment')
  }
  const onMissing = options.onMissing ? options.onMissing : 'error'
  const obj = {}
  Object.keys(mapping).forEach(function(envKey) {
    var mappingValue = mapping[envKey]
    var envValue = process.env[envKey]
    if (!envValue) {
      if (typeof mappingValue === 'object' && mappingValue.onMissing) {
        switch (mappingValue.onMissing) {
          case 'error': throw (envKey + ' not provided by the environment')
          case 'log': log(envKey); break
          case 'warn': log(envKey); break
          case 'ignore': break
        }
      } else {
        switch (onMissing) {
          case 'error': throw (envKey + ' not provided by the environment')
          case 'log': log(envKey); break
          case 'warn': log(envKey); break
          case 'ignore': break
        }
      }
      return
    }
    if (typeof mappingValue !== 'object' || !mappingValue.dontParse) {
      try {
        envValue = JSON.parse(envValue)
      } catch (e) {
        if (typeof mappingValue === 'object' && mappingValue.requireParse) {
          throw e
        }
      }
    }
    if (typeof mappingValue === 'boolean' && !!mappingValue) {
      var destinationKey = envKey.toLowerCase()
      var skip = false
      var transformedDestinationKey = ''
      for (i = 0; i < destinationKey.length; i += 1) {
        if (skip) {
          skip = false
          continue 
        }
        if (destinationKey[i] === '_') {
          skip = true 
          transformedDestinationKey += destinationKey[i+1].toUpperCase()
        } else {
          transformedDestinationKey += destinationKey[i]
        }
      }
      obj[transformedDestinationKey] = envValue
    } else if (typeof mappingValue === 'string') {
      set(obj, mappingValue, envValue)
    } else if (typeof mappingValue === 'object') {
      if (!mappingValue.to) throw 'Must provide a `to` key in field mapping'
      if (typeof mappingValue.to === 'string') {
        set(obj, mappingValue.to, envValue)
      } else if (typeof mappingValue.to === 'object') {
        // actually an array. if you provide an object, ur gonna break it.
        mappingValue.to.forEach(function(destination) {
          set(obj, destination, envValue)
        })
      }
    }
  })
  return obj
}