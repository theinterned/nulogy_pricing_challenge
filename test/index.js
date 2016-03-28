process.env.NODE_ENV = 'test';

var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect;

var App = require('../src/js/')

describe('App', function(){
  it('should be an object', function(){
    expect(App).to.be.a('Object');
  });
  it('should have this shape', function(){
    expect(App).to.eql({
      foo: 'bar'
    })
  });
});
