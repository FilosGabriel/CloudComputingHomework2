const {NoteIdHateoas} = require("../Utils/Utils");
const {processHateoasNotes} = require("../Utils/Utils");
const {SelfNotesUrl} = require("../Utils/UrlConstructor");
const {isValidPatchNotes} = require("../Utils/Validation");
const {NoContent, NotFound, BadRequest, created, ResourceOrNotFound, LogAndServerError, CollectionsResource} = require("../Responses/Responses");
const {JsonBody} = require("../Utils/Utils");
const {isValidNote} = require("../Utils/Validation");
const {ObjectId} = require('mongodb');

async function notesPost(req, res, opt, db) {
    let notesBody = await JsonBody(req);
    if (!isValidNote(notesBody)) {
        BadRequest(res);
        return;
    }
    let user = opt.user;
    console.log(opt.user._id.toString());
    db.collection('groups')
        .findOne({$or: [{members: opt.user._id.toString()}, {owner: user.username,}], _id: ObjectId(opt.params.id)})
        .then(
            group => {
                if (!group) {
                    NotFound(res);
                    return;
                }
                console.log(group);
                notesBody['_id'] = ObjectId();
                group.notes.push(notesBody);
                db.collection('groups')
                    .findOneAndUpdate(
                        {_id: ObjectId(opt.params.id)},
                        {
                            $set: {lastModified: Date.now(), notes: group.notes}
                        }
                    )
                    .then(g => {
                            console.log(g);
                            created(res, notesBody['_id']);

                        }
                    ).catch(e => LogAndServerError(e, res));

            }
        )
        .catch(error => LogAndServerError(error, res));
}


/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function NotesGet(req, res, opt, db) {
    let user = opt.user;
    const f = (data) => {
        return processHateoasNotes(data, opt.params.id)
    };
    db.collection('groups')
        .find({$or: [{members: opt.user._id.toString()}, {owner: user.username,}], _id: ObjectId(opt.params.id)})
        .project({notes: 1, _id: 0})
        .toArray()
        .then(e => {
            if (e.length === 0) {
                NotFound(res);
                return;
            }
            CollectionsResource(res, e[0].notes, f, 'notes', () => {
                return SelfNotesUrl(opt.params.id);
            })
        })
        .catch(e => LogAndServerError(e, res));
}

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function getNoteId(req, res, opt, db) {
    db.collection('groups')
        .find(
            // {$or: [{members: opt.user._id.toString()}, {owner: user.username,}], _id: ObjectId(opt.params.id)}
            {
                notes: {$elemMatch: {_id: ObjectId(opt.params.id2)}},
                $or: [{members: opt.user._id.toString()}, {owner: opt.user.username,}], _id: ObjectId(opt.params.id)
            }
        )
        .project(
            {_id: 0, notes: {$elemMatch: {_id: ObjectId(opt.params.id2)}}})
        .toArray()
        .then(e => ResourceOrNotFound(e[0], res, (data) => {
            return NoteIdHateoas(data, opt.params.id)
        }))
        .catch(e => LogAndServerError(e, res))
}

/**
 * @param req {Request}
 * @param res {Response}
 * @param opt {Options}
 * @param db {Db}
 */
async function putNoteId(req, res, opt, db) {
    let user = opt.user;
    let notesBody = await JsonBody(req);
    if (!isValidNote(notesBody)) {
        BadRequest(res);
        return;
    }
    db.collection('groups')
        .updateMany(
            {
                notes: {$elemMatch: {_id: ObjectId(opt.params.id2)}},
                $or: [{members: opt.user._id.toString()}, {owner: opt.user.username,}], _id: ObjectId(opt.params.id)
            },
            {$set: {"notes.$": {...notesBody, _id: ObjectId(opt.params.id2)}}})
        .then(e => {
            console.log(e.result);
            if (e.result.n === 1)
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
async function deleteNoteId(req, res, opt, db) {
    let user = opt.user;
    db.collection('groups')
        .updateMany(
            {$or: [{members: opt.user._id.toString()}, {owner: user.username,}], _id: ObjectId(opt.params.id)},
            {$pull: {"notes": {_id: ObjectId(opt.params.id2)}}},
            {multi: true})
        .then(e => {
            console.log(e);
            if (e.result.n === 1)
                NoContent(res);
            else
                NotFound(res);
        })

        .catch(e => LogAndServerError(e, res))
}


async function patchNoteId(req, res, opt, db) {
    let user = opt.user;
    let notesBody = await JsonBody(req);
    if (!isValidPatchNotes(notesBody)) {
        BadRequest(res);
        return;
    }
    db.collection('groups')
        .updateMany(
            {notes: {$elemMatch: {_id: ObjectId(opt.params.id2)}}},
            {$set: {"notes.$": {...notesBody, _id: ObjectId(opt.params.id2)}}})
        .then(e => {
            if (e.result.n === 1)
                NoContent(res);
            else
                NotFound(res);
        })

        .catch(e => LogAndServerError(e, res))
}

module.exports = {
    notesPost, NotesGet, getNoteId, deleteNoteId, putNoteId, patchNoteId
};