
/*
 * GET home page.
 */

var sf = require('../socialfeed');

exports.index = function(req, res){
	//name = req.param('name');
	/*
	res.send('<form method="get" action="/lookup/">'
		+ 'Hotel Site Name: <input type="text" name="sitename" value="" />'
		+ '<input type="submit" value="Submit" />'
		+ '</form>');
	*/
	res.render('homepage', req.param('name'));
	//console.log(req.param('name'));

}

exports.siteLookup = function(req, res) {
	//var site = req.params.sitename;
	var site = req.param('sitename');
		
	if(site.length>0){
		sf.process(site, function(xml_result) {
			//console.log('xml result', xml_result);
			console.log('XML Result', xml_result)
			res.contentType('xml');
			//res.render('feed', xml_result);
			res.send(xml_result);
		});
	}
	else{
		res.send('No site name entered')
	}
  //res.render('index', { title: 'Express' })
};