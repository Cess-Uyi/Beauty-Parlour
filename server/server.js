const http = require('http');
const app = require('./app');
// const expressValidator = require('express-validator');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, ()=> {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`)
});

