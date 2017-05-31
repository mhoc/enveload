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
    let mappingValue = mapping[envKey]
    let envValue = process.env[envKey]
    if (!envValue) {
      if (typeof mappingValue === 'object' && mappingValue.onMissing) {
        switch (mappingValue.onMissing) {
          case 'error': throw (envKey + ' not provided by the environment')
          case 'log': log(envKey); break
          case 'warn': log(envKey); break
        }
      } else {
        switch (onMissing) {
          case 'error': throw (envKey + ' not provided by the environment')
          case 'log': log(envKey); break
          case 'warn': log(envKey); break
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
      let destinationKey = envKey.toLowerCase()
      let skip = false
      let transformedDestinationKey = ''
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
      set(obj, mappingValue.to, envValue)
    }
  })
  return obj
}