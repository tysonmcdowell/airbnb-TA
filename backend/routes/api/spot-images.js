const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage } = require('../../db/models');
const router = express.Router();

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;

    // Find the spot image by ID
    const spotImage = await SpotImage.findByPk(imageId);

    if (!spotImage) {
        return res.status(404).json({
            message: "Spot Image couldn't be found"
        });
    }

    // Proceed to delete the spot image
    await spotImage.destroy();

    res.json({ message: "Successfully deleted" });
});

module.exports = router;
