
/**
 * @list dependencies
 **/

var mocha = require('mocha');
var should = require('should');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('../');

mongoose = mongoose.createConnection('mongodb://localhost/mongoose_timestamps')
mongoose.on('error', function (err) {
        console.error('MongoDB error: ' + err.message);
        console.error('Make sure a mongoDB server is running and accessible by this application')
});

var TimeCopSchema = new Schema({
    email: String,
    nemesis: String
});
TimeCopSchema.plugin(timestamps, null);
var TimeCop
try {TimeCop = mongoose.model('TimeCop')} catch(e) {TimeCop = mongoose.model('TimeCop', TimeCopSchema)};

describe('use mongo _id for create', function() {
  it('should be set to almost the same value on creation', function(done) {
    var cop = new TimeCop({ email: 'brian@brian.com' });
    cop.save( function (err) {
      Object.keys(cop._doc).length.should.equal(4);  // (_id, email, updated_at, __v)
      cop.updatedAt.should.be.above(cop.createdAt);
      cop.updatedAt.getTime().should.be.below(cop.createdAt.getTime() + 1000);
      done();
    });
  })

  after(function() {
      mongoose.close();
  });
})
