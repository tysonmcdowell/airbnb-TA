"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const reviewImages = [
      {
        reviewId: 1,
        url: "https://example.com/review-image-1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 1,
        url: "https://example.com/review-image-2.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 2,
        url: "https://example.com/review-image-3.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    options.tableName = "ReviewImages";
    await queryInterface.bulkInsert(options, reviewImages);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    await queryInterface.bulkDelete(options, null, {});
  },
};
