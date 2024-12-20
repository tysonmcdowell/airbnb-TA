const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Spot, Review, ReviewImage, SpotImage, User } = require("../../db/models");
const { check, validationResult, query } = require("express-validator");
const { validator } = require("validator");
const { Op, where } = require("sequelize");

const router = express.Router();

const validateSpotFields = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .notEmpty()
    .withMessage("Latitude must be within -90 and 90")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .notEmpty()
    .withMessage("Longitude must be within -180 and 180")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .notEmpty()
    .withMessage("Price per day must be a positive number")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a positive number"),
];

const validateQueryParams = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),

  query("size")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20"),

  query("minLat")
    .optional()
    .isDecimal()
    .withMessage("Minimum latitude is invalid"),

  query("maxLat")
    .optional()
    .isDecimal()
    .withMessage("Maximum latitude is invalid"),

  query("minLng")
    .optional()
    .isDecimal()
    .withMessage("Minimum longitude is invalid"),

  query("maxLng")
    .optional()
    .isDecimal()
    .withMessage("Maximum longitude is invalid"),

  query("minPrice")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),

  query("maxPrice")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
];

const validateReviews = [
    check("review").notEmpty().withMessage("Review text is required"),
    check("stars")
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be an integer from 1 to 5"),
  ];

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const validationErrors = validationResult(req);
  // console.log(validationErrors);
  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach((error) => {
      if (!errors[error.path]) {
        errors[error.path] = error.msg;
      }
    });
    console.log("Validation errors:", {
      message: "Bad Request",
      errors,
    }); 
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }
  next();
}

async function addExtraSpotInfo(spot) {
  const spotData = spot.toJSON();

  const reviews = await Review.findAll({
    where: { spotId: spot.id },
    attributes: ["stars"],
  });

  let avgRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
    avgRating = sum / reviews.length;
    avgRating = parseFloat(avgRating.toFixed(1)); 
  }
  spotData.avgRating = avgRating > 0 ? avgRating : 0;

  const previewImage = await SpotImage.findOne({
    where: {
      spotId: spot.id,
      preview: true,
    },
    attributes: ["url"],
  });
  spotData.previewImage = previewImage ? previewImage.url : null;

  return spotData;
}



//GET /api/spots
router.get(
  "/",
  validateQueryParams,
  handleValidationErrors,
  async (req, res) => {
    try {
      let { page = 1, size = 20 } = req.query;

      if (size && size > 20) {
        size = 20;
      }

      if (page && size) {
        page = Number(page);
        size = Number(size);
        console.log(page, size);
      }

      limit = size;
      offset = size * (page - 1);

      const allSpots = await Spot.findAll({
        limit,
        offset,
      });

      const spotsWithInfo = await Promise.all(
        allSpots.map(async (spot) => {
          return await addExtraSpotInfo(spot);
        })
      );

      return res.status(200).json({ Spots: spotsWithInfo, page, size });
    } catch (error) {
      console.error("Error in GET /api/spots:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//GET /api/spots/current
router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const userSpots = await Spot.findAll({ where: { ownerId: currentUserId } });

    const spotsWithInfo = await Promise.all(
      userSpots.map(async (spot) => {
        return await addExtraSpotInfo(spot);
      })
    );

    return res.status(200).json({ Spots: spotsWithInfo });
  } catch (error) {
    console.error("Error in GET /api/spots/current:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//GET /api/spots/:spotId/reviews
router.get("/:spotId/reviews", async (req, res) => {
  try {
    let { spotId } = req.params;
    spotId = Number(spotId);

    if (spotId && !isNaN(spotId)) {
      let Reviews = await Review.findAll({
        where: {
          spotId,
        },
        attributes: [
          "id",
          "userId",
          "spotId",
          "review",
          "stars",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });

      if (!Reviews) throw new Error("Spot couldn't be found");

      const reviewId = Reviews[0].dataValues.id;

      const foundReviewImage = await ReviewImage.findAll({
        where: {
          reviewId,
        },
        attributes: ["id", "url"],
      });

      const reviewsArray = Reviews.map((review) => {
        let reviewObj = review.toJSON();

        if (review && !review.ReviewImages) {
          console.log("no images here");
          reviewObj.ReviewImages = foundReviewImage;

          return reviewObj;
        }
      });

      res.status(200).json({ Reviews: reviewsArray });
    }
  } catch (err) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
});

//GET /api/spots/:spotId
router.get("/:spotId", async (req, res) => {
  try {
    const { spotId } = req.params;

    // Find the spot by its ID
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          attributes: ["id", "url", "preview"],
        },
        {
          model: Review,
          attributes: [], // To calculate numReviews and avgStarRating
        },
        {
          model: User,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    // If spot doesn't exist, return 404
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Calculate avgStarRating and numReviews
    const reviews = await Review.findAll({ where: { spotId } });
    const numReviews = reviews.length;
    const avgStarRating = reviews.length
      ? parseFloat(
          (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1)
        )
      : 0;

    // Transform spot into plain object and add additional fields
    const spotDetails = spot.toJSON();
    spotDetails.numReviews = numReviews;
    spotDetails.avgStarRating = avgStarRating;

    return res.status(200).json(spotDetails);
  } catch (error) {
    console.error("Error in GET /api/spots/:spotId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//POST /api/spots
router.post(
  "/",
  requireAuth,
  validateSpotFields,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      } = req.body;

      const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });

      return res.status(201).json({
        id: newSpot.id,
        ownerId: newSpot.ownerId,
        address: newSpot.address,
        city: newSpot.city,
        state: newSpot.state,
        country: newSpot.country,
        lat: parseFloat(newSpot.lat),
        lng: parseFloat(newSpot.lng),
        name: newSpot.name,
        description: newSpot.description,
        price: parseFloat(newSpot.price),
        createdAt: newSpot.createdAt,
        updatedAt: newSpot.updatedAt,
      });
    } catch (error) {
      console.error("Error in POST /api/spots:", error);

      const errors = validationResult(req);
      console.log(errors);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

//POST /api/spots/:spotId/images
router.post("/:spotId/images", requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          url: "URL is required",
        },
      });
    }

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newImage = await SpotImage.create({
      spotId: spot.id,
      url,
      preview: preview === true,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    });
  } catch (error) {
    console.error("Error in POST /api/spots/:spotId/images:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//POST /api/spots/:spotId/reviews
router.post(
  "/:spotId/reviews",
  requireAuth,
  validateReviews,
  handleValidationErrors,
  async (req, res) => {
    let { spotId } = req.params;

    const userId = req.user.id;

    const existingReview = await Review.findOne({
      where: {
        [Op.and]: [{ userId }, { spotId }],
      },
    });

    console.log(existingReview);
    if (existingReview) {
      return res.status(500).json({
        message: "User already has a review for this spot",
      });
    }

    const foundSpot = await Spot.findByPk(spotId);
    if (!foundSpot)
      return res.status(404).json({ message: "Spot couldn't be found" });
    const { review, stars } = req.body;

    await Review.create({
      userId,
      spotId: Number(spotId),
      review,
      stars,
    });

    let found = await Review.findAll({
      where: {
        userId,
      },
      attributes: [
        "id",
        "userId",
        "spotId",
        "review",
        "stars",
        "createdAt",
        "updatedAt",
      ],
    });

    found = found[found.length - 1];

    res.status(201).json({ ...found.dataValues });
  }
);

//PUT /api/spots/:spotId
router.put(
  "/:spotId",
  requireAuth,
  validateSpotFields,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { spotId } = req.params;
      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      } = req.body;

      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // Check ownership
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update fields
      spot.address = address;
      spot.city = city;
      spot.state = state;
      spot.country = country;
      spot.lat = lat;
      spot.lng = lng;
      spot.name = name;
      spot.description = description;
      spot.price = price;

      await spot.save();

      return res.status(200).json({
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: parseFloat(spot.lat),
        lng: parseFloat(spot.lng),
        name: spot.name,
        description: spot.description,
        price: parseFloat(spot.price),
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
      });
    } catch (error) {
      console.error("Error in PUT /api/spots/:spotId:", error);
      if (error.name === "SequelizeValidationError") {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path] = err.message;
        });
        return res.status(400).json({
          message: "Bad Request",
          errors,
        });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//DELETE /api/spots/:spotId
router.delete("/:spotId", requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await spot.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/spots/:spotId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;