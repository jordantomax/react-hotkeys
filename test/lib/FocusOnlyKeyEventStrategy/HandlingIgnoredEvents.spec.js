import { expect } from 'chai';
import sinon from 'sinon';

import KeyEventManager from '../../../src/lib/KeyEventManager';
import KeyEventRecordState from '../../../src/const/KeyEventRecordState';
import MockSyntheticEvent from '../../support/MockSyntheticEvent';

describe('Handling ignored events:', function () {
  context('when the FocusOnlyKeyEventStrategy receives', () => {
    beforeEach(function () {
      this.keyEventManager = new KeyEventManager();
      this.eventStrategy = this.keyEventManager._focusOnlyEventStrategy;

      this.handler = sinon.spy();

      this.componentId = this.eventStrategy.registerKeyMap({});
    });

    context('a keydown event', () => {
      beforeEach(function () {
        this.keyMap = {ACTION1: { sequence: 'a', action: 'keydown' } };
      });

      context('that is NOT ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => false
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );

          this.eventStrategy.handleKeydown(
            new MockSyntheticEvent('keydown', {key: 'a'}),
            0,
            this.componentId,
            this.eventOptions
          );
        });

        it('then the key is added to the current key combination', function () {
          expect(this.eventStrategy.keyCombinationHistory).to.eql([
            {
              'keys': {
                'a': [
                  [KeyEventRecordState.unseen, KeyEventRecordState.unseen, KeyEventRecordState.unseen],
                  [KeyEventRecordState.seen, KeyEventRecordState.unseen, KeyEventRecordState.unseen]
                ]
              },
              'ids': ['a'],
              'keyAliases': {}
            }
          ]);
        });

        it('then calls any matching handlers', function() {
          expect(this.handler).to.have.been.calledOnce;
        });
      });

      context('that is ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => KeyEventRecordState.seen
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );

          this.eventStrategy.handleKeydown(
            new MockSyntheticEvent('keydown', {key: 'a'}),
            0,
            this.componentId,
            this.eventOptions
          );
        });

        it('then the key is NOT added to the current key combination', function () {
          expect(this.eventStrategy.keyCombinationHistory).to.eql([]);
        });

        it('then does NOT call any matching handlers', function() {
          expect(this.handler).to.not.have.been.called;
        });
      });
    });

    context('a keypress event', () => {
      beforeEach(function () {
        this.keyMap = {ACTION1: { sequence: 'a', action: 'keypress' } };
      });

      context('that is NOT ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => false
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );
        });

        context('and the key already exists in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeydown(
              new MockSyntheticEvent('keydown', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );

            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([
              {
                'keys': {
                  'a': [
                    [KeyEventRecordState.seen, KeyEventRecordState.unseen, KeyEventRecordState.unseen],
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.unseen]
                  ]
                },
                'ids': ['a'],
                'keyAliases': {}
              }
            ]);
          });

          it('then calls any matching handlers', function() {
            expect(this.handler).to.have.been.calledOnce;
          });
        });

        context('and the key does NOT already exist in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is NOT added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });
      });

      context('that is ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => true
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );
        });

        context('and the key already exists in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeydown(
              new MockSyntheticEvent('keydown', {key: 'a'}),
              0,
              this.componentId,
              { ignoreEventsCondition: () => false }
            );

            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([
              {
                'keys': {
                  'a': [
                    [KeyEventRecordState.seen, KeyEventRecordState.unseen, KeyEventRecordState.unseen],
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.unseen]
                  ]
                },
                'ids': ['a'],
                'keyAliases': {}
              }
            ]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });

        context('and the key does NOT already exist in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is NOT added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });
      });
    });

    context('a keyup event', () => {
      beforeEach(function () {
        this.keyMap = {ACTION1: { sequence: 'a', action: 'keyup' } };
      });

      context('that is NOT ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => false
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );
        });

        context('and the key already exists in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeydown(
              new MockSyntheticEvent('keydown', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );

            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );

            this.eventStrategy.handleKeyup(
              new MockSyntheticEvent('keyup', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([
              {
                'keys': {
                  'a': [
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.unseen],
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.seen]
                  ]
                },
                'ids': ['a'],
                'keyAliases': {}
              }
            ]);
          });

          it('then calls any matching handlers', function() {
            expect(this.handler).to.have.been.calledOnce;
          });
        });

        context('and the key does NOT already exist in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeyup(
              new MockSyntheticEvent('keyup', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is NOT added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });
      });

      context('that is ignored', () => {
        beforeEach(function () {
          this.eventOptions = {
            ignoreEventsCondition: () => false
          };

          this.eventStrategy.enableHotKeys(
            this.componentId,
            this.keyMap,
            {ACTION1: this.handler},
            {},
            this.eventOptions
          );
        });

        context('and the key already exists in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeydown(
              new MockSyntheticEvent('keydown', {key: 'a'}),
              0,
              this.componentId,
              { ignoreEventsCondition: () => false }
            );

            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              { ignoreEventsCondition: () => false }
            );

            this.eventStrategy.handleKeyup(
              new MockSyntheticEvent('keyup', {key: 'a'}),
              0,
              this.componentId,
              { ignoreEventsCondition: () => true }
            );
          });

          it('then the key is added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([
              {
                'keys': {
                  'a': [
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.unseen],
                    [KeyEventRecordState.seen, KeyEventRecordState.seen, KeyEventRecordState.seen]
                  ]
                },
                'ids': ['a'],
                'keyAliases': {}
              }
            ]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });

        context('and the key does NOT already exist in the current combination', () => {
          beforeEach(function () {
            this.eventStrategy.handleKeypress(
              new MockSyntheticEvent('keypress', {key: 'a'}),
              0,
              this.componentId,
              this.eventOptions
            );
          });

          it('then the key is NOT added to the current key combination', function () {
            expect(this.eventStrategy.keyCombinationHistory).to.eql([]);
          });

          it('then does NOT call any matching handlers', function() {
            expect(this.handler).to.not.have.been.called;
          });
        });
      });
    });
  });
});
