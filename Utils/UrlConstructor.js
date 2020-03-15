const {config} = require('../Config/config');

/**
 * @return {string}
 */
function UserUrl(id) {
    return `${config.URL_SERVER}/users/${id}`;
}

/**
 * @return {string}
 */
function GroupUrl(id) {
    return `${config.URL_SERVER}/users/groups/${id}`;
}

/**
 * @return {string}
 */
function MembersUrl(id) {
    return `${config.URL_SERVER}/users/groups/${id}/members`;
}

/**
 * @return {string}
 */
function NotesUrl(id) {
    return `${config.URL_SERVER}/users/groups/${id}/notes`;
}

/**
 * @return {string}
 */
function NoteIdUrl(id1, id2) {
    return `${config.URL_SERVER}/users/groups/${id1}/notes/${id2}`;
}

/**
 * @return {string}
 */
function SelfGroupsUrl(id) {
    return `${config.URL_SERVER}/users/groups`;
}

/**
 * @return {string}
 */
function SelfNoteId(id1, id2) {
    return `${config.URL_SERVER}/users/groups/${id1}/notes/${id2}`;

}

/**
 * @return {string}
 */
function SelfMembersUrl(id) {
    return `${config.URL_SERVER}/users/groups/${id}/members`;
}

/**
 * @return {string}
 */
function SelfNotesUrl(id) {
    return `${config.URL_SERVER}/users/groups/${id}/notes`;
}

module.exports = {
    UserUrl, GroupUrl, MembersUrl, NotesUrl, SelfGroupsUrl, SelfMembersUrl, NoteIdUrl
    , SelfNotesUrl,SelfNoteId
};