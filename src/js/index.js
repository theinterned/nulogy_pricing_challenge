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
    const peopleMarkup = this.getPeopleMarkup(calculation);
    const markup = flatMarkup + peopleMarkup;
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
}

module.exports = JobPricer;
