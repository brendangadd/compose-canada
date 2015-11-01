'use strict';

const crypto = require('crypto');
const got = require('got');
const teoria = require('teoria');

const SCALES = [
   'aeolian',
   'blues',
   'chromatic',
   'dorian',
   'doubleharmonic',
   'harmonicminor',
   'ionian',
   'locrian',
   'lydian',
   'majorpentatonic',
   'melodicminor',
   'minorpentatonic',
   'mixolydian',
   'phrygian',
   'wholetone'
];

module.exports = {
   createSong
};

function createSong(data) {
   let hash = crypto.createHash('sha1');
   hash.update(data);
   let digest = hash.digest('binary');

   let tonic = generateTonic(digest.charCodeAt(0));
   let scale = generateScale(digest.charCodeAt(1));
   let bps = generateBeatsPerSecond(digest.charCodeAt(2));
   let seed = stringToBinaryArray(digest, 100);

   return {tonic, scale, bps, seed};
}

function generateTonic(seed) {
   let minTonic = teoria.note('c3');
   let maxTonic = teoria.note('b4');
   let mod = maxTonic.midi() - minTonic.midi() + 1;
   let tonicMidi = seed % mod + minTonic.midi();
   return teoria.note.fromMIDI(tonicMidi).toString();
}

function generateBeatsPerSecond(seed) {
   let minBps = 1.2;
   let maxBps = 2;
   let mod = (maxBps - minBps) * 100 + 1;
   return seed % mod / 100 + minBps;
}

function stringToBinaryArray(str, length) {
   let binaryString = '';
   for (let i = 0; i < str.length; i++) {
      binaryString += str.charCodeAt(i).toString(2);
   }
   let extraZeros = [];
   for (let i = 0; i < length - binaryString.length; i++) {
      extraZeros.push('0');
   }
   binaryString += extraZeros.join('');
   binaryString = binaryString.substr(0, length);

   return binaryString.split('').map((s) => +s);
}

function generateScale(seed) {
   return SCALES[seed % SCALES.length];
}

got('http://www.google.ca', (err, body, response) => {

});
