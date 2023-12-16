const express = require('express')
const viewController = require('../controller/view') 

const router = express.Router() 


router.get('/sign-up', viewController.signUpPage)
router.get('/sign-in', viewController.signInPage)
router.get('/', viewController.homePage)
router.get('/edit', viewController.editPage)
router.get('/delete', viewController.deletePage)

module.exports = router