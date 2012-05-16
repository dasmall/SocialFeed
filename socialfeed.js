var config = require('./config.js');

var SOCIALFEEDRSSINFO = config.SOCIALFEEDRSSINFO;
var SITES = config.SITES;

// Array of tweets/statuses to be published.
var TWITTERPHRASES = [
    "Going to {location}? Book a hotel room {deal}.",
    "Planning a vacay for {location}? Stay {deal}. Make it happen.",
    "Vacation in {location} {deal}.",
    "Run away to {location} hotels {deal}.",
    "Check out {location} hotel deals {deal}.",
    "Find hotels in {location} {deal}.",
    "Explore {location} with ease. Book a room {deal}.",
    "{location} has hotel rooms {deal}.",
    "Relax in a {location} hotel {deal}.",
    "Stay in {location} hotels {deal}.",
    "Looking for somewhere to stay in {location}? Book a hotel room {deal}.",
    "Treat yourself. Stay in a {location} hotel {deal}.",
    "Visit {location} and relax with hotel rooms {deal}.",
    "Don't go broke just for a vacation. Stay in {location} {deal}.",
    "Take a vacation in {location}. Get a room {deal}.",
    "[You] + [a {location} hotel] = [downtime]. Re-energize {deal}. You deserve it.",
    "Clear your mind. Book a room in {location} {deal}. Escape. Refresh. Relax.",
    "Live in {location}? Why not have a staycation for once? Book a room {deal}.",
    "Take a breather from your everyday routine. {location} has hotel rooms {deal}.",
    "Be a tourist in {location}. Book a room {deal} but don't forget the fanny pack.",
    "Closed blinds. Room service. Serenity. {location} hotels {deal}.",
    "No alarms. No email. Sleep. {location} hotel rooms {deal}. Book yours!",
    "Thought about staying in a {location} hotel room? Do it {deal}.",
    "Have a look at which hotel rooms you can book {deal}.",
    "Party, sleep or maybe party in your sleep while staying at a {location} hotel {deal}.",
    "We could put something witty here about our {location} hotel room deals. Here's the link to book one instead.",
    "Feeling lucky? Here are surprize hotel room options for you.",
    "Always been told 'Get a room'? You can do that {deal} with us."
];

// Phrases to be used as a fallback if EAN doesn't give us supply a timely feed.
var STANDARDPHRASE = [
    "Check us out.",
    "Browse our hotel selection for your next trip.",
    "Did you know about our best price guarantee?",
    "Tons of hotels to choose from.",
    "Book your next hotel through us."
];

var FeedParser = require('feedparser');
var fs = require('fs'); // Module for writing to files. *--- To be removed ---*
var RSS = require('rss'); // Module used to create RSS output


// Fields to be replaced in final TWITTERPHRASES instances.
var PHRASE_FIELDS = {
    location:"{location}",
    deal:"{deal}",
    currency:"USD ",
    duration:"1 night(s)"
};

var feed = new RSS(config.SOCIALFEEDRSSINFO);
//console.log("Feed object: ", feed);

// Returns processed RSS.
function done_parsing(site, error, meta, articles) {
	if (error) {
		//console.log("----> Error event handling. Now replacing strings with fallback phrases.", error);

        var text = STANDARDPHRASE[randomIndex(STANDARDPHRASE)];
        
        feed.item({
            //title: article.title,
            description: text,
            url: site.author,
            author: site.author
        });

        var xml = feed.xml();
        //console.log("feed.xml()", xml);
        
        // *--- To be removed ---*
        //fs.writeFile('myfeed.xml', xml);
        
        if (site.results_callback)
            site.results_callback(xml);
        else
            site.results_callback('Unable to retrieve site RSS data.')

	} else {
		for (var idx in articles) {
			humanize_article(site, articles[idx])
		}

        var xml = feed.xml();
        //console.log("feed.xml()", xml);
        
        // *--- To be removed ---*
        //fs.writeFile('myfeed.xml', xml);
        
        if (site.results_callback)
            site.results_callback(xml);
        else
            site.results_callback('Unable to retrieve site RSS data.')
	}
    
    // Re-instantiates object after xml update. Eliminates persisting values and duplicate listings when reloading
    // the page while the app runs.
    feed = new RSS(config.SOCIALFEEDRSSINFO);
}

function randomIndex(phraseBank){
    return Math.floor((Math.random()*phraseBank.length));
}

// Processes raw EAN RSS items and populates huamnized 'feed' RSS object.
function humanize_article(site, article){
    //Random number used to index into TWITTERPHRASES
	//var randomNum = Math.floor((Math.random()*TWITTERPHRASES.length));
    var randomNum = randomIndex(TWITTERPHRASES);
	var text = TWITTERPHRASES[randomNum];

    // Values to replace {deal} {location fields} in raw TWITTERPHRASES for an RSS item.
    var phraseValues = {
        location:article.title,
        deal:article.description,
        currency:"US$",
        duration: "a night"       
    };

    // Replaces {deal} {location} fields in TWITTERPHRASES. Polishes it to 'human' form.
    for (var idx in PHRASE_FIELDS)
    	text = text.replace(PHRASE_FIELDS[idx], phraseValues[idx]);
	
    // Appends to processed RSS.
    feed.item({
        title: article.title,
        description: text,
        url: article.link,
        author: site.author
    })
}

/*
function list_sites(){
    var names = new Array();
    for (var idx in config.SITES)
        names = config.SITES[idx]
    //return names[];
}
*/

// Extract (raw) EAN RSS items.
function parse_feed(site) {
    // Pass in EAN's RSS feed to be parsed. Wait for {timeout period} before spewing an error.
    options = {uri:site.eanRssFeed, timeout:3000};
    var parseF = function(error, meta, articles) {
        done_parsing(site, error, meta, articles);
    }
    var parser = new FeedParser();
    parser.parseUrl(options, parseF);
    parser.on('error', function(error) {
        if(error.code === 'ETIMEDOUT'){
            console.log("-----> Error event response to: ", error);
            parseF(error, null, null)
        }
        else{
            console.log("-----> Error that wasn't accounted for: ", error.code)
        }
    });  
}      


function process_site(site_name, results_callback) {
    var site = config.SITES[site_name];
    //console.log('Site object: ', site)
    //if (!site) return;
    site.results_callback = results_callback;
    parse_feed(site);
}

exports.process = process_site;
//
//process_site('miami');
