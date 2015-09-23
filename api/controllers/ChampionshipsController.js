/**
 * ChampionshipsController
 *
 * @description :: Server-side logic for managing championships
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  datatables: function(req, res) {
    var options = req.query;

    Championships.datatables(options).sort({name: 'asc'}).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  },

	current: function(req, res) {
		var now = new Date();
		var nowMS = now.getTime();
		Championships.find({expires: {$gte: nowMS}}).sort({name: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	}
	
	
};

