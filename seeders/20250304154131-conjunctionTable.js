"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const junctions = require("../data/symptomDiseaseJunction.json").map(
      (element) => {
        delete element.id;
        element.createdAt = element.updatedAt = new Date();
        return element;
      }
    );

    await queryInterface.bulkInsert("SymptomDiseaseJunctions", junctions);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("SymptomDiseaseJunctions", null);
  }
};
