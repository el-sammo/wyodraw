db = new Mongo().getDB('wyodraw');
var lotteryId = '560d7f94ab3df4645bf6bdc7';

var allNumbers = new Array(45);

getDrawBasics(allNumbers, lotteryId);

//	db.COLLECTION.insert(doc);

function getDrawBasics(allNumbers, lotteryId) {
	var drawTotal = db.drawings.count({lotteryId: lotteryId});

	print('drawTotal: '+drawTotal);
	
	//for(number=1; number<=allNumbers.length; number++) {
	for(number=1; number<=1; number++) {
		var numBasics = getNumBasics(number);
		var numFreqTotal = numBasics[0];
		var numFreqPercent = numFreqTotal / drawTotal;
		var numPartners = getNumBasics[1];

		print('numFreqTotal: '+numFreqTotal);
		print('numFreqPercent: '+numFreqPercent);
//		print('numPartners:');
//		printjson(numPartners);
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
	printjson(partners);

	return [numTotal, partners];

	//var numCur = db.numbers.find({number: number});
}

