'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'ReviewImages',
      [
        {
          reviewId: 1,
          url: 'https//:doesnotwork.com'
        },
        {
          reviewId: 2,
          url: 'https//:doesmaybework.com'
        },
        {
          reviewId: 1,
          url: 'https//:doeswork.com'
        },
      ],
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        reviewId: { [Op.in]: [1, 2, 3] },
      },
      {}
    );
  },
};
