'use strict';

const http = require('http');
const songGenerator = require('./song-generator');

let data = 'Hello, how are you doing today #Canada?';
let songSpec = songGenerator.createSong(data);

songSpec.seed = songSpec.seed.join('');
console.log(songSpec);

http.createServer(function(request, response) {
   response.writeHead(200, {'Content-Type': 'application/json'});
   response.end(JSON.stringify(songSpec));
}).listen(3000, '127.0.0.1');
