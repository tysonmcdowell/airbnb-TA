const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Spot, Review, SpotImage, User } = require("../../db/models");
const { check, validationResult } = require("express-validator");

const router = express.Router();

