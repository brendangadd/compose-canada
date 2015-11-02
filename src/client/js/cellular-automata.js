var cellularAutomata = {};

cellularAutomata.rules = {
   30: {
      '111': 0,
      '110': 0,
      '101': 0,
      '100': 1,
      '011': 1,
      '010': 1,
      '001': 1,
      '000': 0
   },
   110: {
      '111': 0,
      '110': 1,
      '101': 1,
      '100': 0,
      '011': 1,
      '010': 1,
      '001': 1,
      '000': 0
   }
};

cellularAutomata.generateRows = function(numRows, seed, rule) {
   var rows = [];
   var seedLength = seed.length;

   var previousRow = seed;
   for (var i = 1; i < numRows; i++) {
      var row = [];
      for (var j = 0; j < seedLength; j++) {
         var im = i - 1;
         var jm = j - 1;
         var jp = j + 1;
         var ruleKey = '' + previousRow[Math.max(jm, 0)]
            + previousRow[j]
            + previousRow[Math.min(jp, seedLength - 1)]
         ;
         row.push(rule[ruleKey]);
      }
      rows.push(row);
      previousRow = row;
   }

   return rows;
};
