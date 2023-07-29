


const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');




const TelegramBot = require('node-telegram-bot-api');


const request = require('request');



const token = '6002823526:AAFgk92VIZAYGPd-ZURnsweSbdRVHAJWte8'; 



const admin = require('firebase-admin');
const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const db = getFirestore();

const bot = new TelegramBot(token, { polling: true });



bot.on('message', function (msg) {
  if (msg.text === 'hi' || msg.text === '/start') {
    bot.sendMessage(msg.chat.id, 'Hellooo ' + msg.from.last_name);
    bot.sendMessage(
      msg.chat.id,
      'Enter any Movie name to know its details like Director, Actors, Ratings, Collections'
    );
  } else {
    request.get(
      {
        url: 'http://www.omdbapi.com/?t=' + msg.text + '&apikey=6767e36f', 
      },
      function (error, response, body) {
        if (error) {
          console.error('Error fetching data from OMDB:', error);
          bot.sendMessage(
            msg.chat.id,
            'Sorry, there was an error while processing the request. Please try again later.'
          );
          return;
        }

        const data = JSON.parse(body);

        if (data.Response === 'True') {
          
          const movieDetails = {
            title: data.Title,
             director: data.Director,
            actors: data.Actors,
            plot: data.Plot,
            imdbRating: data.imdbRating,
            boxOffice: data.BoxOffice,
  };
   const moviesRef = db.collection('movies').doc(data.Title);

    moviesRef
    .set(movieDetails)
    .then(() => {
     moviesRef
  .get()
  .then((doc) => {
    if (!doc.exists) {
                    bot.sendMessage(msg.chat.id, 'Movie details not found in the database.');
                  }
   else {
     const movieDetailsFromDB = doc.data();
                    bot.sendMessage(
                      msg.chat.id,
                      'The Title of the Movie is ::  ' +
            '**' +
                      movieDetailsFromDB.title.toUpperCase() +
           '**' +
                      '\n\n\n' +
                      'It was directed by - ' +
                      movieDetailsFromDB.director +
          '\n\n' +
                      'The lead actors involved in this project are - ' +
                      movieDetailsFromDB.actors +
                      '\n\n' +
          'The plot of the movie is - \n' +
                      movieDetailsFromDB.plot +
                      '\n\n' +
                      'When the ratings are concerned,\nAs per IMDB the film is rated as ' +
                      movieDetailsFromDB.imdbRating +
                      '\n\n' +
                      'The Total Box-Office Collections of the movie are as follows,\n' +
        movieDetailsFromDB.boxOffice
                    );
                  }
                })
                .catch((error) => {
     console.error('Error retrieving movie details from Firestore:', error);
                  bot.sendMessage(
                          msg.chat.id,
        'Sorry, there was an error while processing the request. Please try again later.'
                  );
                });
    })
            .catch((error) => {
   console.error('Error saving movie details to Firestore:', error);
              bot.sendMessage(
      msg.chat.id,
    'Sorry, there was an error while processing the request. Please try again later.'
              );
            });
        } else {
          bot.sendMessage(
            msg.chat.id,
            'Sorry.......... I can\'t get that, Retry entering a valid Movie name\n\n(*** Movies already released are only considered ***)'
          );
        }
      }
    );
  }
});
