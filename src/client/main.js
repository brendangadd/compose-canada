
document.addEventListener('DOMContentLoaded', function() {
   loadSounds(function(err, buffers) {
      music.audioBuffers = buffers;
      initMap();
   })
});

function initMap() {
   var FEATURE_FILL_COLOR = '#CE93D8';
   var FEATURE_STROKE_COLOR = '#BA68C8';
   var FEATURE_FILL_COLOR_HOVER = '#E1BEE7';
   var FEATURE_STROKE_COLOR_HOVER = '#9C27B0';

   var map = new google.maps.Map(document.querySelector('#map'), {
      center: {lat: 59, lng: -98},
      scrollwheel: false,
      zoom: 4
   });

   map.data.loadGeoJson('canada.geo.json');
   map.data.setStyle({
      fillColor: FEATURE_FILL_COLOR,
      strokeColor: FEATURE_STROKE_COLOR
   });
   map.data.addListener('mouseover', function(event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {
         fillColor: FEATURE_FILL_COLOR_HOVER,
         strokeColor: FEATURE_STROKE_COLOR_HOVER,
         zIndex: 1000
      });
   })
   map.data.addListener('mouseout', function(event) {
      map.data.revertStyle();
   });
   map.data.addListener('click', function(event) {
      console.log(event.feature.getProperty('NAME'));
      loadSongSpec(event.feature.getProperty('NAME'), function(err, songSpec) {
         music.playSong(songSpec);
      });
   });
}

function drawCanvas(score) {
   var ctx = document.querySelector('#canvas').getContext('2d');
   for (var i = 0; i < score.length; i++) {
      var row = score[i];
      for (var j = 0; j < row.length; j++) {
         if (row[j] === 1) {
            ctx.fillStyle = (j > 62 || j < 39 ? '#000' : '#090');
            ctx.fillRect(i * 10 + 1, j * 10 + 1, 10, 10);
         }
      }
   }
}

function loadSongSpec(region, cb) {
   var encodedRegion = window.encodeURIComponent(region);
   var client = new XMLHttpRequest();
   client.open('GET', '/songspec?region=' + encodedRegion);
   client.send();

   client.addEventListener('load', function() {
      var songSpec = JSON.parse(this.response);
      cb(null, songSpec);
   });
}

function loadSounds(cb) {
   var client = new XMLHttpRequest();
   client.open('GET', 'grand-piano.json');
   client.send();
   client.addEventListener('load', function() {
      var noteSpecs = JSON.parse(this.response);
      var loadFns = _.map(noteSpecs, function(value, key) {
         return loadNote.bind(window, {name: key, dataUri: value});
      });
      async.parallel(loadFns, function(err, results) {
         audioBuffers = _.reduce(results, function(acc, result) {
            acc[result.name] = result.audioBuffer;
            return acc;
         }, {});

         cb(null, audioBuffers);
      });
   });
}

function loadNote(noteSpec, cb) {
   var sData = atob(noteSpec.dataUri.split(',')[1]);
   var length = sData.length;
   var arrBuff = new ArrayBuffer(length);
   var intWrap = new Uint8Array(arrBuff);
   for (var i = 0; i < length; i++) {
      intWrap[i] = sData.charCodeAt(i);
   }

   window.audioContext.decodeAudioData(arrBuff, function(buffer) {
      cb(null, {name: noteSpec.name, audioBuffer: buffer});
   });
}
