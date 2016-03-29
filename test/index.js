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
    expect(JobPricer).to.have.property('markupForDrugs').that.equals(0.075);
    expect(JobPricer).to.have.property('markupForFood').that.equals(0.13);
    expect(JobPricer).to.have.property('markupForElectronics').that.equals(0.02);
  });
  it('should expose a map of categories to their markup as a getter',()=>{
    expect(JobPricer).to.have.property('categoryMarkupMap').that.eqls({
      'electronics' : JobPricer.markupForElectronics,
      'food'        : JobPricer.markupForFood,
      'drugs'      : JobPricer.markupForDrugs
    })
  });
  describe("#round", ()=>{
    it("should round a float to at most 2 decimal places", ()=>{
      expect(JobPricer.round(1.33333)).to.equal(1.33);
      expect(JobPricer.round(1.3)).to.equal(1.3);
      expect(JobPricer.round(1)).to.equal(1);
    });
    it("should round up if the 3rd decimal => 5", ()=>{
      expect(JobPricer.round(1.33333)).to.equal(1.33);
      expect(JobPricer.round(1.33353)).to.equal(1.33);
      expect(JobPricer.round(1.33533)).to.equal(1.34);
    });
    it("should validate that the passed number is a number", ()=>{
      expect( ()=> JobPricer.round("1") ).to.throw(TypeError);
    });
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
    it('should validate that the passed markup is a number', ()=>{
      expect( ()=> JobPricer.calculateMarkupForPrice("one", 10) ).to.throw(TypeError);
      expect( ()=> JobPricer.calculateMarkupForPrice(1, 10) ).not.to.throw(TypeError);
    });
    it('should validate that the passed price is a number', ()=>{
      expect( ()=> JobPricer.calculateMarkupForPrice(1, { price:"ten" }) ).to.throw(TypeError);
      expect( ()=> JobPricer.calculateMarkupForPrice(1, { price:10 }) ).not.to.throw(TypeError);
    });
  });
  describe('FLAT MARKUP of 5%', ()=>{
    describe('#getFlatMarkup', ()=>{
      it('should apply a flat markup to all jobs of 5%', ()=> {
        const price = 100;
        let result = JobPricer.getFlatMarkup(price);
        expect(result).to.equal(100 * 0.05);
      });
      it('should validate that the passed basePrice is a number', ()=> {
        expect( ()=> JobPricer.getFlatMarkup("1") ).to.throw(TypeError);
        expect( ()=> JobPricer.getFlatMarkup(1) ).not.to.throw(TypeError);
      });
    });
    it('#calculate should flat markup of 5% to final calculation', ()=> {
      const price = 100;
      let result = JobPricer.calculate({price});
      expect(result).to.equal(100 * 1.05);
    });
  });
  describe('Per-person markup of 1.2%', ()=>{
    describe('#getPeopleMarkup', ()=>{
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
      it('should validate that options.people is a number', ()=>{
        const price = 1;
        const yep = {
          price,
          people: 10
        }
        const nope = {
          price,
          people: "10"
        }
        expect( ()=> JobPricer.getPeopleMarkup(nope) ).to.throw(TypeError);
        expect( ()=> JobPricer.getPeopleMarkup(yep) ).not.to.throw(TypeError);
      });
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
          categories: ['electronics', 'food', 'drugs']
        }
        const actual = JobPricer.getMarkupForCategories(options);
        const expected = [
          options.price * JobPricer.markupForElectronics,
          options.price * JobPricer.markupForFood,
          options.price * JobPricer.markupForDrugs
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
      it('should apply a Drugs markup of 7.5%', ()=>{
        const price = 100;
        const expected = price * 0.075;
        expect(JobPricer.getMarkupForCategories({
          price,
          categories: ['drugs']
        })).to.eql([expected])
      });
      it('should return the markups in the same order the categories are given', ()=>{
        const price = 100;
        const electronicsMarkup = price * JobPricer.markupForElectronics;
        const foodMarkup = price * JobPricer.markupForFood;
        const drugsMarkup = price * JobPricer.markupForDrugs;
        expect(JobPricer.getMarkupForCategories({price, categories:['food', 'drugs', 'electronics']})).to.eql([foodMarkup, drugsMarkup, electronicsMarkup]);
        expect(JobPricer.getMarkupForCategories({price, categories:['drugs', 'electronics', 'food']})).to.eql([drugsMarkup, electronicsMarkup, foodMarkup]);
      });
      it('should not apply the same markup multiple times even if the category appears in options.categories many times', ()=>{
        const price = 100;
        const actual = JobPricer.getMarkupForCategories({price, categories:['food', 'food', 'food']});
        expect(actual.length).to.equal(1);
        const actual2 = JobPricer.getMarkupForCategories({price, categories:['food', 'food', 'drugs', 'electronics', 'food', 'drugs']});
        expect(actual2.length).to.equal(3);
      });
      it("should not apply a markup for a category that isn't defined", ()=>{
        const price = 100;
        const actual = JobPricer.getMarkupForCategories({price, categories:['not a category', 'food']});
        expect(actual.length).to.eql(1);
      });
      it("should return 0 for category whose markup == 0", ()=>{
        const price = 0.0;
        const actual = JobPricer.getMarkupForCategories({price, categories:['food']});
        expect(actual.length).to.eql(1);
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
    it('Should apply multiple category markups to the fixedMarkup price', ()=>{
      const price = 100;
      const flatPrice = JobPricer.getFlatMarkup(price) + price;
      const markupForFood = 0.13;
      const markupForDrugs = 0.075;
      const job1 = {
        price,
        categories: ['food', 'drugs']
      };
      const expected = JobPricer.round((flatPrice * markupForFood) + (flatPrice * markupForDrugs) + flatPrice);
      const actual = JobPricer.calculate(job1);
      expect(actual).to.equal(expected);
    });
  });
  describe("Fitness tests", ()=>{
    describe("Input 1", ()=>{
      const input1 = {
        price: 1299.99,
        people: 3,
        categories: ['food']
      }
      const expected1 = 1531.58;
      it(`should produce the output $${expected1}`, ()=>{
        const actual = JobPricer.calculate(input1);
        expect(actual).to.equal(expected1)
      });
    });
    describe("Input 2", ()=>{
      const input2 = {
        price: 5432.00,
        people: 1,
        categories: ['drugs']
      }
      const expected2 = 6199.81;
      it(`should produce the output $${expected2}`, ()=>{
        const actual = JobPricer.calculate(input2);
        expect(actual).to.equal(expected2);
      });
    });
    describe("Input 3", ()=>{
      const input3 = {
        price: 12456.95,
        people: 4,
        categories: ['books']
      }
      const expected3 = 13707.63;
      it(`should produce the output $${expected3}`, ()=>{
        const actual = JobPricer.calculate(input3);
        expect(actual).to.equal(expected3);
      });
    });
  });
});
