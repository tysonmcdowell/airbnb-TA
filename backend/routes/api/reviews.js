const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Review, Spot, User, ReviewImage } = require("../../db/models");
const { check, validationResult } = require("express-validator");

const router = express.Router();



module.exports = router;
