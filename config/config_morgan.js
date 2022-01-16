const morgan = require('morgan');

//we are defining a new parameter called host
morgan.token('host', function(req, res) {
    return req.hostname;
});

// we are using the host parameter
module.exports =  morgan(':method :host :url :status :res[content-length] - :response-time ms');