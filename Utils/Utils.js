const {SelfNoteId} = require("./UrlConstructor");
const {NoteIdUrl} = require("./UrlConstructor");
const {NotesUrl} = require("./UrlConstructor");
const {MembersUrl} = require("./UrlConstructor");
const {GroupUrl} = require("./UrlConstructor");
const {Unauthorized, LogAndServerError} = require("../Responses/Responses");
const {config} = require('../Config/config');


/**
 *
 * @param req
 * @returns {Promise}
 * @constructor
 */
function JsonBody(req) {
    return new Promise((resolve, reject) => {
        let data = [];
        req.on('data', chunk => {
            data.push(chunk)
        });
        req.on('end', () => {
            try {
                let body = JSON.parse(data);
                resolve(body);
            } catch (e) {
                console.assert(!config.log, 'Error is %o', e);
                reject(e);
            }
        })
    })
}

async function Auth(res, opt, db) {
    return new Promise((resolve, reject) => {
        db.collection('users')
            .findOne({username: opt.user})
            .then(e => {
                if (e === null) {
                    Unauthorized(res);
                    reject();
                } else
                    resolve(e);
            })
            .catch(e => LogAndServerError(e, res));
    });
}


function secret(req) {
    let header = req.headers['authorization'] || '',        // get the header
        token = header.split(/\s+/).pop() || '',            // and the encoded auth token
        auth = new Buffer.from(token, 'base64').toString(),    // convert from base64
        parts = auth.split(/:/),                          // split on colon
        username = parts[0],
        password = parts[1];
    return {user: username, passwd: password};
}

function processHateoasMembers(data) {
    return data['members'];
}

function processHateoasGroup(data) {
    data['links'] = {
        self: {
            href: GroupUrl(data['_id'])
        },
        members: {
            href: MembersUrl(data['_id'])
        },
        notes: {
            href: NotesUrl(data['_id'])
        }
    };
    return data;

}

function processHateoasNotes(data, id2) {
    return {
        name: data.name, link: {
            note: {
                href: NoteIdUrl(id2, data['_id'])
            }
        }
    };
}

function NoteIdHateoas(data, id) {
    return {
        name: data.name,
        notes: data.notes,
        links: {
            self: {
                href: SelfNoteId(id, data['notes'][0]._id)
            }
        }
    }
}

module.exports = {
    JsonBody, processHateoasNotes,
    Auth, secret,NoteIdHateoas
    , processHateoasGroup
    , processHateoasMembers
};