/**
 * PoolEntriesController
 *
 * @description :: Server-side logic for managing pool entries
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  datatables: function(req, res) {
    var options = req.query;

    PoolEntries.datatables(options).sort({createdAt: 'desc'}).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  },

	byPoolId: function(req, res) {
		PoolEntries.find({poolId: req.params.id}).sort({createdAt: 'desc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	}
	
};

