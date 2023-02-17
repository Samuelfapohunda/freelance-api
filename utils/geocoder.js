const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'xh2Gr6x9rACGaTFcHkkFy0QjoGHv6feZ',
    formatter:  null
}


const geocoder  = NodeGeocoder(options);

module.exports = geocoder;
