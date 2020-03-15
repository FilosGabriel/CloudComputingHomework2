const {config} = require('../Config/config');

function created(response, link) {
    response.statusCode = 201;
    response.setHeader('Location', link);
    response.end();
}

function ServerError(response) {
    response.statusCode = 500;
    response.end();
}

function BadRequest(response) {
    response.statusCode = 400;
    response.end();
}

function Conflict(response, message) {
    response.statusCode = 409;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({message: message}));
    response.end();
}

function NotFound(response) {
    response.statusCode = 404;
    response.end();
}

function Unauthorized(response) {
    response.statusCode = 401;
    response.setHeader('WWW-Authenticate', 'Basic');
    response.end();
}

function CollectionsResource(response, data, processHateoas, field, self) {
    let responseData = {_embedded: {[field]: []},links:{href:self()}};
    data.forEach(e => responseData._embedded[field].push(processHateoas(e)));
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(responseData));
    response.end();
}

function NoContent(res) {
    res.statusCode = 204;
    res.end();
}

function Resource(response, data, hateoas) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(hateoas(data)));
    response.end();
}

function MethodNotAllowed(res) {
    res.statusCode = 405;
    res.end();
}

function NotFoundOrNoContent(g, res) {
    if (g.value === null)
        NotFound(res);
    else
        NoContent(res);
}

function ResourceOrNotFound(e, res,hateoasResource) {
    if (e !== null)
        Resource(res, e,hateoasResource);
    else
        NotFound(res);
}

function LogAndServerError(error, res) {
    console.assert(!config.log, 'the error is %o', error);
    ServerError(res);
}


module.exports = {
    created, ServerError,
    BadRequest, Conflict,
    NotFound, Unauthorized,
    CollectionsResource,
    NoContent, MethodNotAllowed,
    Resource, LogAndServerError,
    ResourceOrNotFound, NotFoundOrNoContent
};