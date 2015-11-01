var music = {};

if (typeof window.audioContext === 'undefined') {
   window.audioContext = new AudioContext();
}

music.playSong = function(songSpec) {
   var bps = songSpec.bps;
   var score = cellularAutomata.generateRows(
      100,
      songSpec.seed,
      cellularAutomata.rules[110]
   );
   var tonic = teoria.note(songSpec.tonic);
   var scale = tonic.scale(songSpec.scale);

   var currentTime = window.audioContext.currentTime;

   for (var i = 0; i < score.length; i++) {
      var noteNums = music.getNoteNumbers(score[i], 39, 57);
      var notes = music.numbersToNotes(noteNums, scale.notes());
      var buffers = music.notesToBuffers(notes);

      for (var j = 0; j < buffers.length; j++) {
         var buffer = buffers[j];
         if (buffer == null) continue;
         music.playSound(buffer, currentTime + i / bps + (1 / bps * j / buffers.length));
      }

      if (i % 4 == 0 && noteNums.length > 0) {
         var scaleIdx = noteNums[0];
         if (scaleIdx >= 4) {
            scaleIdx = 4;
         } else if (scaleIdx >= 2) {
            scaleIdx = 3;
         } else {
            scaleIdx = 0;
         }

         var note = tonic.interval(scale.scale[scaleIdx]);
         if (note != null) {
            var baseH = teoria.note(note.name() + (note.octave() - 1));
            var baseL = teoria.note(note.name() + (note.octave() - 2));
            music.notesToBuffers([baseL, baseH]).forEach(function(buffer) {
               music.playSound(buffer, currentTime + i / bps);
            });
         }
      }
   }

   return score;
};

music.playSound = function(buffer, time) {
   var source = window.audioContext.createBufferSource();
   source.buffer = buffer;
   source.connect(window.audioContext.destination);
   source.start(time);
};

music.numbersToNotes = function(numbers, scale) {
   return numbers.map(function(num) {
      return scale[num] || null;
   });
};

music.notesToBuffers = function(notes) {
   return notes.map(music.deSharp).map(function(note) {
      return note == null ? null : music.audioBuffers[note.toString()];
   });
};

music.deSharp = function(note) {
   if (note == null) {
      return null;
   }
   if (note.toString().indexOf('#') >= 0) {
      return note.enharmonics(true)[0];
   }
   return note;
};

music.getNoteNumbers = function(arr, from, to) {
   var notes = [];
   var acc = 0;
   for (var i = from; i <= to; i++) {
      if (arr[i] === 1) {
         acc++;
      } else {
         if (acc > 0) {
            notes.push(acc);
         }
         acc = 0;
      }
   }
   if (acc > 0) {
      notes.push(acc);
   }
   return notes;
};
