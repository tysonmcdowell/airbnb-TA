const express = require('express');
const { SpotImage, Spot } = require('../../db/models');
const router = express.Router();

// Authentication middleware
const requireAuth = function (req, res, next) {

  if (!req.user) {

    return res.status(401).json({ message: 'Authentication required' });
  }
 
  return next();
};

// DELETE /api/spot-images/:imageId
router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params; 
  const userId = req.user.id; 

  try {
   

    // Step 1: Check if SpotImage exists
    const spotImage = await SpotImage.findByPk(imageId);
    if (!spotImage) {
      return res.status(404).json({
        message: "Spot Image couldn't be found",
      });
    }


    // Step 2: Find the associated Spot for the SpotImage
    const spot = await Spot.findByPk(spotImage.spotId);
    if (!spot) {
      // console.log('::::::::::::: 404 spot NOT FOUND');
      return res.status(404).json({
        message: "Spot associated with this image doesn't exist",
      });
    }

 

    // Step 3: Ensure ownership comparison is correct
  
    const spotOwnerId = Number(spot.ownerId); 
    const authenticatedUserId = Number(userId); 

 

    // Step 4: Check if the authenticated user is the owner of the Spot
    if (spotOwnerId !== authenticatedUserId) {
      return res.status(403).json({
        message: 'You do not have permission to delete this image',
      });
    }


    // Step 5: Delete the SpotImage
    await spotImage.destroy();

    // Step 6: Return success response after deletion
    return res.status(200).json({
      message: 'Successfully deleted',
    });

  } catch (error) {
    // Catch any unexpected errors and send a generic 500 error response
    console.error("Error in deleting spot image:", error);
    return res.status(500).json({
      message: 'Internal Server Error',
      errors: error.message || error,
    });
  }
});


module.exports = router;