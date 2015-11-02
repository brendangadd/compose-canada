
var analyserData = null;
var visualizer = null;
var ctx = document.querySelector('#canvas').getContext('2d');
var canvasDims = null;

document.addEventListener('DOMContentLoaded', function() {
   loadSounds(function(err, buffers) {
      music.audioBuffers = buffers;
      initMap();
   });

   toastr.options.positionClass = 'toast-top-center';
   toastr.options.extendedTimeOut = -1;
   toastr.options.timeOut = -1;

   analyserData = new Uint8Array(music.analyser.frequencyBinCount);
   var canvas = document.querySelector('#canvas');
   visualizer = {
      canvas: canvas,
      ctx: canvas.getContext('2d')
   };
   visualize();
});

function visualize() {
   var ctx = visualizer.ctx;
   var width = visualizer.canvas.width;
   var height = visualizer.canvas.height;
   var w2 = width / 2;
   var h2 = height / 2;

   music.analyser.getByteTimeDomainData(analyserData);
   ctx.clearRect(0, 0, width, height);

   ctx.fillStyle = 'rgba(186, 104, 200, 0.5)';
   ctx.beginPath();
   var theta = Date.now() % 9000 / 9000 * 2 * Math.PI;
   ctx.arc(w2, h2, 1000, theta, theta + Math.PI / 6);
   ctx.lineTo(w2, h2);
   ctx.closePath();
   ctx.fill();

   ctx.fillStyle = 'rgba(186, 104, 200, 0.45)';
   ctx.beginPath();
   theta = -Date.now() % 12000 / 12000 * 2 * Math.PI;
   ctx.arc(w2, h2, 1000, theta, theta - Math.PI / 4, true);
   ctx.lineTo(w2, h2);
   ctx.closePath();
   ctx.fill();

   ctx.fillStyle = 'rgba(186, 104, 200, 0.4)';
   ctx.beginPath();
   theta = Date.now() % 12000 / 12000 * 2 * Math.PI;
   ctx.arc(w2, h2, 1000, theta, theta + Math.PI / 2);
   ctx.lineTo(w2, h2);
   ctx.closePath();
   ctx.fill();

   var w3_16 = width * 3 / 16;
   ctx.fillStyle = 'rgba(255, 190, 231, 0.6)';
   ctx.beginPath();
   ctx.arc(w2, h2, analyserData[12] / 128 * w3_16 + width/4, 0, 2 * Math.PI);
   ctx.fill();

   ctx.fillStyle = 'rgba(206, 147, 216, 0.6)';
   ctx.beginPath();
   ctx.arc(w2, h2, analyserData[8] / 128 * w3_16 + width/8, 0, 2 * Math.PI);
   ctx.fill();

   ctx.fillStyle = 'rgba(186, 104, 200, 0.6)';
   ctx.beginPath();
   ctx.arc(w2, h2, analyserData[4] / 128 * w3_16, 0, 2 * Math.PI);
   ctx.fill();


   requestAnimationFrame(visualize);
}

function initMap() {
   var FEATURE_FILL_COLOR = '#CE93D8';
   var FEATURE_STROKE_COLOR = '#BA68C8';
   var FEATURE_FILL_COLOR_HOVER = '#E1BEE7';
   var FEATURE_STROKE_COLOR_HOVER = '#9C27B0';

   var map = new google.maps.Map(document.querySelector('#map'), {
      center: {lat: 59, lng: -98},
      scrollwheel: false,
      zoom: 4,
      styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#4f595d"},{"visibility":"on"}]}]
   });
   var nw = new google.maps.LatLng(74.537117, -143.034124);
   var se = new google.maps.LatLng(41.028636, -49.870067);
   var sw = new google.maps.LatLng(41, -143);
   var ne = new google.maps.LatLng(70, -50);
   map.fitBounds(new google.maps.LatLngBounds(sw, ne));

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
      var region = event.feature.getProperty('NAME');
      music.stop();
      loadSongSpec(region, function(err, songSpec) {
         music.playSong(songSpec);
         toastr.remove();
         var toast = toastr.info(
            'You\'re listening to the soothing sounds of '
            + region + '. (Click to stop…)'
         );
         toast.click(function(e) {
            music.stop();
         });
         window.setTimeout(function() {
            toastr.clear(toast);
         }, 100 / songSpec.bps * 1000)
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
