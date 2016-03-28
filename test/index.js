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
  describe('#calculateMarkupForPrice', ()=>{
    it('should accept price as a number', ()=>{
      expect(JobPricer.calculateMarkupForPrice(0.10, 100)).to.equal(10);
      expect(JobPricer.calculateMarkupForPrice(0.10, 100.0)).to.equal(10);
    });
    it('should accept price as a options.flatMarkup', ()=>{
      expect(JobPricer.calculateMarkupForPrice(0.10, {flatMarkup:100})).to.equal(10);
    });
    it('should accept price as a options.price', ()=>{
      expect(JobPricer.calculateMarkupForPrice(0.10, {price:100})).to.equal(10);
    });
    it('should prefer options.flatMarkup over options.price', ()=>{
      expect(JobPricer.calculateMarkupForPrice(0.10, {
        flatMarkup:100,
        price:200
      })).to.equal(10);
    });
  });
  describe('FLAT MARKUP of 5%', ()=>{
    it('#getFlatMarkup should apply a flat markup to all jobs of 5%', ()=> {
      const price = 100;
      let result = JobPricer.getFlatMarkup(price);
      expect(result).to.equal(100 * 0.05);
    });
    it('#calculate should flat markup of 5% to final calculation', ()=> {
      const price = 100;
      let result = JobPricer.calculate({price});
      expect(result).to.equal(100 * 1.05);
    });
  });
  describe('Per-person markup of 1.2%', ()=>{
    it('#getPeopleMarkup should apply a markup of 1.2% for each person that needs to work on the job', ()=> {
      const price = 100;
      const markupPerPerson = 0.012;
      const job1 = {
        price,
        people: 1
      };
      const job2 = {
        price,
        people: 2
      };
      const job10 = {
        price,
        people: 10
      };
      const expected1 = markupPerPerson * price;
      const expected2 = (markupPerPerson * job2.people) * price;
      const expected10 = (markupPerPerson * job10.people) * price;
      let actual1 = JobPricer.getPeopleMarkup(job1);
      let actual2 = JobPricer.getPeopleMarkup(job2);
      let actual10 = JobPricer.getPeopleMarkup(job10);
      expect(actual1).to.equal(expected1);
      expect(actual2).to.equal(expected2);
      expect(actual10).to.equal(expected10);
    });
    it('#calculate should add the 1.2% per person markup to the flatMarkup', ()=>{
      const price = 100;
      const flatPrice = JobPricer.getFlatMarkup(price) + price;
      const markupPerPerson = 0.012;
      const job1 = {
        price,
        people: 1
      };
      const job2 = {
        price,
        people: 2
      };
      const job10 = {
        price,
        people: 10
      };
      let actual1 = JobPricer.calculate(job1);
      let expected1 = (flatPrice * markupPerPerson) + flatPrice;
      expect(actual1).to.equal(expected1);
      let actual2 = JobPricer.calculate(job2);
      let expected2 = (flatPrice * (job2.people * markupPerPerson)) + flatPrice;
      expect(actual2).to.equal(expected2);
      let actual10 = JobPricer.calculate(job10);
      let expected10 = (flatPrice * (job10.people * markupPerPerson)) + flatPrice;
      expect(actual10).to.equal(expected10);
    });
  });
  describe('Material markups', ()=>{
    describe('Pharma markup of 7.5%', ()=>{
      // describe('#')
    });
  });
});
