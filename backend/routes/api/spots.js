const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Spot, Review, SpotImage, User } = require("../../db/models");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// --------------------
// Validation Middleware
// --------------------

// Validation rules exactly as per the docs
const validateSpotFields = [
  check("address")
    .notEmpty().withMessage("Street address is required"),
  check("city")
    .notEmpty().withMessage("City is required"),
  check("state")
    .notEmpty().withMessage("State is required"),
  check("country")
    .notEmpty().withMessage("Country is required"),
  check("lat")
    .notEmpty().withMessage("Latitude must be within -90 and 90")
    .bail()
    .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .notEmpty().withMessage("Longitude must be within -180 and 180")
    .bail()
    .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be within -180 and 180"),
  check("name")
    .notEmpty().withMessage("Name is required")
    .bail()
    .isLength({ max: 50 }).withMessage("Name must be less than 50 characters"),
  check("description")
    .notEmpty().withMessage("Description is required"),
  check("price")
    .notEmpty().withMessage("Price per day must be a positive number")
    .bail()
    .isFloat({ min: 0 }).withMessage("Price per day must be a positive number"),
];

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach((error) => {
      if (!errors[error.param]) {
        errors[error.param] = error.msg;
      }
    });
    console.log("Validation errors:", {
      message: "Bad Request",
      errors,
    }); // Logging the error response
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }
  next();
}


// Function to add avgRating and previewImage to a spot object
async function addExtraSpotInfo(spot) {
  const spotData = spot.toJSON();

  // Calculate avgRating based on reviews
  const reviews = await Review.findAll({
    where: { spotId: spot.id },
    attributes: ["stars"],
  });

  let avgRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
    avgRating = sum / reviews.length;
    avgRating = parseFloat(avgRating.toFixed(1)); // Round to one decimal place
  }
  spotData.avgRating = avgRating > 0 ? avgRating : 0;

  // Get previewImage
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

// 1. GET /api/spots - Get all Spots
router.get("/", async (req, res) => {
  try {
    const allSpots = await Spot.findAll();

    // Add avgRating and previewImage to each spot
    const spotsWithInfo = await Promise.all(allSpots.map(async (spot) => {
      return await addExtraSpotInfo(spot);
    }));

    return res.status(200).json({ Spots: spotsWithInfo });
  } catch (error) {
    console.error("Error in GET /api/spots:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// 2. GET /api/spots/current - Get all Spots owned by Current User
router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const spotsOwnedByUser = await Spot.findAll({
      where: { ownerId: currentUserId },
    });

    // Add avgRating and previewImage to each spot
    const spotsWithInfo = await Promise.all(spotsOwnedByUser.map(async (spot) => {
      return await addExtraSpotInfo(spot);
    }));

    return res.status(200).json({ Spots: spotsWithInfo });
  } catch (error) {
    console.error("Error in GET /api/spots/current:", error);
    return res.status(404).json({ message: "Internal Server Error" });
  }
});

// 3. GET /api/spots/:spotId - Get details of a Spot from an id
// GET /api/spots/:spotId - Get details of a Spot by its ID
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


 
// POST /api/spots - Create a Spot
router.post("/", requireAuth, validateSpotFields, handleValidationErrors, async (req, res) => {
  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Create a new spot
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

    // Format the response
    const spotResponse = {
      id: newSpot.id,
      ownerId: newSpot.ownerId,
      address: newSpot.address,
      city: newSpot.city,
      state: newSpot.state,
      country: newSpot.country,
      lat: newSpot.lat,
      lng: newSpot.lng,
      name: newSpot.name,
      description: newSpot.description,
      price: newSpot.price,
      createdAt: newSpot.createdAt,
      updatedAt: newSpot.updatedAt,
    };

    return res.status(201).json(spotResponse);
  } catch (error) {
    console.error("Error in POST /api/spots:", error);

    // Return a validation error if the issue comes from Sequelize
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((e) => {
        errors[e.path] = e.message;
      });
      return res.status(400).json({ message: "Validation error" });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// 5. POST /api/spots/:spotId/images - Add an Image to a Spot
router.post("/:spotId/images", requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
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

// 6. PUT /api/spots/:spotId - Edit a Spot
router.put("/:spotId", requireAuth, validateSpotFields, handleValidationErrors, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await spot.update({
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

    return res.status(200).json(spot);
  } catch (error) {
    console.error("Error in PUT /api/spots/:spotId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// 7. DELETE /api/spots/:spotId - Delete a Spot
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

// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const { spotId } = req.params;
    const { user } = req;

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found"
        });
    }

    const existingReview = await Review.findOne({
        where: { spotId, userId: user.id }
    });

    if (existingReview) {
        return res.status(500).json({
            message: "User already has a review for this spot"
        });
    }

    if (!review || !stars || stars < 1 || stars > 5) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                review: "Review text is required",
                stars: "Stars must be an integer from 1 to 5"
            }
        });
    }

    const newReview = await Review.create({
        userId: user.id,
        spotId,
        review,
        stars
    });

    res.status(201).json(newReview);
});
// Get all Reviews by a Spot's id
router.get('/spots/:spotId/reviews', async (req, res, next) => {
    const { spotId } = req.params;

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found"
        });
    }

    const reviews = await Review.findAll({
        where: { spotId },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            }
        ]
    });

    res.json({ Reviews: reviews });
});

module.exports = router;
