"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const reviews = [
      {
        spotId: 1,
        userId: 1,
        review: "Amazing spot! Would visit again.",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 2,
        userId: 2,
        review: "The place was decent, but could be cleaner.",
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 3,
        userId: 3,
        review: "Terrible experience. Avoid at all costs!",
        stars: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    options.tableName = "Reviews";
    await queryInterface.bulkInsert(options, reviews);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    await queryInterface.bulkDelete(options, null, {});
  },
};
