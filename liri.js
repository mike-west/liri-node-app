var loaded = require("dotenv").config();
var twitter = require("twitter");
var spotify = require("spotify-web-api-node");
var request = require("request");
var jquery_param = require('jquery-param');
var fs = require("fs");
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

var divider = '-----------------------------------------';

if (process.argv.length < 3) {
    throw new Error('Invalid number of arguments');
}

var operation = process.argv[2];
var argumentsArr = process.argv.slice(3);
var arguments = ""
if (argumentsArr.length != 0) {
    arguments = argumentsArr.join('+')
}

// logs to both console and log.txt, input should be a string.
var logMe = function (logThis) {
    console.log(logThis);
    fs.appendFile("./log.txt", logThis + "\n", function(err) {
        if (err) {
            console.log(err);
        }
    })
};

var myTweets = function () {
    // for security my screen name is saved as an env. var.
    var params = { screen_name: Keys.userids.twitter };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            // logMe('tweets: ' + JSON.stringify(tweets));
            for (let i = 0; i < Math.min(20, tweets.length); ++i) {
                var date = tweets[i].created_at;
                var msg = tweets[i].text;
                logMe(date + ' ' + msg);
                logMe(divider);
            }
        }
    })
};

var spotifySong = function (song) {
    // get an access token, usually good for about an hour but we get a fresh
    // one every time.
    spotifyClient.clientCredentialsGrant().then(
        function (data) {
            // Save the access token so that it's used in the call
            spotifyClient.setAccessToken(data.body['access_token']);
            // find the song.
            spotifyClient.searchTracks(song, { 'limit': '5' }).then(
                function (data) {
                    var items = data.body.tracks.items; // items is an array of albums
                    var albums = data.body.tracks.items[0];
                    var title = data.body.tracks.items[0].name

                    for (let i = 0; i < items.length; ++i) {
                        var album = items[i].album;
                        var artist = album.artists[0].name;
                        var link = album.external_urls.spotify;
                        var albumName = album.name;
                        logMe("Song: " + title);
                        logMe("Artist: " + artist);
                        logMe("Link: " + link);
                        logMe("Album: " + albumName);
                        logMe(divider)
                    }
                },
                function (err) {
                    console.error(err);
                }
            )
        },
        function (err) {
            logMe(
                'Something went wrong when retrieving an access token',
                err.message
            );
        }
    )
}

var movieThis = function (movie) {
    var omdbBaseURL = "http://www.omdbapi.com/?";
    var params = {
        plot: "short",
        apikey: Keys.userids.omdb,
        t: movie
    };

    var movieQuery = omdbBaseURL + jquery_param(params);
    request(movieQuery, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movieInfo = JSON.parse(body);
            var imdbRating = movieInfo.Ratings.find(function (rating) {
                return rating.Source === "Internet Movie Database";
            });
            var rottenTomatoesRating = movieInfo.Ratings.find(function (rating) {
                return rating.Source === "Rotten Tomatoes";
            });
            logMe("Title:           " + movieInfo.Title);
            logMe("Released:        " + movieInfo.Year);
            logMe("IMDB Rating:     " + imdbRating.Value);
            if (rottenTomatoesRating != null) {
                logMe("Rotten Tomatoes: " + rottenTomatoesRating.Value + " fresh");
            }
            logMe("Country:         " + movieInfo.Country);
            logMe("Actors:          " + movieInfo.Actors);
            logMe("Plot: " + movieInfo.Plot);
            logMe(divider);
        }
    });

};

var doWhatItSays = function () {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return logMe(error);
        }
        var command_and_args = data.split(",");
        logMe("do-what-it-says: " +command_and_args.join(' '));
        if (command_and_args.length ===2) {
            runMe(command_and_args[0], command_and_args[1]);
        } else {
            runMe(command_and_args[0], "");
        }
    })
}

var runMe = function (operation, arguments) {
    if (operation === 'my-tweets') {
        myTweets();
    } else if (operation === 'spotify-this-song') {
        if (arguments.length > 0) {
            spotifySong(arguments);
        } else {
            spotifySong("The Sign");
        }
    } else if (operation === 'movie-this') {
        if (arguments.length > 0) {
            movieThis(arguments);
        } else {
            movieThis("Mr. Nobody");
        }
    } else if (operation === 'do-what-it-says') {
        doWhatItSays();
    } else {
        throw new Error('Invalid operation ' + operation);
    }
};

runMe(operation, arguments);
