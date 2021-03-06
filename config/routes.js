/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

  '/': 'Homepage.default',

  'post /auths/register' : 'Auth.register',
  'post /users/:userId/references': 'Reference.create',
  'post /groups/:userId/references': 'Reference.create',
  'post /users/:researchEntityId/drafts': 'User.createDraft',
  'post /groups/:researchEntityId/drafts': 'Group.createDraft',
  'put /users/:id/drafts/verify-drafts': 'User.verifyDrafts',
  'put /groups/:id/drafts/verify-drafts': 'Group.verifyDrafts',
  'put /users/:userId/drafts/:id': 'Reference.update',
  'put /groups/:userId/drafts/:id': 'Reference.update',
  'put /users/:userId/references/:id': 'Reference.update',
  'put /groups/:userId/references/:id': 'Reference.update',
  'put /users/:id/verify-documents': 'User.verifyDocuments',
  'put /groups/:id/verify-documents': 'Group.verifyDocuments',
  'get /users/:id/references': 'User.getReferences',
  'get /groups/:id/references': 'Group.getReferences',
  'put /users/:id/documents/:referenceId/unverified': 'User.unverifyDocument',
  'put /groups/:id/documents/:referenceId/unverified': 'Group.unverifyDocument',
  'post /users/:id/documents': 'User.verifyDocument',
  'post /groups/:id/documents': 'Group.verifyDocument',
  'post /users/:id/discarded-document': 'User.discardDocument',
  'post /groups/:id/discarded-document': 'Group.discardDocument',
  'post /users/:id/discarded-documents': 'User.discardDocuments',
  'post /groups/:id/discarded-documents': 'Group.discardDocuments',
  'post /users/:id/copy-drafts': 'User.createDrafts',
  'post /groups/:id/copy-drafts': 'Group.createDrafts',
  'put /users/:id/drafts/:draftId/verified': 'User.verifyDraft',
  'put /groups/:id/drafts/:draftId/verified': 'Group.verifyDraft',
  'get /references/:id/suggestions' : 'Suggestion.find', //sTODO delete
  'get /references/:id/suggested-collaborators' : 'Reference.getSuggestedCollaborators',
  'get /users/:id/external-documents' : 'User.getExternalDocuments',
  'get /groups/:id/external-documents' : 'Group.getExternalDocuments',
  'delete /references/delete':'Reference.deleteDrafts'

//    'get /': {
//        controller: 'index',
//        action: 'index'
//    }

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

};
