'use strict';

const qs = require('querystring');

function toObject (payload, sep) {
  if (typeof payload === 'string') {
    return qs.parse(payload, sep);
  }

  return payload;
}

module.exports = {
  toObject,
};
