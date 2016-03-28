"use strict";
process.env.NODE_ENV = 'test';

var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect;

var JobPricer = require('../src/js/')

describe('JobPricer', ()=> {
  it('should be an Class', ()=> {
    expect(JobPricer).to.be.a('function');
    expect(JobPricer).to.respondTo('constructor');
  });
  it('should apply a flat markup to all jobs of 5%', ()=> {
    const price = 100;
    let result = JobPricer.flatMarkup(price);
    expect(result).to.equal(100 * 1.05);
    result = JobPricer.calculate({price});
    expect(result).to.equal(100 * 1.05);
  });
});
