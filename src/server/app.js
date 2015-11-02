'use strict';

const _ = require('lodash');
const http = require('http');
const songGenerator = require('./song-generator');
const url = require('url');

let sources = {
   'British Columbia': 'Hello, how are you doing today #Canada?', // Junk
   'Alberta': 'hello, how are you doing today #Canada?', // Cool
   'Saskatchewan': 'what', // Junk
   'Manitoba': 'Okay, so now we will see what is up.', // Eerie,
   'Ontario': 'Will you be my buttercup?', // Lot's of nice notes
   'Quebec': 'sdflknsdlkfj', // Ehn
   'New Brunswick': 'nno soup for you', // High blues scale
   'Nova Scotia': 'Super sayan 3', // Two notes... what the hell?
   'Prince Edward Island': 'Prince Edward Island',
   'Newfoundland  & Labrador': 'Newfoundland  & Labrador',
   'Yukon Territory': 'It is raining.', // Nice major pentatonic
   'Northwest Territories': 'Rain is happy?', // Repetitive, suspense
   'Nunavut': 'Nunavut'
};

let specs = _.reduce(sources, (memo, value, key) => {
   memo[key] = songGenerator.createSong(value);
   return memo;
}, {});

http.createServer((request, response) => {
   let parseResult = url.parse(request.url, true);
   let region = parseResult.query.region || 'Ontario';
   let spec = specs[region];

   response.writeHead(200, {'Content-Type': 'application/json'});
   response.end(JSON.stringify(specs[region]));
}).listen(3000, '127.0.0.1');
