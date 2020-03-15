const {UnsupportedMediaTypeHandler} = require("../Responses/ErrorHandler");
const {SelfGroupsUrl} = require("../Utils/UrlConstructor");
const {processHateoasGroup} = require("../Utils/Utils");
const {GroupUrl} = require("../Utils/UrlConstructor");
const {NotFoundOrNoContent} = require("../Responses/Responses");
const {areValidFieldsOfGroup} = require("../Utils/Validation");
const {ObjectId} = require('mongodb');
const {ResourceOrNotFound} = require("../Responses/Responses");
const {CollectionsResource} = require("../Responses/Responses");
const {Conflict} = require("../Responses/Responses");
const {created} = require("../Responses/Responses");
const {LogAndServerError} = require("../Responses/Responses");
const {BadRequest} = require("../Responses/Responses");
const {isValidGroup} = require("../Utils/Validation");
const {JsonBody} = require("../Utils/Utils");

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function groupsPost(req, res, opt, db) {
    try {
        let groupData = await JsonBody(req);
        if (!isValidGroup(groupData)) {
            BadRequest(res);
            return;
        }
        let user = opt.user;
        db.collection('groups')
            .findOne({name: groupData['name']})
            .then(g => {
                if (g == null)
                    db.collection('groups')
                        .insertOne({
                            name: groupData['name'],
                            description: groupData['description'],
                            owner: user.username,
                            creationDate: Date.now(),
                            lastModified: Date.now(),
                            members: [],
                            notes: []
                        })
                        .then(r => created(res, GroupUrl(r.insertedId.toHexString())))
                        .catch(error => LogAndServerError(error, res));
                else
                    Conflict(res, 'Group already exists');
            })
            .catch(error => LogAndServerError(error, res))
    } catch (e) {
        UnsupportedMediaTypeHandler(req, res);
    }

}


/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function groupGet(req, res, opt, db) {
    let user = opt.user;
    db.collection('groups')
        .find({owner: user.username})
        .project({
            name: 1,
            description: 1,
            creationDate: 1,
            lastModified: 1,

        })
        .toArray()
        .then(e => CollectionsResource(res, e, processHateoasGroup, 'groups', SelfGroupsUrl))
        .catch(e => LogAndServerError(e, res));
}

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function getGroupId(req, res, opt, db) {
    let user = opt.user;
    db.collection('groups')
        .findOne(
            {_id: ObjectId(opt.params.id), owner: user.username},
            {projection: {members: false, notes: false}}
        )
        .then(e => {
            console.log(e);
            ResourceOrNotFound(e, res, processHateoasGroup)
        })
        .catch(e => LogAndServerError(e, res))
}

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function patchGroup(req, res, opt, db) {
    let user = opt.user;
    let groupData = await JsonBody(req);
    if (!areValidFieldsOfGroup(groupData)) {
        BadRequest(res);
        return;
    }
    db.collection('groups')
        .findOneAndUpdate(
            {_id: ObjectId(opt.params.id), owner: user.username},
            {$set: {...groupData}}
        )
        .then(g => NotFoundOrNoContent(g, res))
        .catch(e => LogAndServerError(e, res));
}


/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function deleteGroup(req, res, opt, db) {
    let user = opt.user;
    db.collection('groups')
        .findOneAndDelete({_id: ObjectId(opt.params.id), owner: user.username})
        .then(g => NotFoundOrNoContent(g, res))
        .catch(e => LogAndServerError(e, res));
}


/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function groupsPut(req, res, opt, db) {
    let groupData = await JsonBody(req);
    if (!isValidGroup(groupData)) {
        BadRequest(res);
        return;
    }
    let user = opt.user;
    db.collection('groups').findOne({_id: ObjectId(opt.params.id), owner: user.username}).then(g => {
        if (g === null) {
            res.statusCode = 404;
            res.end();
        } else
            db.collection('groups')
                .findOneAndReplace(
                    {owner: user.username, _id: ObjectId(opt.params.id)},
                    {
                        name: groupData['name'],
                        description: groupData['description'],
                        owner: user.username,
                        creationDate: Date.now(),
                        lastModified: Date.now(),
                        members: g.members,
                        notes: g.notes
                    }
                )
                .then(g => NotFoundOrNoContent(g, res))
                .catch(error => LogAndServerError(error, res));
    }).catch(error => LogAndServerError(error, res));
}


module.exports = {
    groupsPost, groupGet, getGroupId, patchGroup, deleteGroup, groupsPut
}