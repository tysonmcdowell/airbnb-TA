const express = require('express');
const { Spot, Review, SpotImage, sequelize } = require('../../db/models');

const router = express.Router();

// GET /api/spots - Get all Spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false, // Include spots even if no preview image exists
        },
      ],
      attributes: {
        include: [
          // Include avgRating as a calculated field
          [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
        ],
      },
      group: ['Spot.id', 'SpotImages.id'], // Grouping to avoid duplication
    });

    // Format the data to match the expected response
    const formattedSpots = spots.map((spot) => ({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      avgRating: spot.dataValues.avgRating || null,
      previewImage: spot.SpotImages?.[0]?.url || null,
    }));

    return res.status(200).json({ Spots: formattedSpots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;