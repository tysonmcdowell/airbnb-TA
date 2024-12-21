'use strict';

const { ReviewImage } = require('../models'); // Adjust the path as needed

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const reviewImages = [
      {
        reviewId: 1,
        url: 'https://example.com/review-image-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 1,
        url: 'https://example.com/review-image-2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 2,
        url: 'https://example.com/review-image-3.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Use ReviewImage model's bulkCreate method for inserting data
    await ReviewImage.bulkCreate(reviewImages, { validate: true }); // Ensures input data meets model validations
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        url: {
          [Op.in]: [
            'https://example.com/review-image-1.jpg',
            'https://example.com/review-image-2.jpg',
            'https://example.com/review-image-3.jpg',
          ],
        },
      },
      {}
    );
  },
};
