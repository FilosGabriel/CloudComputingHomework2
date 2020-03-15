const {UnsupportedMediaTypeHandler} = require("../Responses/ErrorHandler");
const {SelfMembersUrl} = require("../Utils/UrlConstructor");
const {processHateoasMembers} = require("../Utils/Utils");
const {isValidMembersBody} = require("../Utils/Validation");
const {JsonBody} = require("../Utils/Utils");
const {CollectionsResource, LogAndServerError} = require("../Responses/Responses");
const {NotFound, NoContent, BadRequest, created} = require("../Responses/Responses");
const {ObjectId} = require('mongodb');

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function deleteMemberById(req, res, opt, db) {
    db.collection('groups')
        .updateMany(
            {_id: ObjectId(opt.params.id), owner: opt.user.username},
            {$pull: {"members": opt.params.id2}},
            {multi: true})
        .then(e => {
            console.log(e);
            if (e.modifiedCount=== 1)
                NoContent(res);
            else
                NotFound(res);
        })

        .catch(e => LogAndServerError(e, res))
}

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function MembersGet(req, res, opt, db) {
    let user = opt.user;
    const getself = () => {
        return SelfMembersUrl(opt.params.id)
    };
    db.collection('groups')
        .find({owner: user.username, _id: ObjectId(opt.params.id)})
        .project({members: 1})
        .toArray()
        .then(e => CollectionsResource(res, e, processHateoasMembers, 'members', getself))
        .catch(e => LogAndServerError(e, res));
}


const distinctId = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function membersPost(req, res, opt, db) {
    try{
    let MembersBody = await JsonBody(req);
    if (!isValidMembersBody(MembersBody)) {
        BadRequest(res);
        return;
    }
    let user = opt.user;
    db.collection('groups')
        .findOne({owner: user.username, _id: ObjectId(opt.params.id)})
        .then(
            group => {
                if (!group)
                    NotFound(res);
                else {
                    let membership = group.members;
                    let tempArray = [];
                    MembersBody['members'].forEach(member => {
                        tempArray.push(db.collection('users').findOne({username: member}, {
                            username: 0,
                            password: 0
                        }).then(r => {
                            return r._id.toString();
                        }))
                    });
                    Promise.all(tempArray).then(users => {
                        membership=[...membership,...users].filter(distinctId);
                        // membership = membership.concat(users).filter(distinctId);
                        db.collection('groups')
                            .findOneAndUpdate(
                                {owner: user.username, _id: ObjectId(opt.params.id)},
                                {
                                    $set: {lastModified: Date.now(), members: membership}
                                }
                            )
                            .then(g => {
                                    console.log(g);
                                    created(res, membership);
                                }
                            ).catch(e => LogAndServerError(e, res));
                    })
                }
            }
        )
        .catch(error => LogAndServerError(error, res));}
        catch (e) {
            UnsupportedMediaTypeHandler(req,res);
        }
}

module.exports = {
    deleteMemberById,
    MembersGet,
    membersPost
};
