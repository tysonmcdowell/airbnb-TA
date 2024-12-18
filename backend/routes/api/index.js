const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js'); // Add this line
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter); // Add this line

//! Keep this route to test frontend setup in Mod 5
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;