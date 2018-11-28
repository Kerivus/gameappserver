const mongoose = require('mongoose');
const db = 'mongodb://nodemcu1:nodemcu1@ds039027.mlab.com:39027/apidb01';

mongoose
    .connect(
        db,
        { useNewUrlParser : true }
    )
    .then(()=>{
        console.log('Connected to database');
    })
    .catch(error => {
        console.log('Mongoose connection error: ', error);
    });

const schema = mongoose.Schema({
    id:{ type: String},
    name:{ type: String},
    summary:{ type: String},
    genres:{ type: String},
    platform:{ type: String},
    release_dates:{ type: String},
    image:{ type: String},
    view:{ type: String}
});

const Game = mongoose.model('Game', schema, 'gameCollection');

module.exports = Game;