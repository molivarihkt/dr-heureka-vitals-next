import React from 'react';
import {render, screen, fireEvent, waitFor, act, prettyDOM} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Finish from '@/app/finish/page';
import { fromSINumberToString, copyToClipboardText } from '@/lib/domain-utils';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock usePushWithQuery hook
jest.mock('@/hooks/usePushWithQuery', () => ({
  usePushWithQuery: () => mockPush,
}));

// Mock Chart.js components
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  Filler: {},
  Legend: {},
  LineElement: {},
  PointElement: {},
  RadialLinearScale: {},
  Tooltip: {},
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Radar: ({ data, options }) => (
    <div data-testid="radar-chart" data-chart-data={JSON.stringify(data)}>
      Mocked Radar Chart
    </div>
  ),
}));

;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Finish Page', () => {
  const mockResultData = {
    hr: 75,
    hrv_indices: { SDNNI: 45 },
    sbp: 120,
    dbp: 80,
    rr: 18,
    spo2: 98,
    si: 150,
    signal_quality: {
      hr_hrv: 0.8,
      bp: 0.7,
      resp: 0.8,
      spo2: 0.95,
    },
    activity: 3,
    equilibrium: 2,
    health: 4,
    metabolism: 2,
    relaxation: 3,
    sleep: 4,
  };
  let user;

  beforeEach(() => {
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockResultData));
  });

  describe('Copy to Clipboard Functionality', () => {
    test('should copy correct data to clipboard when copy button is clicked', async () => {
      jest.useFakeTimers();
      render(<Finish />);
      const copyButton = screen.getByTitle('Copy to clipboard');
      await user.click(copyButton);
      const expectedClipboardText = copyToClipboardText({
        last_hr: mockResultData.hr,
        last_hrv: mockResultData.hrv_indices.SDNNI,
        last_rr: mockResultData.rr,
        last_sbp: mockResultData.sbp,
        last_dbp: mockResultData.dbp,
        last_spo2: mockResultData.spo2,
        last_si: mockResultData.si,
        radarValues: {
          activity: mockResultData.activity,
          equilibrium: mockResultData.equilibrium,
          health: mockResultData.health,
          metabolism: mockResultData.metabolism,
          relaxation: mockResultData.relaxation,
          sleep: mockResultData.sleep,
        },
      });
      expect(await navigator.clipboard.readText()).toBe(expectedClipboardText);
      jest.useRealTimers();
    });

    test('should show toast after copying to clipboard', async () => {
      render(<Finish />);
      
      const copyButton = screen.getByTitle('Copy to clipboard');
      
      await user.click(copyButton);
      
      expect(screen.getByText('¡Copiado exitosamente!')).toBeInTheDocument();
    });

    test('should hide toast after 3 seconds', async () => {
      jest.useFakeTimers();

      render(<Finish />);
      
      const copyButton = screen.getByTitle('Copy to clipboard');

      await user.click(copyButton);

      expect(screen.getByText('¡Copiado exitosamente!')).toBeInTheDocument();
      
      await act(() => {
        jest.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.queryByText('¡Copiado exitosamente!')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Navigation', () => {
    test('should navigate to basic_info page when Finalizar button is clicked', async () => {
      render(<Finish />);
      
      const finalizarButton = screen.getByText('Finalizar');
      
      await user.click(finalizarButton);
      
      expect(mockPush).toHaveBeenCalledWith('/basic_info');
    });
  });

  describe('Indicator Images', () => {
    test('should display indicators with correct image paths for valid values (0-5)', () => {
      render(<Finish />);
      const indicators = [
        { title: 'Actividad', value: mockResultData.activity },
        { title: 'Sueño', value: mockResultData.sleep },
        { title: 'Equilibrio', value: mockResultData.equilibrium },
        { title: 'Metabolismo', value: mockResultData.metabolism },
        { title: 'Salud', value: mockResultData.health },
        { title: 'Relajación', value: mockResultData.relaxation },
      ];
      indicators.forEach(({ title, value }) => {
        const indicator = screen.getByTestId(`indicator-${title}`);
        expect(indicator).toBeInTheDocument();
        // Check that the value is between 0 and 5
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(5);
        // Check that image src follows the correct pattern
        const indicatorImage = indicator.querySelector('img');
        expect(indicatorImage).toHaveAttribute('src', `images/icon_sp_${value}.svg`);
      });
    });

    test('should handle edge case values (0 and 5)', () => {
      const edgeCaseData = {
        ...mockResultData,
        activity: 0,
        sleep: 5,
        equilibrium: 0,
        metabolism: 5,
        health: 0,
        relaxation: 5,
      };
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(edgeCaseData));
      
      render(<Finish />);
      
      // Check that all images exist for edge values
      const images = screen.getAllByAltText('Activity indicator');
      images.forEach((img, index) => {
        const expectedValues = [0, 5, 0, 5, 0, 5];
        expect(img).toHaveAttribute('src', `images/icon_sp_${expectedValues[index]}.svg`);
      });
    });
  });

  describe('Stress Index Values', () => {
    test('should display "Low" for stress index < 50', () => {
      const lowStressData = { ...mockResultData, si: 25 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(lowStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    test('should display "Normal" for stress index 50-199', () => {
      const normalStressData = { ...mockResultData, si: 150 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(normalStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    test('should display "Mild" for stress index 200-349', () => {
      const mildStressData = { ...mockResultData, si: 250 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mildStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('Mild')).toBeInTheDocument();
    });

    test('should display "High" for stress index 350-499', () => {
      const highStressData = { ...mockResultData, si: 400 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(highStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    test('should display "Very High" for stress index >= 500', () => {
      const veryHighStressData = { ...mockResultData, si: 600 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(veryHighStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('Very High')).toBeInTheDocument();
    });

    test('should display "--" for negative stress index', () => {
      const negativeStressData = { ...mockResultData, si: -1 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(negativeStressData));
      
      render(<Finish />);
      
      expect(screen.getByText('---')).toBeInTheDocument();
    });

    test('should test all stress index boundary values', () => {
      const testCases = [
        { si: -1, expected: '---' },
        { si: 0, expected: 'Low' },
        { si: 49, expected: 'Low' },
        { si: 50, expected: 'Normal' },
        { si: 199, expected: 'Normal' },
        { si: 200, expected: 'Mild' },
        { si: 349, expected: 'Mild' },
        { si: 350, expected: 'High' },
        { si: 499, expected: 'High' },
        { si: 500, expected: 'Very High' },
        { si: 1000, expected: 'Very High' },
      ];

      testCases.forEach(({ si, expected }) => {
        expect(fromSINumberToString(si)).toBe(expected);
      });
    });
  });

  describe('Data Loading', () => {
    test('should handle missing session data gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      render(<Finish />);
      
      // Should render with default values
      expect(screen.getAllByText('--')).not.toHaveLength(0);
    });

    test('should display vitals with correct validity indicators', () => {
      render(<Finish />);
      
      // Check that valid indicators have success class
      const hrValue = screen.getByText('75'); // HR value
      expect(hrValue).toHaveClass('text-success');
      
      // Check that valid BP values have success class
      const sbpValue = screen.getByText('120');
      const dbpValue = screen.getByText('80');
      expect(sbpValue).toHaveClass('text-success');
      expect(dbpValue).toHaveClass('text-success');
    });

    test('should display invalid vitals with dark text', () => {
      const invalidData = {
        ...mockResultData,
        signal_quality: {
          hr_hrv: 0.5, // Below 0.7 threshold
          bp: 0.5,     // Below 0.6 threshold
          resp: 0.6,   // Below 0.7 threshold
          spo2: 0.8,   // Below 0.9 threshold
        },
      };
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(invalidData));
      
      render(<Finish />);
      
      // Check that invalid indicators have dark class
      const hrValue = screen.getByText('75');
      expect(hrValue).toHaveClass('text-dark');
    });
  });

  describe('UI Elements', () => {
    test('should render radar chart with correct data', () => {
      render(<Finish />);
      
      const radarChart = screen.getByTestId('radar-chart');
      expect(radarChart).toBeInTheDocument();
      
      const chartData = JSON.parse(radarChart.getAttribute('data-chart-data'));
      expect(chartData.datasets[0].data).toEqual([
        mockResultData.activity,
        mockResultData.sleep,
        mockResultData.equilibrium,
        mockResultData.metabolism,
        mockResultData.health,
        mockResultData.relaxation,
      ]);
    });
  });
});
