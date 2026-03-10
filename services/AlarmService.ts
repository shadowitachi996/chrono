import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { StepCounter } from 'expo-sensors';

// Types
export type AlarmType = 'math' | 'pedometer';

export interface MathQuestion {
  id: number;
  num1: number;
  num2: number;
  operator: '+' | '-' | '*';
  answer: number;
}

export interface AlarmConfig {
  type: AlarmType;
  mathQuestionsCount?: number;
  pedometerStepsGoal?: number;
}

export class AlarmService {
  private static instance: AlarmService;
  private audioPlayer: Audio.Sound | null = null;
  private stepSubscription: StepCounter.StepCounterSubscription | null = null;
  private mathQuestions: MathQuestion[] = [];
  private currentQuestionIndex = 0;
  private stepsGoal = 20;
  private initialStepCount = 0;
  private isAlarmActive = false;

  private constructor() {}

  public static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  // --- Initialization ---

  public async initialize(config: AlarmConfig): Promise<void> {
    this.isAlarmActive = true;
    this.stepsGoal = config.pedometerStepsGoal || 20;
    this.initialStepCount = 0;

    if (config.type === 'math') {
      this.generateMathQuestions(config.mathQuestionsCount || 3);
    }

    if (Platform.OS !== 'web') {
      await StepCounter.requestPermissionsAsync();
      // Get initial step count to calculate delta
      const initialSteps = await StepCounter.getStepCountAsync();
      this.initialStepCount = initialSteps;
    }
  }

  // --- Math Logic ---

  private generateMathQuestions(count: number): void {
    this.mathQuestions = [];
    for (let i = 0; i < count; i++) {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const operators: ('+' | '-' | '*')[] = ['+', '-', '*'];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      let answer = 0;
      switch (operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
      }

      this.mathQuestions.push({ id: i, num1, num2, operator, answer });
    }
    this.currentQuestionIndex = 0;
  }

  public getCurrentMathQuestion(): MathQuestion | null {
    if (this.mathQuestions.length === 0) return null;
    return this.mathQuestions[this.currentQuestionIndex];
  }

  public checkMathAnswer(input: number): boolean {
    const current = this.getCurrentMathQuestion();
    if (!current) return false;

    const isCorrect = input === current.answer;

    if (isCorrect) {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex >= this.mathQuestions.length) {
        this.completeAlarm('math');
      }
    }
    return isCorrect;
  }

  // --- Pedometer Logic ---

  public startPedometerListener(onStepUpdate: (steps: number) => void): void {
    if (Platform.OS === 'web') return;

    this.stepSubscription = StepCounter.watchStepCount(
      (event) => {
        const totalSteps = event.steps;
        const stepsTaken = totalSteps - this.initialStepCount;
        
        onStepUpdate(stepsTaken);
        
        if (stepsTaken >= this.stepsGoal) {
          this.completeAlarm('pedometer');
        }
      },
      { interval: 1000 }
    );
  }

  public stopPedometerListener(): void {
    if (this.stepSubscription) {
      this.stepSubscription.remove();
      this.stepSubscription = null;
    }
  }

  // --- Audio & Completion ---

  public async playAlarmSound(): Promise<void> {
    try {
      if (this.audioPlayer) {
        await this.audioPlayer.stopAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'), // Placeholder path
        { shouldPlay: true }
      );
      this.audioPlayer = sound;
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  }

  public async stopAlarmSound(): Promise<void> {
    if (this.audioPlayer) {
      await this.audioPlayer.stopAsync();
      await this.audioPlayer.unloadAsync();
      this.audioPlayer = null;
    }
  }

  private completeAlarm(type: AlarmType): void {
    this.isAlarmActive = false;
    this.stopPedometerListener();
    this.stopAlarmSound();
    console.log(`Alarm ${type} completed successfully.`);
  }

  public reset(): void {
    this.isAlarmActive = false;
    this.mathQuestions = [];
    this.currentQuestionIndex = 0;
    this.initialStepCount = 0;
    this.stopPedometerListener();
    this.stopAlarmSound();
  }
}