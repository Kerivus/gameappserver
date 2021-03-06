const express = require('express');
const app = express();
const axios = require('axios');
const Game = require('./Game');
const cors = require('cors');
//const path = require('path'); //---heroku---

const port = process.env.PORT || 2000;

app.use(cors());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const apikey = '1f38bca04a14437b5310f3faa25e64e7';

app.get('/searchgame', (req,res) =>{
    const name = req.query.name;
    const gamesReq = `https://api-endpoint.igdb.com/games/?search=${name}&fields=id,name,cover,first_release_date`;

    axios
        .get(gamesReq, {
            headers:{
                'user-key': apikey,
                Accept: 'application/json'
            }
        })
        .then(response =>{
            var data =[];
            for (i = 0; i < response.data.length; i++) {
                var d = new Date(response.data[0].first_release_date);
                var month = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"][d.getMonth()];
                var str = d.getDay()+ ' ' + month + ' ' + d.getFullYear();

                data.push({
                    "id" : response.data[i].id,
                    "name": response.data[i].name,
                    "image": response.data[i].cover.url,
                    "date": str
                });
            }
            res.status(200).json(data);
        })
        .catch(error => {
            res.status(400).json(error);
        });
});

app.get('/getgame', (req, res) => {
    const id = req.query.id;
    const gameReq = `https://api-endpoint.igdb.com/games/${id}?fields=*`;
    const game = new Game();
    let platformIndex = "";
    let genresIndex = "";

    axios
        .get(gameReq,{
            headers:{
                'user-key': apikey,
                Accept: 'application/json'
            }
        })
        .then(response =>{
            var d = new Date(response.data[0].first_release_date);
            var month = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"][d.getMonth()];
            var str = d.getDay()+ ' ' + month + ' ' + d.getFullYear();

            game.id = response.data[0].id;
            game.name = response.data[0].name;
            game.summary = response.data[0].summary;
            game.release_dates = str;
            game.image = response.data[0].cover.url;
            platformIndex = response.data[0].platforms;
            genresIndex = response.data[0].genres;

            //Platforms
            let platformsArr = "";

            for (i = 0; i < platformIndex.length; i++) {
                if (i != platformIndex.length - 1) {
                    platformsArr = platformsArr + platformIndex[i] + ",";
                } 
                else {
                    platformsArr = platformsArr + platformIndex[i];
                }
            }

            const platformReq = `https://api-endpoint.igdb.com/platforms/${platformsArr}?fields=name`;

            return axios.get(platformReq,{
                    headers:{
                        'user-key': apikey,
                        Accept: 'application/json'
                    }
                });
        })
        .then(response =>{
            //Platforms Reponse
            let platforms = "";
            for (i = 0; i < response.data.length; i++) {
                if (i != response.data.length - 1) {
                    platforms = platforms + response.data[i].name+ ", ";
                } 
                else {
                    platforms = platforms + response.data[i].name;
                }
            }
            game.platform = platforms;

            //Genre
            let genresArr = "";
 
            for (i = 0; i < genresIndex.length; i++) {
                if (i != genresIndex.length - 1) {
                    genresArr = genresArr + genresIndex[i] + ",";
                } 
                else {
                    genresArr = genresArr + genresIndex[i];
                }
            }

            const GenresReq = `https://api-endpoint.igdb.com/genres/${genresArr}?fields=name`;

            return axios.get(GenresReq,{
                headers:{
                    'user-key': apikey,
                    Accept: 'application/json'
                }
            });
        })
        .then(response =>{
            //Genre Response
            let genres = "";
            for (i = 0; i < response.data.length; i++) {
                if (i != response.data.length - 1) {
                    genres = genres + response.data[i].name+ ", ";
                } 
                else {
                    genres = genres + response.data[i].name;
                }
            }
            game.genres = genres;
            
            if (!game.name || !game.platform || !game.genres) {
                res.status(200).json('Not found');
                return;
            }
            
            game
                .save()
                .then(response => {
                    res.status(200).json(response);
                })
                .catch(error =>{
                    res.status(400).json(error);
                });
        })
        .catch(error => {
            res.status(400).json(error);
        });
});

app.get('/getonegame', (req, res) => {
    const id = req.query.id;
    Game.findOne( {'id': id})
        .then(response => {
            res.status(200).json(response);
        })
        .catch(error => {
            res.status(400).json(error);
        });
    });
  
app.get('/getallgames', (req, res) => {
Game.find({})
    .then(response => {
        res.status(200).json(response);
    })
    .catch(error => {
        res.status(400).json(error);
    });
});

app.get('/deletegame', (req, res) => {
Game.deleteMany({ id: req.query.id })
    .then(response => {
        res.status(200).json(response);
    })
    .catch(error => {
        res.status(400).json(error);
    });
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
