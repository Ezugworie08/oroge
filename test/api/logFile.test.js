const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

const app = require('../../src/app');
const { logDir} = require('../../src/config');

describe('Log File Endpoint', () => {
    it('should return the last N lines of a log file', (done) => {
        const filePath = path.join(`${logDir}`, 'hdfs_2k.txt');
        request(app)
            .get('/logFile')
            .query({ filepath: encodeURIComponent(filePath), limit: 5 })
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('lines');
                expect(res.body.lines).to.be.an('array');
                done();
            });
    });
});
