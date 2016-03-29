"use strict";

class JobPricer {
  /**
   * The main calculate routine - this is the entry point for the JobPricer Library
   * @param  {[Object]} options         All args are passed as an object of named args
   * @return {[Float]}  options.price   This is the base Job Price that the markup will be calcualted on top of.
   */
  static calculate(options) {
    const defaults = {
      price: 0,
      people: 0
    }
    let calculation = Object.assign({}, defaults, options);
    const price = calculation.price;
    const flatMarkup = this.getFlatMarkup(price) + price;
    calculation.flatMarkup = flatMarkup;
    // calculate any per person markup
    const peopleMarkup = this.getPeopleMarkup(calculation);
    // calculate category markups
    const categoryMarkupList = this.getMarkupForCategories(calculation);
    const categoryMarkup = categoryMarkupList.reduce((prev, curr) => prev + curr, 0);
    // the final calculation
    const markup = flatMarkup + peopleMarkup + categoryMarkup;
    return markup;
  }
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
    return markup * price;
  }
  static get markup() {
    return 0.05;
  }
  static getFlatMarkup(basePrice) {
    let markup = basePrice * this.markup;
    return markup;
  }
  static get markupPerPerson() {
    return 0.012;
  }
  static getPeopleMarkup(options){
    const markup = this.calculateMarkupForPrice(options.people * this.markupPerPerson, options);
    return markup;
  }
  static get markupForElectronics() {
    return 0.02;
  }
  static get markupForFood() {
    return 0.13;
  }
  static get markupForPharma() {
    return 0.075;
  }
  static get categoryMarkupMap() {
    return {
      electronics : this.markupForElectronics,
      food        : this.markupForFood,
      pharma      : this.markupForPharma
    }
  }
  static getMarkupForCategories(options) {
    if (typeof options === 'undefined' || typeof options.categories === 'undefined') {
      return [];
    }
    const categories = options.categories;
    let handledCats = {};
    const markups = categories.map((cat)=>{
      if(typeof handledCats[cat] === "undefined") {
        handledCats[cat] = true;
        let markup = this.categoryMarkupMap[cat];
        markup = this.calculateMarkupForPrice(markup, options);
        return markup;
      } else {
        return false;
      }
    }).filter((cat) => (cat === 0 || cat));
    return markups;
  }
}

module.exports = JobPricer;
