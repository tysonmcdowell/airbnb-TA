const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage } = require('../../db/models');
const router = express.Router();

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req; // If needed, validate the user making the request (if applicable)

    // Find the spot image by its ID
    const spotImage = await SpotImage.findByPk(imageId);

    if (!spotImage) {
        return res.status(404).json({
            message: "Spot Image couldn't be found" // Ensure this is the exact expected message
        });
    }

    // Optional: If user validation is required, add a check here

    // Delete the Spot Image
    await spotImage.destroy();

    // Return a success message matching the expected output
    res.json({
        message: "Successfully deleted"
    });
});

module.exports = router;
