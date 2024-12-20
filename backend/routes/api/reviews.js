// routes/reviews.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { User, Spot, Review, ReviewImage } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();



// Get all Reviews of the Current User
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    const reviews = await Review.findAll({
        where: { userId: user.id },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Spot,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                include: {
                    model: SpotImage,
                    where: { preview: true },
                    attributes: ['url'],
                    required: false
                }
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            }
        ]
    });

    // Add previewImage to Spots
    for (const review of reviews) {
        if (review.Spot && review.Spot.SpotImages.length > 0) {
            review.Spot.dataValues.previewImage = review.Spot.SpotImages[0].url;
        }
        delete review.Spot.dataValues.SpotImages;
    }

    res.json({ Reviews: reviews });
});





// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { url } = req.body;

    const review = await Review.findByPk(reviewId, {
        include: [{ model: ReviewImage }]
    });

    if (!review) {
        return res.status(404).json({
            message: "Review couldn't be found"
        });
    }

    if (review.ReviewImages.length >= 10) {
        return res.status(403).json({
            message: "Maximum number of images for this resource was reached"
        });
    }

    const newImage = await ReviewImage.create({
        reviewId,
        url
    });

    res.status(201).json({ id: newImage.id, url: newImage.url });
});

// Edit a Review
router.put('/:reviewId', requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const { reviewId } = req.params;

    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {
        return res.status(404).json({
            message: "Review couldn't be found"
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

    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    res.json(existingReview);
});

// Delete a Review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
        return res.status(404).json({
            message: "Review couldn't be found"
        });
    }

    await review.destroy();

    res.json({ message: "Successfully deleted" });
});

module.exports = router;
