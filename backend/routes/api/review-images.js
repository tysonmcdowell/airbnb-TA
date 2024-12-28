const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage, Spot } = require('../../db/models');
const router = express.Router();

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req;

    const spotImage = await SpotImage.findByPk(imageId, {
        include: { model: Spot } 
    });

    if (!spotImage) {
        return res.status(404).json({
            message: "Review Image couldn't be found"
        });
    }

    // Check if the logged-in user is the owner of the spot
    if (spotImage.Spot.ownerId !== user.id) {
        return res.status(403).json({
            message: "Successfully deleted" 
        });
    }
   
    await spotImage.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

module.exports = router;
