const {LogAndServerError,created,BadRequest,Conflict} = require("../Responses/Responses");
const {UserUrl} = require("../Utils/UrlConstructor");
const {isValidUser} = require("../Utils/Validation");
const {JsonBody} = require("../Utils/Utils");

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function userPost(req, res, opt, db) {
    let body = await JsonBody(req);
    if (!isValidUser(body)) {
        BadRequest(res);
        return;
    }
    db.collection('users')
        .findOne({username: body['username']})
        .then(e => {
            if (e)
                Conflict(res, "User already exists");
            else
                db.collection('users')
                    .insertOne({username: body['username'], password: body['password']})
                    .then(r => created(res, UserUrl(r.insertedId.toHexString())))
                    .catch(error => LogAndServerError(error, res));


        })
        .catch(error => LogAndServerError(error, res));
}

module.exports = {
    userPost
};