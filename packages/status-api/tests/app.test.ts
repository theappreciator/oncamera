import "reflect-metadata";
const request = require('supertest');
import { PERSIST_STORE_STATUS_KEY, PERSIST_STORE_TRANSITIONING_KEY, TRANSITIONING_TIME_MILLIS } from "../source/constants";
import PersistService from "../source/services/persistService";
import { WebcamStatus } from '@oncamera/common';

const app = require('../source/app');
const persist = PersistService.Instance;

const helperAdvanceTimersByAlmostFullTime = () => {
  jest.advanceTimersByTime(Math.floor(TRANSITIONING_TIME_MILLIS - 1));
}

const helperTransitioningToOfflineStatus = async () => {
  persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);

  const beginTimerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
  expect(beginTimerId).toBeUndefined();

  await request(app)
    .post('/api/webcam/status')
    .send('status=' + WebcamStatus.offline)
    .expect(200, {
      status: WebcamStatus.online
    });

  const timerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
  expect(timerId).not.toBeUndefined();

  const transitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
  expect(transitioningStatus).toBe(WebcamStatus.online);

  return timerId;
}


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

    it('should be able to update status from online->online, not already transitioning', async () => {
      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      persist.clear(PERSIST_STORE_TRANSITIONING_KEY);
      
      jest.useFakeTimers();

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        });

      const transitioningTimerId1 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId1).toBeUndefined();

      const transitioningStatus1 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus1).toBe(WebcamStatus.online);

      helperAdvanceTimersByAlmostFullTime();

      const transitioningTimerId2 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId2).toBeUndefined();

      const transitioningStatus2 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus2).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(2);

      const transitioningTimerId3 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId3).toBeUndefined();

      const transitioningStatus3 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus3).toBe(WebcamStatus.online);
    });

    it('should be able to update status from online->offline, not already transitioning', async () => {
      persist.save(PERSIST_STORE_STATUS_KEY, WebcamStatus.online);
      persist.clear(PERSIST_STORE_TRANSITIONING_KEY);
      
      jest.useFakeTimers();

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });

      const transitioningTimerId1 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId1).not.toBeUndefined();

      const transitioningStatus1 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus1).toBe(WebcamStatus.online);

      helperAdvanceTimersByAlmostFullTime();

      const transitioningTimerId2 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId2).toBe(transitioningTimerId1);

      const transitioningStatus2 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus2).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(2);

      const transitioningTimerId3 = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(transitioningTimerId3).toBeUndefined();

      const transitioningStatus3 = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(transitioningStatus3).toBe(WebcamStatus.offline);
    });

    it('should be able to update status from online->offline, already transitioning, multiple requests', async () => {
      jest.useFakeTimers();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const beginTransitioningTimerId = await helperTransitioningToOfflineStatus();

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.offline)
        .expect(200, {
          status: WebcamStatus.online
        });

      expect(clearTimeoutSpy).not.toHaveBeenCalledWith(beginTransitioningTimerId);

      const secondOfflineTransitionTimerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(secondOfflineTransitionTimerId).toBe(beginTransitioningTimerId);
      expect(secondOfflineTransitionTimerId).not.toBeUndefined();

      const secondRequestTransitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(secondRequestTransitioningStatus).toBe(WebcamStatus.online);

      helperAdvanceTimersByAlmostFullTime();

      const thirdRequestTransitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(thirdRequestTransitioningStatus).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS + 1);

      const finalStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(finalStatus).toBe(WebcamStatus.offline);

      const finalTransitioningId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(finalTransitioningId).toBeUndefined();
    });

    it('should be able to update status from online->online, already transitioning, multiple requests', async () => {
      jest.useFakeTimers();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const beginTransitioningTimerId = await helperTransitioningToOfflineStatus();

      await request(app)
        .post('/api/webcam/status')
        .send('status=' + WebcamStatus.online)
        .expect(200, {
          status: WebcamStatus.online
        });

      expect(clearTimeoutSpy).toHaveBeenCalledWith(beginTransitioningTimerId);

      const secondOfflineTransitionTimerId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(secondOfflineTransitionTimerId).toBeUndefined();

      const secondRequestTransitioningStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(secondRequestTransitioningStatus).toBe(WebcamStatus.online);

      jest.advanceTimersByTime(TRANSITIONING_TIME_MILLIS + 1);

      const finalStatus = persist.retrieve(PERSIST_STORE_STATUS_KEY);
      expect(finalStatus).toBe(WebcamStatus.online);

      const finalTransitioningId = persist.retrieve(PERSIST_STORE_TRANSITIONING_KEY);
      expect(finalTransitioningId).toBeUndefined();
    });

    afterAll(() => {
      app.close();
      persist.clearAll();
      jest.useRealTimers();
    });
  });