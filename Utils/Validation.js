let fields = ['username', 'password'];

/**
 *
 * @param dataUser
 * @returns {boolean}
 */
function isValidUser(dataUser) {
    const temp = Object.keys(dataUser);
    if (!temp.includes('username') || !temp.includes('password'))
        return false;
    return !(dataUser['username'].length < 4 || dataUser['password'].length < 4);
}

/**
 *
 * @returns {boolean}
 * @param dataGroup
 */
function isValidGroup(dataGroup) {
    const temp = Object.keys(dataGroup);
    if (!temp.includes('name') || !temp.includes('description'))
        return false;
    return !(dataGroup['name'].length < 4);
}

/**
 *
 * @returns {boolean}
 * @param dataGroup
 */
//todo verify if is work this
function areValidFieldsOfGroup(dataGroup) {
    const temp = Object.keys(dataGroup);
    let fields = ['name', 'description', 'type'];
    if (temp.filter(e => !fields.includes(e)).length !== 0)
        return false;
    if (dataGroup.name !== undefined && dataGroup.name.length < 4)
        return false;
    return !(dataGroup['type'] !== undefined && !config.type.includes(dataGroup.type));
}

function isValidMembersBody(data) {
    if (Object.keys(data).includes("members") && Object.keys(data).length === 1)
        if (Array.isArray(data['members']))
            return true;
    return false;

}


function isValidNote(data) {
    const keys = Object.keys(data);
    let fields = ['name', 'notes'];
    if (keys.filter(e => !fields.includes(e)).length !== 0)
        return false;
    if (data.name !== undefined && data.name.length < 4)
        return false;
    return !(data.notes !== undefined && data.notes.length === 0);
}

function isValidPatchNotes(data) {
    if (Object.keys(data).length !== 1)
        return false;
    return Object.keys(data).includes("notes");

}

module.exports = {
    isValidUser,
    isValidGroup,
    areValidFieldsOfGroup,
    isValidNote,
    isValidMembersBody,
    isValidPatchNotes
};