const request = require('supertest');
import { PERSIST_STORE_KEY } from "../source/constants";
import Persist from "../source/services/persistService";
import { DataKeys, WebcamStatus } from '@oncamera/common';




const app = require('../source/app');
const persist = Persist.Instance;

describe('GET /', function() {
    it('should responds with Hello World', (done) => {
      request(app)
        .get('/')
        .expect(200, "Hello World", done);
    });

    it('should return a webcam default status', (done) => {

      persist.clearAll();

      request(app)
        .get('/api/webcam/status')
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should return a webcam offline status from the saved store', (done) => {

      persist.save(PERSIST_STORE_KEY, WebcamStatus.offline);

      request(app)
        .get('/api/webcam/status')
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should be able to update the saved webcam status to an empty store', (done) => {

      persist.clearAll();

      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    it('should be able to update the same value to saved webcam status to a non-empty store', (done) => {

      persist.save(PERSIST_STORE_KEY, WebcamStatus.offline);
      
      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should be able to update a different value to saved webcam status to a non-empty store', (done) => {

      persist.save(PERSIST_STORE_KEY, WebcamStatus.offline);
      
      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    afterAll(() => {
      app.close();
    });
  });