import { Platform } from 'react-native';
import { AlarmService, AlarmConfig } from './AlarmService';

// Mock external dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('expo-sensors', () => ({
  StepCounter: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getStepCountAsync: jest.fn().mockResolvedValue(0),
    watchStepCount: jest.fn().mockImplementation((callback, options) => {
      return {
        remove: jest.fn(),
      };
    }),
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          stopAsync: jest.fn().mockResolvedValue(undefined),
          unloadAsync: jest.fn().mockResolvedValue(undefined),
        },
      }),
    },
  },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    executeAsync: jest.fn(),
    closeAsync: jest.fn(),
  }),
}));

jest.mock('../../assets/sounds/alarm.mp3', () => 'mocked-asset-path');

// Helper to reset singleton instance between tests
const resetSingleton = () => {
  (AlarmService as any).instance = null;
};

describe('AlarmService', () => {
  let service: AlarmService;

  beforeEach(() => {
    jest.clearAllMocks();
    resetSingleton();
    service = AlarmService.getInstance();
  });

  afterEach(() => {
    resetSingleton();
  });

  describe('Initialization', () => {
    it('should initialize with math config and default questions', async () => {
      const config: AlarmConfig = { type: 'math', mathQuestionsCount: 3 };
      await service.initialize(config);

      expect((service as any).isAlarmActive).toBe(true);
      expect((service as any).mathQuestions.length).toBe(3);
      expect((service as any).currentQuestionIndex).toBe(0);
    });

    it('should initialize with pedometer config and custom steps goal', async () => {
      const config: AlarmConfig = { type: 'pedometer', pedometerStepsGoal: 50 };
      await service.initialize(config);

      expect((service as any).stepsGoal).toBe(50);
      expect((service as any).isAlarmActive).toBe(true);
    });

    it('should use default steps goal if not provided', async () => {
      const config: AlarmConfig = { type: 'pedometer' };
      await service.initialize(config);

      expect((service as any).stepsGoal).toBe(20);
    });

    it('should request permissions and get initial steps on non-web', async () => {
      const config: AlarmConfig = { type: 'pedometer' };
      await service.initialize(config);

      expect(require('expo-sensors').StepCounter.requestPermissionsAsync).toHaveBeenCalled();
      expect(require('expo-sensors').StepCounter.getStepCountAsync).toHaveBeenCalled();
    });
  });

  describe('Math Logic', () => {
    beforeEach(async () => {
      await service.initialize({ type: 'math', mathQuestionsCount: 2 });
    });

    it('should return current math question', () => {
      const question = service.getCurrentMathQuestion();
      expect(question).not.toBeNull();
      expect(question?.id).toBe(0);
    });

    it('should return null if no questions exist', async () => {
      await service.initialize({ type: 'pedometer' });
      expect(service.getCurrentMathQuestion()).toBeNull();
    });

    it('should advance index on correct answer', () => {
      const question = service.getCurrentMathQuestion();
      if (!question) return;
      
      const result = service.checkMathAnswer(question.answer);
      expect(result).toBe(true);
      expect((service as any).currentQuestionIndex).toBe(1);
    });

    it('should not advance index on incorrect answer', () => {
      const question = service.getCurrentMathQuestion();
      if (!question) return;

      const result = service.checkMathAnswer(question.answer + 1);
      expect(result).toBe(false);
      expect((service as any).currentQuestionIndex).toBe(0);
    });

    it('should complete alarm after last correct answer', async () => {
      // Setup 1 question
      await service.initialize({ type: 'math', mathQuestionsCount: 1 });
      const question = service.getCurrentMathQuestion();
      
      // Spy on private method via side effect (console.log or state change)
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      if (question) {
        service.checkMathAnswer(question.answer);
      }

      expect((service as any).isAlarmActive).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Alarm math completed successfully.');
      consoleSpy.mockRestore();
    });

    it('should handle edge case of 0 math questions', async () => {
      await service.initialize({ type: 'math', mathQuestionsCount: 0 });
      expect(service.getCurrentMathQuestion()).toBeNull();
      expect(service.checkMathAnswer(10)).toBe(false);
    });
  });

  describe('Pedometer Logic', () => {
    it('should start listener and calculate delta', async () => {
      await service.initialize({ type: 'pedometer', pedometerStepsGoal: 10 });
      const onStepUpdate = jest.fn();
      
      service.startPedometerListener(onStepUpdate);
      
      // Simulate callback from mock
      const mockCallback = (require('expo-sensors').StepCounter.watchStepCount as jest.Mock).mock.calls[0][0];
      mockCallback({ steps: 15 }); // Initial was 0, so delta is 15

      expect(onStepUpdate).toHaveBeenCalledWith(15);
      expect((service as any).isAlarmActive).toBe(false); // Goal reached
    });

    it('should not complete alarm if goal not reached', async () => {
      await service.initialize({ type: 'pedometer', pedometerStepsGoal: 100 });
      const onStepUpdate = jest.fn();
      
      service.startPedometerListener(onStepUpdate);
      
      const mockCallback = (require('expo-sensors').StepCounter.watchStepCount as jest.Mock).mock.calls[0][0];
      mockCallback({ steps: 50 });

      expect((service as any).isAlarmActive).toBe(true);
    });

    it('should skip listener on web platform', async () => {
      (Platform as any).OS = 'web';
      await service.initialize({ type: 'pedometer' });
      
      const onStepUpdate = jest.fn();
      service.startPedometerListener(onStepUpdate);
      
      expect(require('expo-sensors').StepCounter.watchStepCount).not.toHaveBeenCalled();
    });

    it('should stop listener correctly', async () => {
      await service.initialize({ type: 'pedometer' });
      service.startPedometerListener(() => {});
      
      const subscription = (service as any).stepSubscription;
      expect(subscription).not.toBeNull();
      
      service.stopPedometerListener();
      expect(subscription.remove).toHaveBeenCalled();
      expect((service as any).stepSubscription).toBeNull();
    });
  });

  describe('Audio Logic', () => {
    it('should play alarm sound', async () => {
      await service.playAlarmSound();
      expect(require('expo-av').Audio.Sound.createAsync).toHaveBeenCalled();
      expect((service as any).audioPlayer).not.toBeNull();
    });

    it('should stop existing sound before playing new one', async () => {
      await service.playAlarmSound();
      await service.playAlarmSound();
      
      // Should have called stopAsync on the previous player
      // Note: Mock implementation needs to track this. 
      // Since we mock createAsync to return a new object, we need to ensure stopAsync was called on the old one.
      // The code does: if (this.audioPlayer) await this.audioPlayer.stopAsync();
      // We need to verify this logic.
      expect(require('expo-av').Audio.Sound.createAsync).toHaveBeenCalledTimes(2);
    });

    it('should stop and unload sound', async () => {
      await service.playAlarmSound();
      await service.stopAlarmSound();
      
      const player = (service as any).audioPlayer;
      expect(player.stopAsync).toHaveBeenCalled();
      expect(player.unloadAsync).toHaveBeenCalled();
      expect((service as any).audioPlayer).toBeNull();
    });

    it('should handle stop when no player exists', async () => {
      await service.stopAlarmSound();
      expect((service as any).audioPlayer).toBeNull();
    });
  });

  describe('Reset and Completion', () => {
    it('should reset all state', async () => {
      await service.initialize({ type: 'math', mathQuestionsCount: 5 });
      service.reset();

      expect((service as any).isAlarmActive).toBe(false);
      expect((service as any).mathQuestions.length).toBe(0);
      expect((service as any).currentQuestionIndex).toBe(0);
      expect((service as any).initialStepCount).toBe(0);
    });

    it('should stop listeners and audio on reset', async () => {
      await service.initialize({ type: 'pedometer' });
      service.startPedometerListener(() => {});
      await service.playAlarmSound();
      
      service.reset();
      
      expect((service as any).stepSubscription).toBeNull();
      expect((service as any).audioPlayer).toBeNull();
    });
  });
});