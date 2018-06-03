var loaded = require("dotenv").config();
var Keys = require('./keys.js');

if (process.argv.length < 3) {
    throw new Error('Invalid number of arguments');
}

var operation = process.argv[2];

var myTweets = function() {
    console.log("in myTweets");
}

var spotifySong = function(song) {
    console.log('in spotifySong for ' + song);
}

var movieThis = function(movie) {
    console.log('in movieThis for ' + movie);
}

var doWhatItSays = function() {
    console.log('in doWhatItSays');
}

if (operation === 'my-tweets') {
    myTweets();
} else if (operation === 'spotify-this-song') {
    if (process.argv.length === 4) {
        spotifySong(process.argv[3]);
    } else {
        throw new Error('Must include a song title');
    }
} else if (operation === 'movie-this') {
    if (process.argv.length === 4) {
        movieThis(process.argv[3]);
    } else {
        throw new Error('Must include a movie title');
    }
} else if (operation === 'do-what-it-says') {
    doWhatItSays();
} else {
    throw new Error('Invalid operation ' + operation);
}

