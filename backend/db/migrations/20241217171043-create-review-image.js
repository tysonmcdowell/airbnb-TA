'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Set schema for production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure the schema is created (useful for Render deployment)
    if (process.env.NODE_ENV === 'production' && options.schema) {
      await queryInterface.createSchema(options.schema);
    }

    await queryInterface.createTable(
      'ReviewImages',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        reviewId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { 
            model: {
              tableName: 'Reviews',
              schema: options.schema, // Explicitly reference the schema
            },
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    await queryInterface.dropTable(options);
  },
};
