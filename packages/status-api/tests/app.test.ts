import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
const request = require('supertest');
import { PERSIST_STORE_STATUS_KEY, PERSIST_STORE_TRANSITIONING_KEY, TRANSITIONING_TIME_MILLIS } from "../source/constants";
import PersistService from "../source/services/persistService";
import { DataKeys, WebcamStatus } from '@oncamera/common';




const app = require('../source/app');
const persist = PersistService.Instance;

describe('base App', function() {
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

    it('should return a webcam online status from the saved store', (done) => {

      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);

      request(app)
        .get('/api/webcam/status')
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    it('should return a webcam offline status from the saved store', (done) => {

      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.offline);

      request(app)
        .get('/api/webcam/status')
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should be able to update the saved webcam to online status to an empty store', (done) => {

      persist.clearAll();

      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    it('should be able to update the saved webcam to offline status to an empty store', (done) => {

      persist.clearAll();

      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should be able to update the same value to saved webcam offline status to a non-empty store', (done) => {

      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.offline);
      
      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.offline
        }, done);
    });

    it('should be able to update the same value to saved webcam online status to a non-empty store', (done) => {

      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      
      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    it('should be able to update status from offline->online', (done) => {

      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.offline);
      
      request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        }, done);
    });

    it('should be able to update status from online->offline, not already transitioning', async () => {
      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      
      jest.useFakeTimers();

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });
      
      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS + 1);

      const status = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(status).toBe(WebcamStatus.offline);
    });

    it('should be able to update status from online->offline, already transitioning', async () => {
      const previousTimerId = '123456';
      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      persist.save(PERSIST_STORE_TRANSITIONING_KEY, previousTimerId);
      
      jest.useFakeTimers();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });

      expect(clearTimeoutSpy).toHaveBeenCalledWith(previousTimerId);

      const timerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(timerId).not.toBe(previousTimerId);

      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS - 1);

      const transitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS + 1);

      const finalStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(finalStatus).toBe(WebcamStatus.offline);
    });

    it('should be able to update status from online->offline, already transitioning, multiple requests', async () => {
      const previousTimerId = '123456';
      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      persist.save(PERSIST_STORE_TRANSITIONING_KEY, previousTimerId);
      
      jest.useFakeTimers();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });

      expect(clearTimeoutSpy).toHaveBeenCalledWith(previousTimerId);

      const firstRequestTimerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(firstRequestTimerId).not.toBe(previousTimerId);

      jest.advanceTimersByTime(Math.floor(TRANSITIONING_TIME_MILLIS - 100));

      const firstRequestTransitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(firstRequestTransitioningStatus).toBe(WebcamStatus.online);

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });
      
      expect(clearTimeoutSpy).toHaveBeenCalledWith(firstRequestTimerId);

      const secondRequestTimerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(secondRequestTimerId).not.toBe(firstRequestTimerId);

      jest.advanceTimersByTime(Math.floor(TRANSITIONING_TIME_MILLIS - 100));

      const secondRequestTransitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(secondRequestTransitioningStatus).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS + 1);

      const finalStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(finalStatus).toBe(WebcamStatus.offline);
    });

    afterAll(() => {
      app.close();
      persist.clearAll();
      jest.useRealTimers();
    });
  });