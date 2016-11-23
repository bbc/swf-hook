'use strict';

const assign = function assign () {
  const args = Array.from(arguments).map(d => d || {});

  return Object.assign.apply(Object, [{}].concat(args));
};

const extract = (properties, object) => {
  return properties.reduce((acc, property) => {
    if (property in object) {
      acc[property] = object[property];
    }

    return acc;
  }, {});
};

/**
 * Converts artifacts of lowerCamelCase to Shorthand key/values
 * Eg: { SWF_FOO__BAZ: bar } -> { foo: baz=bar}
 * Eg: { SWF_FOO__BAZ: bar, SWF_FOO__YES: 1 } -> { foo: baz=bar,yes=1 }
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
const toShorthand = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    const match = key.match(/^(\w+)__(\w+)$/);

    if (match) {
      const newKey = match[1];
      const shorthandKey = match[2];

      acc[newKey] = newKey in acc
        ? `${acc[newKey]},${shorthandKey}=${obj[key]}`
        : `${shorthandKey}=${obj[key]}`;
    }
    else {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
};

/**
 * Converts MACRO_CASE to lowerCamelCase key/values
 * Eg: { FOO: bar } -> { foo: bar }
 * Eg: { SWF_FOO: bar } -> { foo: bar }
 * Eg: { SWF_FOO_BAR: bar } -> { fooBar: bar }
 * @param  {[type]} obj    [description]
 * @param  {[type]} prefix [description]
 * @return {[type]}        [description]
 */
const toCamelCase = (obj, prefix) => {
  const transform = (prefix, key) => {
    return key.indexOf(prefix) === -1 ? key : key
      .slice(prefix.length)
      .toLowerCase()
      .replace(/([^_])_([^_])/g, (m, p, letter) => p + letter.toUpperCase());
  };

  return Object.keys(obj || {}).reduce((acc, key) => {
    return Object.assign(acc, {
      [transform(prefix || 'SWF_', key)]: obj[key]
    });
  }, {});
};

module.exports = {
  assign,
  extract,
  toCamelCase,
  toShorthand
};
