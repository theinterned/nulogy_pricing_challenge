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
  it('should expose the markup for each category on a getter', ()=>{
    expect(JobPricer).to.have.property('markup').that.equals(0.05);
    expect(JobPricer).to.have.property('markupPerPerson').that.equals(0.012);
    expect(JobPricer).to.have.property('markupForPharma').that.equals(0.075);
    expect(JobPricer).to.have.property('markupForFood').that.equals(0.13);
    expect(JobPricer).to.have.property('markupForElectronics').that.equals(0.02);
  });
  it('should expose a map of categories to their markup as a getter',()=>{
    expect(JobPricer).to.have.property('categoryMarkupMap').that.eqls({
      'electronics' : JobPricer.markupForElectronics,
      'food'        : JobPricer.markupForFood,
      'pharma'      : JobPricer.markupForPharma
    })
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
  describe('Material category markups', ()=>{
    describe('#getMarkupForCategories', ()=>{
      it('should return an empty array if no categories are passed', ()=>{
        expect(JobPricer.getMarkupForCategories()).to.eql([]);
        expect(JobPricer.getMarkupForCategories({})).to.eql([]);
        expect(JobPricer.getMarkupForCategories({price:100})).to.eql([]);
      });
      it('should map the array of categories to an array of calculated markups to apply', ()=>{
        const options = {
          price: 100,
          categories: ['electronics', 'food', 'pharma']
        }
        const actual = JobPricer.getMarkupForCategories(options);
        const expected = [
          options.price * JobPricer.markupForElectronics,
          options.price * JobPricer.markupForFood,
          options.price * JobPricer.markupForPharma
        ];
        expect(actual).to.eql(expected);
      });
      it('should apply a Electronics markup of 2%', ()=>{
        const price = 100;
        const expected = price * 0.02;
        expect(JobPricer.getMarkupForCategories({
          price,
          categories: ['electronics']
        })).to.eql([expected])
      });
      it('should apply a Food markup of 13%', ()=>{
        const price = 100;
        const expected = price * 0.13;
        expect(JobPricer.getMarkupForCategories({
          price,
          categories: ['food']
        })).to.eql([expected])
      });
      it('should apply a Pharma markup of 7.5%', ()=>{
        const price = 100;
        const expected = price * 0.075;
        expect(JobPricer.getMarkupForCategories({
          price,
          categories: ['pharma']
        })).to.eql([expected])
      });
    });
    describe('#calculate should apply the material markups', ()=>{
      it('Should apply a single category markup to the fixedMarkup price', ()=>{
        const price = 100;
        const flatPrice = JobPricer.getFlatMarkup(price) + price;
        const markupForFood = 0.13;
        const job1 = {
          price,
          categories: ['food']
        };
        const expected = (flatPrice * markupForFood) + flatPrice;
        const actual = JobPricer.calculate(job1);
        expect(actual).to.equal(expected);
      })
    });
  });
});
