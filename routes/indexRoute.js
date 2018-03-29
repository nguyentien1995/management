// inject Dependency
var express = require('express');
var router = express.Router();
// Require our controllers
var indexController = require('../controllers/indexController');
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}
// login url do not need to check for logged in
router.get('/', isAuthenticated, indexController.indexHome);
router.get('/login', indexController.indexLoginGet);
router.post('/login', indexController.indexLoginPost);
router.get('/logout', indexController.indexLogOutGet);
router.get('/readme', isAuthenticated, indexController.indexReadMeGet);
router.get('/dashboard', isAuthenticated, indexController.indexDashBoardGet);
router.get('/flot', isAuthenticated, indexController.indexFlotGet);
router.get('/morris', isAuthenticated, indexController.indexMorrisGet);
router.get('/tables', isAuthenticated, indexController.indexTablesGet);
router.get('/forms', isAuthenticated, indexController.indexFormsGet);
router.get('/panelswells', isAuthenticated, indexController.indexPanelSwellsGet);
router.get('/buttons', isAuthenticated, indexController.indexButtonsGet);
router.get('/notifications', isAuthenticated, indexController.indexNotifyGet);
router.get('/typography', isAuthenticated, indexController.indexTypographyGet);
router.get('/icons', isAuthenticated, indexController.indexIconsGet);
router.get('/grid', isAuthenticated, indexController.indexGridGet);
router.get('/error', isAuthenticated, indexController.indexErrGet);
module.exports = router;