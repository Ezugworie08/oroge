const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

const app = require('../../src/app');

describe('Log Files Endpoint', () => {
    it('should return a list of log files', (done) => {
        request(app)
            .get('/logFiles')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('logFiles');
                done();
            });
    });
});

