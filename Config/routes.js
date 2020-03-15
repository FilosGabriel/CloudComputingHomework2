const {userPost} = require("../Controllers/UserController");
const {deleteMemberById, MembersGet, membersPost} = require("../Controllers/MembersController");
const {notesPost, NotesGet, getNoteId, patchNoteId, putNoteId, deleteNoteId} = require("../Controllers/NotesController");
const {groupsPost, groupGet, deleteGroup, getGroupId, groupsPut, patchGroup} = require('../Controllers/GroupController');

const routes = {
    "/users": {
        POST: {handler: userPost, auth: false},
    },
    "/users/groups": {
        POST: {handler: groupsPost},
        GET: {handler: groupGet}
    },
    "/users/groups/:id": {
        GET: {handler: getGroupId},
        PATCH: {handler: patchGroup},
        DELETE: {handler: deleteGroup},
        PUT: {handler: groupsPut},
    },
    "/users/groups/:id/members": {
        GET: {handler: MembersGet},
        POST: {handler: membersPost},
    },
    "/users/groups/:id/members/:id2": {
        DELETE: {handler: deleteMemberById},
    },
    //todo add for members
    "/users/groups/:id/notes": {
        GET: {handler: NotesGet},
        POST: {handler: notesPost},
    },
    //todo solve problem code delete
    "/users/groups/:id/notes/:id2": {
        GET: {handler: getNoteId},
        PUT: {handler: putNoteId},
        PATCH: {handler: patchNoteId},
        DELETE: {handler: deleteNoteId},
    }


};

module.exports = {
    routes
};

// const {patchNoteId} = require("../Controllers");
// const {membersPost} = require("../Controllers");
// const {MembersGet} = require("../Controllers");
// const {deleteMemberById} = require("../Controllers");
// const {deleteNoteId} = require("../Controllers");
// const {putNoteId} = require("../Controllers");
// const {getNoteId} = require("../Controllers");
// const {NotesGet} = require("../Controllers");
// const {notesPost} = require("../Controllers");
// const {deleteGroup} = require("../Controllers");
// const {groupsPut} = require("../Controllers");