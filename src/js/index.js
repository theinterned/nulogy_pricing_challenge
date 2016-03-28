"use strict";

class JobPricer {
  static get markup() {
    return 1.05;
  }
  static flatMarkup(basePrice) {
    let markup = basePrice * this.markup;
    return markup;
  }
  /**
   * The main calculate routine - this is the entry point for the JobPricer Library
   * @param  {[Object]} options         All args are passed as an object of named args
   * @return {[Float]}  options.price   This is the base Job Price that the markup will be calcualted on top of.
   */
  static calculate(options) {
    const defaults = {
      price: 0
    }
    const args = Object.assign({}, defaults, options);
    let markup = this.flatMarkup(options.price);
    return markup;
  }
}

module.exports = JobPricer;
