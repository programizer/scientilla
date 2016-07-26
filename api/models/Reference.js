/* global Reference, sails, User */

/**
 * Reference.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var _ = require('lodash');
var stringSimilarity = require('string-similarity');
var Promise = require('bluebird');

//sTODO: evaluated whether convert the constants to numbers
var VERIFIED = 'verified';
var DRAFT = 'draft';
var PUBLIC = 'public';


module.exports = {
    /* CONSTANTS */
    VERIFIED: VERIFIED,
    DRAFT: DRAFT,
    PUBLIC: PUBLIC,
    DEFAULT_SORTING: {
        year: 'desc',
        updatedAt: 'desc'
    },
    /* ATTRIBUTES */
    attributes: {
        title: {
            type: 'STRING'
        },
        authors: 'STRING',
        year: 'STRING',
        journal: 'STRING',
        issue: 'STRING',
        volume: 'STRING',
        pages: 'STRING',
        articleNumber: 'STRING',
        doi: 'STRING',
        bookTitle: 'STRING',
        editor: 'STRING',
        publisher: 'STRING',
        conferenceName: 'STRING',
        conferenceLocation: 'STRING',
        acronym: 'STRING',
        type: 'STRING',
        sourceType: 'STRING',
        scopusId: 'STRING',
        wosId: 'STRING',
        publicCoauthors: {
            collection: 'User',
            via: 'publicReferences'
        },
        privateCoauthors: {
            collection: 'User',
            via: 'privateReferences'
        },
        discardedCoauthors: {
            collection: 'User',
            via: 'discardedReferences'
        },
        publicGroups: {
            collection: 'Group',
            via: 'publicReferences'
        },
        privateGroups: {
            collection: 'Group',
            via: 'privateReferences'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedReferences'
        },
        draft: 'BOOLEAN',
        draftCreator: {
            model: 'User'
        },
        draftGroupCreator: {
            model: 'Group'
        },
        suggestedGroups: {
            collection: 'Group',
            via: 'suggestedReferences'
        },
        isValid: function () {
            var requiredFields = [
                'authors',
                'title',
                'year',
                'type',
                'sourceType'
            ];
            var requiredFieldsTable = {
                conference: [
                    'conferenceName',
                    'conferenceLocation'
                ],
                book: [
                    'bookTitle',
                    'editor',
                    'publisher'
                ],
                journal: [
                    'journal'
                ]
            };
            var otherRequiredFields = requiredFieldsTable[this.sourceType];
            requiredFields = _.union(requiredFields, otherRequiredFields);
            var requiredValues =_.pick(this, requiredFields);
            return _.every(requiredValues, function(v) {return v;});
        },
        getAuthors: function () {
            if (!this.authors)
                return [];
            var authors = this.authors.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
            return authors;
        },
        getUcAuthors: function () {
            var authors = this.getAuthors();
            var ucAuthors = _.map(authors, function (a) {
                return a.toUpperCase();
            });
            return ucAuthors;
        },
        getSimilarity: function (ref) {
            var similarityFields = ['authors', 'title'];
            var similarity = 1;
            _.forEach(similarityFields, _.bind(function (f) {
                var fieldSimilarity;
                if (!_.isUndefined(this[f]) && !_.isUndefined(ref[f]) && !_.isNull(this[f]) && !_.isNull(ref[f])) {
                    fieldSimilarity = stringSimilarity.compareTwoStrings(this[f], ref[f]);
                } else {
                    fieldSimilarity = .999;
                }
                similarity *= fieldSimilarity;
            }, this));
            return similarity;
        },
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    },
    getFields: function () {
        var fields = [
            'authors',
            'title',
            'year',
            'journal',
            'issue',
            'volume',
            'pages',
            'articleNumber',
            'doi',
            'bookTitle',
            'editor',
            'publisher',
            'conferenceName',
            'conferenceLocation',
            'acronym',
            'type',
            'sourceType',
            'scopusId',
            'wosId'
        ];
        return fields;
    },
    deleteIfNotVerified: function (documentId) {
        function countAuthorsAndGroups(document) {
            return document.privateCoauthors.length +
                    document.publicCoauthors.length +
                    document.privateGroups.length +
                    document.publicGroups.length;
        }
        return Reference.findOneById(documentId)
                .populate('privateCoauthors')
                .populate('publicCoauthors')
                .populate('privateGroups')
                .populate('publicGroups')
                .then(function (document) {
                    if (countAuthorsAndGroups(document) === 0) {
                        sails.log.debug('Document ' + documentId + ' will be deleted');
                        return Reference.destroy({id: documentId});
                    }
                    return document;
                })
                .then(function (document) {
                    if (_.isArray(document))
                        return document[0];
                    return document;
                });
    },
    getByIdsWithAuthors: function (referenceIds) {
        return Reference.findById(referenceIds)
                .populate('privateCoauthors')
                .populate('publicCoauthors')
                .populate('privateGroups')
                .populate('publicGroups');
    },
    getSuggestedCollaborators: function (referenceId) {
        return Promise.all([
            Reference.findOne(referenceId).populate('collaborators'),
            User.find()
        ])
                .then(function (results) {
                    var reference = results[0];
                    var users = results[1];
                    var authors = reference.getUcAuthors();
                    var possibleAuthors = _.filter(
                            users,
                            function (u) {
                                var aliases = u.getUcAliases();
                                return !_.isEmpty(_.intersection(aliases, authors));
                            }
                    );
                    var collaboratorsId = _.map(reference.collaborators, "id");
                    var suggestedUsers = _.reject(
                            possibleAuthors,
                            function (u) {
                                return u.id === reference.owner
                                        || _.includes(collaboratorsId, u.id);
                            }
                    );

                    //TODO: search by aliases directly in the db
                    //select *  from reference where authors ilike any (select '%' || str || '%' from alias)
                    return suggestedUsers;
                });

    },
    filterSuggested: function (maybeSuggestedReferences, toBeDiscardedReferences, similarityThreshold) {
        var suggestedReferences = [];
        _.forEach(maybeSuggestedReferences, function (r1) {
            var checkAgainst = _.union(toBeDiscardedReferences, suggestedReferences);
            var discard = _.some(checkAgainst, function (r2) {
                return r1.getSimilarity(r2) > similarityThreshold;
            });
            if (discard)
                return;
            suggestedReferences.push(r1);
        });
        return suggestedReferences;
    },
    getVerifiedAndPublicReferences: function (references) {
        return _.filter(references, function (r) {
            return _.includes([VERIFIED, PUBLIC], r.status);
        });
    },
    verifyDraft: function(draftId, draftToDocument) {
        //sTODO: 2 equals documents should be merged
        return Reference.findOneById(draftId)
                .then(function(draft) {
                    if (!draft.isValid()) {
                        return draft;
                    }
                    draft.draft = false;
                    draftToDocument(draft);
                    return draft
                            .savePromise()
                            .then(function () {
                                return draft;
                            });
                });
    }
};
