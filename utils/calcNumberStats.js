db = new Mongo().getDB('wyodraw');

var lotteryId = '560d7f94ab3df4645bf6bdc7';
var allNumbers = new Array(45);

getDrawBasics(allNumbers, lotteryId);

function getDrawBasics(allNumbers, lotteryId) {

	var drawTotal = db.drawings.count({lotteryId: lotteryId});
	
	for(number=1; number<=allNumbers.length; number++) {
//	for(number=1; number<=1; number++) {
		var numBasics = getNumBasics(number);
		var numFreqTotal = numBasics[0];
		var numFreqPercent = (numFreqTotal / drawTotal * 100).toFixed(2);
		var numPartners = numBasics[1];

		var partnersData = [];
		var starter = 0;
		var counter = 0;
		numPartners.forEach(function(numPartner) {
			if(numPartner > starter) {
				if(starter > 0) {
					var partnerFreqPercent = (counter / numFreqTotal * 100).toFixed(2);
					partnersData.push({partner: starter, count: counter, freqPercent: partnerFreqPercent});
					counter = 0;
				}
			}
			counter ++;
			starter = numPartner;
		});
		var lastPercent = (counter / numFreqTotal * 100).toFixed(2);
		partnersData.push({partner: starter, count: counter, freqPercent: lastPercent});

		var numberData = {number: number, freqTotal: numFreqTotal, freqPercent: numFreqPercent, partners: partnersData};

		db.numberstats.insert(numberData);

	};

}

function getNumBasics(number) {
	var numTotal = db.numbers.count({number: number});

	var numCur = db.numbers.find({number: number});
	var partners = [];
	var drawingIds = [];
	while(numCur.hasNext()) {
		var numDoc = numCur.next();
		drawingIds.push(numDoc.drawingId);
	}

	drawingIds.forEach(function(drawingId) {
		var partnersCur = db.numbers.find({drawingId: drawingId})
		while(partnersCur.hasNext()) {
			var partnersDoc = partnersCur.next();
			if(parseInt(partnersDoc.number) < number || parseInt(partnersDoc.number) > number) {
				partners.push(partnersDoc.number);
			}
		}
	});

	partners.sort(function(a, b){return a-b});

	return [numTotal, partners];

	//var numCur = db.numbers.find({number: number});
}

