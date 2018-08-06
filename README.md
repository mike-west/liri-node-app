# liri-node-app

## Overview
This is a command line node app, written in Javascript, that interprets a command and performs it.

#### node liri.js my-tweets
Returns the most recent 5 tweets from the users account. 

#### node spotify-this-song <song-name>
Returns information from spotify about this song.

#### node movie-this <movie-name>
Returns informaton from the Open Movie Database about the movie

#### node do-what-it-says
Reads a line from a random text file in the same directory and executes the command.

#### Logging
Anything written to the terminal is also appended to a log.txt file in the same directory.

#### Required:
You must set up a .env file in the same directory with the following informaiton:

### Spotify API keys
* SPOTIFY_ID=spotify id
* SPOTIFY_SECRET=spotify secret

### Twitter API keys

* TWITTER_CONSUMER_KEY=twitter consumer key
* TWITTER_CONSUMER_SECRET=twitter secret

* TWITTER_ACCESS_TOKEN_KEY=twitter access token key
* TWITTER_ACCESS_TOKEN_SECRET=twitter access token secret

* TWITTER_SCREEN_NAME=your twitter screen name

All of these can be obtained at the Twitter and Spotify developers site
