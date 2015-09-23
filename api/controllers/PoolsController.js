/**
 * PoolsController
 *
 * @description :: Server-side logic for managing pools
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  datatables: function(req, res) {
    var options = req.query;

    Pools.datatables(options).sort({name: 'asc'}).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  },

	byChampionshipId: function(req, res) {
		Pools.findByChampionshipId(req.params.id).sort({name: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	}
	
};

