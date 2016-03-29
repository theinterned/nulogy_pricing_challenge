"use strict";

/**
 * JobPricer is a class that calculates the markup charged for Jobs at NuPack.
 * The class can be used entirely staticly, without constructing an instance as all methods are static.
 */
class JobPricer {
  //////////////////////////////
  /// Getters
  //////////////////////////////
  /**
   * @return {Number} [description]
   */
  static get markup() {
    return 0.05;
  }
  /**
   * @return {Number} [description]
   */
  static get markupPerPerson() {
    return 0.012;
  }
  /**
   * @return {Number} [description]
   */
  static get markupForElectronics() {
    return 0.02;
  }
  /**
   * @return {Number} [description]
   */
  static get markupForFood() {
    return 0.13;
  }
  /**
   * @return {Number} [description]
   */
  static get markupForDrugs() {
    return 0.075;
  }
  /**
   * This is a hash to match category names to their markup amount
   * @return {Object}
   */
  static get categoryMarkupMap() {
    return {
      electronics : this.markupForElectronics,
      food        : this.markupForFood,
      drugs       : this.markupForDrugs
    }
  }

  //////////////////////////////
  /// Calculation methods
  //////////////////////////////
  /**
   * The main calculate routine - this is the entry point for the JobPricer Library
   * @param {[Object]}  options             All args are passed as an object of named args
   * @param {Number}    options.price       This is the base Job Price that the markup will be calcualted on top of.
   * @param {[Number]}  options.people      The number of people working on the job. Used to calculate markup.
   * @param {[Array]}   options.categories  An array of one of some or all of ["electronics", "food", "drugs"] to lable the job as. Each category has a differnt markup associated with it.
   * @return {Number}   The price claculated with the full markup applied. Rounded to 2 decimal places.
   */
  static calculate(options) {
    const defaults = {
      price: 0,
      people: 0
    }
    // this object will be passed along to all the other calculations
    let calculation = Object.assign({}, defaults, options);
    const price = calculation.price;
    const flatMarkup = this.getFlatMarkup(price) + price;
    // store the flatMarkup in the calculation as it is what the person and category calculations are based on
    calculation.flatMarkup = flatMarkup;
    // calculate any per person markup
    const peopleMarkup = this.getPeopleMarkup(calculation);
    // calculate category markup
    const categoryMarkupList = this.getMarkupForCategories(calculation);
    // and boil it down
    const categoryMarkup = categoryMarkupList.reduce((prev, curr) => prev + curr, 0);
    // the final calculation
    const markup = this.round(flatMarkup + peopleMarkup + categoryMarkup);
    return markup;
  }
  /**
   * Helper that picks out the price which cna be pased ether as a number or as the base `options.price` or the calculated `options.flatMarkup`
   * @param   {Number}    markup              The percentage amount (expressed as a decimal float) to mark the price up by.
   * @param   {[Number]}  options             Price can be passed stright to the funciton as a number
   * @param   {[Number]}  options.flatMarkup  ... or it can be passed as flatMarkup on the options object
   * @param   {[Number]}  options.price       ... or it can be passed as price on the options object
   * @return  {Number}
   */
  static calculateMarkupForPrice(markup, options) {
    let price = 0;
    switch (typeof options) {
      case 'object':
        price = options.flatMarkup || options.price; // if a flat markup isn't privided - fallback to use the price
        break;
      case 'number':
        price = options;
        break;
    }
    if (!(typeof markup === 'number')) {
      throw new TypeError(`Markup must be a number, got ${markup} which is typeof ${typeof markup} instead`);
    }
    if (!(typeof price === 'number')) {
      throw new TypeError(`Markup must be a number, got ${price} which is typeof ${typeof price} instead`);
    }
    return markup * price;
  }
  /**
   * Returns the flat markup on the pased price
   * @param  {Number} basePrice
   * @return {Number}
   */
  static getFlatMarkup(basePrice) {
    if (!(typeof basePrice === 'number')) {
      throw new TypeError(`Markup must be a number, got ${basePrice} which is typeof ${typeof basePrice} instead`);
    }
    let markup = basePrice * this.markup;
    return markup;
  }
  /**
   * The markup for people is calculated as (this.markupPerPerson * options.people)
   * @param  {options.people} options  The number of people required to do the job
   * @return {Number}
   */
  static getPeopleMarkup(options){
    const people = options.people;
    if (!(typeof people === 'number')) {
      throw new TypeError(`Markup must be a number, got ${people} which is typeof ${typeof people} instead`);
    }
    const markup = this.calculateMarkupForPrice(options.people * this.markupPerPerson, options);
    return markup;
  }
  /**
   * Given a list of categories, returns an array of those categories' markup value
   * @param  {[Array]}  options.categories An array that contain one or more categories listed in this.categoryMarkupMap.
   * @return {[Array]}  The markup values for the passed categories
   */
  static getMarkupForCategories(options) {
    if (typeof options === 'undefined' || typeof options.categories === 'undefined') {
      return [];
    }
    const categories = options.categories;
    let handledCats = {}; // this is used to avoid returning duplicate markups if a category appears more then once
    const markups = categories.map((cat)=>{
      if(typeof handledCats[cat] === "undefined") {
        handledCats[cat] = true;
        let markup = this.categoryMarkupMap[cat];
        if(typeof markup !== 'number') { return false; }
        markup = this.calculateMarkupForPrice(markup, options);
        return markup;
      }
      return false;
    }).filter((cat) => (cat === 0 || cat));
    return markups;
  }

  //////////////////////////////
  /// Helpers
  //////////////////////////////
  /**
   * Rounds a number to 2 decimal places
   * @param  {Number} number The number to round
   * @return {Number} The number rounded to at most 2 decimal places
   */
  static round(number) {
    if (!(typeof number === 'number')) {
      throw new TypeError(`Markup must be a number, got ${number} which is typeof ${typeof number} instead`);
    }
    return Math.round(number * 100) / 100;
  }
}

module.exports = JobPricer;
