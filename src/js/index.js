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
    const flatMarkup = this.flatMarkup(price) + price;
    calculation.flatMarkup = flatMarkup;
    const peopleMarkup = this.perPersonMarkup(calculation);
    const markup = flatMarkup + peopleMarkup;
    return markup;
  }
  static get markup() {
    return 0.05;
  }
  static flatMarkup(basePrice) {
    let markup = basePrice * this.markup;
    return markup;
  }
  static get markupPerPerson() {
    return 0.012;
  }
  static perPersonMarkup(options){
    const price = options.flatMarkup || options.price; // if a flat markup isn't privided - fallback to use the price
    const markup = (options.people * this.markupPerPerson) * price;
    return markup;
  }
}

module.exports = JobPricer;
