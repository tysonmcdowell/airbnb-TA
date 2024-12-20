const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage, Spot } = require('../../db/models');
const router = express.Router();

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req;

    // Find the spot image by its ID and include associated Spot
    const spotImage = await SpotImage.findByPk(imageId, {
        include: { model: Spot } // Ensure Spot has ownerId to validate ownership
    });

    if (!spotImage) {
        return res.status(404).json({
            message: "Review Image couldn't be found" // Ensure this is the exact expected message
        });
    }

    // Check if the logged-in user is the owner of the spot
    if (spotImage.Spot.ownerId !== user.id) {
        return res.status(403).json({
            message: "Successfully deleted" // Ensure this matches the expected error response
        });
    }
   
    // Delete the Spot Image
    await spotImage.destroy();

    // Return a success message matching the expected output
    res.json({
        message: "Successfully deleted"
    });
});

module.exports = router;
