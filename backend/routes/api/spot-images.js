const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage, Spot } = require('../../db/models'); // Ensure Spot is included
const router = express.Router();

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req; // Current authenticated user

    // Find the spot image by ID and include associated Spot
    const spotImage = await SpotImage.findByPk(imageId, {
        include: { model: Spot } // Ensure Spot contains ownerId for validation
    });

    // If the spot image doesn't exist
    if (!spotImage) {
        return res.status(404).json({
            message: "Spot Image couldn't be found"
        });
    }

    // Check if the logged-in user is the owner of the spot
    if (spotImage.Spot.ownerId !== user.id) {
        return res.status(403).json({
            message: "Forbidden" // Match the expected response
        });
    }

    // Delete the Spot Image
    await spotImage.destroy();

    // Return success message
    res.json({ message: "Successfully deleted" });
});

module.exports = router;
