var loaded = require("dotenv").config();
var twitter = require("twitter");
var spotify = require("spotify-web-api-node");
var Keys = require('./keys.js');

var twitterClient = new twitter({
    consumer_key: Keys.twitter.consumer_key,
    consumer_secret: Keys.twitter.consumer_secret,
    access_token_key: Keys.twitter.access_token_key,
    access_token_secret: Keys.twitter.access_token_secret
});

var spotifyClient = new spotify({
    clientId: Keys.spotify.id,
    clientSecret: Keys.spotify.secret
})

if (process.argv.length < 3) {
    throw new Error('Invalid number of arguments');
}

var operation = process.argv[2];

var myTweets = function () {
    var params = { screen_name: Keys.userids.twitter };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            // console.log('tweets: ' + JSON.stringify(tweets));
            for (let i = 0; i < Math.min(20, tweets.length); ++i) {
                var date = tweets[i].created_at;
                var msg = tweets[i].text;
                console.log(date + ' ' + msg);
                console.log('-----------------------------------------');
            }
        }
    })
};

var spotifySong = function (song) {
    spotifyClient.clientCredentialsGrant().then(
        function (data) {
            // console.log('The access token expires in ' + data.body['expires_in']);
            // console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyClient.setAccessToken(data.body['access_token']);
            spotifyClient.searchTracks(song,{'limit': '5'}).then(
                function (data) {
                    // console.log(JSON.stringify(data.body));
                    var items = data.body.tracks.items;
                    // var album = items[1].album;
                    // console.log(JSON.stringify(album));
                    items.forEach(item => {
                        var artist = item.artists[0].name;
                        var link = item.external_urls.spotify;
                        var albumName = item.name;
                        console.log(artist, link, albumName);
                    })
                },
                function (err) {
                    console.error(err);
                }
            )
        },
        function (err) {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        }
    )

}

// var movieThis = function (movie) {
//     console.log('in movieThis for ' + movie);
// }

// var doWhatItSays = function () {
//     console.log('in doWhatItSays');
// }

if (operation === 'my-tweets') {
    myTweets();
} else if (operation === 'spotify-this-song') {
    if (process.argv.length === 4) {
        spotifySong(process.argv[3]);
    } else {
        spotifySong("The Sign");
    }
    // } else if (operation === 'movie-this') {
    //     if (process.argv.length === 4) {
    //         movieThis(process.argv[3]);
    //     } else {
    //         throw new Error('Must include a movie title');
    //     }
    // } else if (operation === 'do-what-it-says') {
    //     doWhatItSays();
    // } else {
    //     throw new Error('Invalid operation ' + operation);
}

