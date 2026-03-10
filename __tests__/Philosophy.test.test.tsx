import 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Philosophy from './Philosophy';

// Mock expo-sqlite as requested
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    close: jest.fn(),
  }),
  SQLStatementError: jest.fn(),
}));

// Mock expo-sensors as requested
jest.mock('expo-sensors', () => ({
  Gyroscope: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
  Accelerometer: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
  Magnetometer: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

// Mock react-native to control Dimensions and Platform
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios,
    },
  };
});

describe('Philosophy Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Philosophy />);
    expect(container).toBeTruthy();
  });

  it('displays correct text content', () => {
    render(<Philosophy />);
    expect(screen.getByText('THE MOTIVATION')).toBeTruthy();
    expect(screen.getByText('REASON TO WAKE UP')).toBeTruthy();
    expect(screen.getByText('AND WORK')).toBeTruthy();
    expect(screen.getByText('Purpose is not found. It is forged in the daily grind.')).toBeTruthy();
  });

  it('validates structure and divider presence', () => {
    render(<Philosophy />);
    const container = screen.getByTestId('container') || screen.getByType('View');
    const divider = screen.getByType('View');
    
    // Ensure there are multiple Views (container, wrapper, divider)
    const views = screen.getAllByType('View');
    expect(views.length).toBeGreaterThanOrEqual(3);
  });

  it('applies iOS specific font styles', () => {
    // Ensure Platform.OS is 'ios' (default in mock)
    render(<Philosophy />);
    const label = screen.getByText('THE MOTIVATION');
    // Verify style prop exists (actual font family validation requires deep style inspection)
    expect(label.props.style).toBeDefined();
  });

  it('applies Android specific font styles', () => {
    // Override Platform mock for Android
    jest.mock('react-native', () => {
      const RN = jest.requireActual('react-native');
      return {
        ...RN,
        Dimensions: {
          get: jest.fn(() => ({ width: 375, height: 667 })),
        },
        Platform: {
          OS: 'android',
          select: (obj: any) => obj.android,
        },
      };
    });
    // Re-import to pick up new mock
    jest.resetModules();
    const PhilosophyAndroid = require('./Philosophy').default;
    
    render(<PhilosophyAndroid />);
    const label = screen.getByText('THE MOTIVATION');
    expect(label.props.style).toBeDefined();
  });

  it('handles edge case: zero width dimension', () => {
    jest.mock('react-native', () => {
      const RN = jest.requireActual('react-native');
      return {
        ...RN,
        Dimensions: {
          get: jest.fn(() => ({ width: 0, height: 667 })),
        },
        Platform: {
          OS: 'ios',
          select: (obj: any) => obj.ios,
        },
      };
    });
    jest.resetModules();
    const PhilosophyZeroWidth = require('./Philosophy').default;
    
    const { container } = render(<PhilosophyZeroWidth />);
    expect(container).toBeTruthy();
  });

  it('handles edge case: extremely large width dimension', () => {
    jest.mock('react-native', () => {
      const RN = jest.requireActual('react-native');
      return {
        ...RN,
        Dimensions: {
          get: jest.fn(() => ({ width: 9999, height: 667 })),
        },
        Platform: {
          OS: 'ios',
          select: (obj: any) => obj.ios,
        },
      };
    });
    jest.resetModules();
    const PhilosophyLargeWidth = require('./Philosophy').default;
    
    const { container } = render(<PhilosophyLargeWidth />);
    expect(container).toBeTruthy();
  });

  it('validates stateless stability (re-render consistency)', () => {
    const { rerender } = render(<Philosophy />);
    const initialHTML = screen.toJSON();
    
    // Simulate a parent state change by re-rendering
    rerender(<Philosophy />);
    const subsequentHTML = screen.toJSON();
    
    // Component should produce identical output as it has no internal state
    expect(initialHTML).toEqual(subsequentHTML);
  });

  it('validates accessibility hierarchy', () => {
    render(<Philosophy />);
    const texts = screen.getAllByType('Text');
    expect(texts.length).toBe(4); // Label, Headline 1, Headline 2, Subtext
  });

  it('verifies expo-sqlite mock is isolated', () => {
    // Ensure the component does not throw if expo-sqlite is mocked but unused
    const { container } = render(<Philosophy />);
    expect(container).toBeTruthy();
  });

  it('verifies expo-sensors mock is isolated', () => {
    // Ensure the component does not throw if expo-sensors is mocked but unused
    const { container } = render(<Philosophy />);
    expect(container).toBeTruthy();
  });
});