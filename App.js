const {NotFoundHandler, UnsupportedMediaTypeHandler} = require("./Responses/ErrorHandler");
const {Unauthorized, MethodNotAllowed} = require("./Responses/Responses");
const {createConnection} = require('./Model/Model');
const {Auth, secret} = require("./Utils/Utils");
const {routes} = require('./Config/routes');
const {config} = require('./Config/config');
const {Path} = require('path-parser');
const http = require('http');

let db;

function urlParser(url) {
    let pathsTemplate = Object.keys(routes);
    for (let i = 0; i < pathsTemplate.length; i++) {
        let param = new Path(pathsTemplate[i]).test(url);
        if (param !== null)
            return {params: param, path: pathsTemplate[i]};
    }
    return null;
}

const requestListener = function (req, res) {
    if (["POST", "PUT", "PATCH"].includes(req.method) && !config['supported-content'].includes(req.headers['content-type'])) {
        UnsupportedMediaTypeHandler(req, res);
        return;
    }

    const result = urlParser(req.url);
    console.log(req.url);
    if (result === null) {
        NotFoundHandler(req, res);
        return;
    }

    if (routes[result.path][req.method] === undefined) {
        MethodNotAllowed(res);
        return;
    }

    console.assert(!config.log, 'Data: %o', {
        path: result.path,
        method: req.method,
        handler: routes[result.path][req.method]['handler']
    });

    let p = {params: result.params};
    if (routes[result.path][req.method].auth === undefined) {
        if (req.headers['authorization'] === undefined) {
            Unauthorized(res);
            return;
        } else {
            Auth(res, secret(req), db)
                .then(user => {
                        p['user'] = user;
                        routes[result.path][req.method]['handler'](req, res, p, db);
                    }
                ).catch(error => console.assert(!config.log, 'The error is %o', error));
            return;
        }
    }
    routes[result.path][req.method]['handler'](req, res, p, db);
};


async function start() {
    db = await createConnection(config);
    const server = http.createServer(requestListener);
    server.listen(config.PORT);
}


start();