const mongoose = require('mongoose')

mongoose
    .connect("mongodb+srv://catoven:R8JWEep434UuGbl4@cluster0.0s992bc.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
    .catch(err => console.error('Error connecting to mongo', err))

module.exports = mongoose