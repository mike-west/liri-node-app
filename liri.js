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

var myTweets = function () {
    // for security my screen name is saved as an env. var.
    var params = { screen_name: Keys.userids.twitter };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            // console.log('tweets: ' + JSON.stringify(tweets));
            for (let i = 0; i < Math.min(20, tweets.length); ++i) {
                var date = tweets[i].created_at;
                var msg = tweets[i].text;
                console.log(date + ' ' + msg);
                console.log(divider);
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

                    for (let i = 0; i < items.length; ++i) {
                        var album = items[i].album;
                        var artist = album.artists[0].name;
                        var link = album.external_urls.spotify;
                        var albumName = album.name;
                        console.log("Song: " + song);
                        console.log("Artist: " + artist);
                        console.log("Link: " + link);
                        console.log("Album: " + albumName);
                        console.log(divider)
                    }
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
            console.log("Title:           " + movieInfo.Title);
            console.log("Released:        " + movieInfo.Year);
            console.log("IMDB Rating:     " + imdbRating.Value);
            if (rottenTomatoesRating != null) {
                console.log("Rotten Tomatoes: " + rottenTomatoesRating.Value + " fresh");
            }
            console.log("Country:         " + movieInfo.Country);
            console.log("Actors:          " + movieInfo.Actors);
            console.log("Plot: " + movieInfo.Plot);
            console.log(divider);
        }
    });

};

var doWhatItSays = function () {
    // console.log('in doWhatItSays');
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
            throw new Error('Must include a movie title');
        }
    } else if (operation === 'do-what-it-says') {
        doWhatItSays();
    } else {
        throw new Error('Invalid operation ' + operation);
    }
};

runMe(operation, arguments);
