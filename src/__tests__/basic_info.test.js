import {render, screen, fireEvent, waitFor, prettyDOM} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import BasicInfo from '@/app/basic_info/page';
import { MAX_USAGES } from '@/constants';
import {AppRouterContext} from "next/dist/shared/lib/app-router-context.shared-runtime";

const mockPush = jest.fn();
const mockedRouter = {
  push: mockPush,
  replace: jest.fn(),
  asPath: '/',
  pathname: '/',
  // include anything your component expects:
  prefetch: jest.fn(),
};

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => {
  return ({
    useRouter: () => mockedRouter,
    useSearchParams: jest.fn(),
    usePathname: () => '/',
    useParams: () => ({}),              // if your code uses dynamic params
    useFormStatus: () => ({             // for next Form component
      pending: false,
      action: () => Promise.resolve(),
    }),
  });
});

// Mock the I18NProvider and other providers
jest.mock('@/app/providers', () => ({
  I18NProvider: ({ children }) => children,
  LineValidatorProvider: ({ children }) => children,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'title': 'Calibración',
        'text1': 'Nuestro algoritmo se basa en la información introducida sobre su Presión Arterial (PA) como referencia para calcular los resultados exactos del paciente...',
        'text2': 'Normal: PAS 90 - 120\nPrehipertensión: PAS 120 - 140\nHipertensión: PAS 140 - 180',
        'text3': '1- Si ud es hipertenso y está tomando medicación entonces debe indicar el estado de Prehipertensión...',
        'subtitle': 'Importante',
        'text4': 'Vitals posee un software de medición de la frecuencia del pulso sin contacto basado en video...',
      };
      return translations[key] || key;
    }
  }),
}));

describe('BasicInfo Page', () => {
  // Helper to render BasicInfo always with router context
  async function renderBasicInfo() {
    return await render(
      <AppRouterContext.Provider value={mockedRouter}>
        <BasicInfo/>
      </AppRouterContext.Provider>
    );
  }

  let mockPushWithQuery;

  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
    // Reset mocks
    jest.clearAllMocks();
    // Setup default mocks
    useSearchParams.mockReturnValue(new URLSearchParams());
  });

  beforeAll(() => {
    HTMLDialogElement.prototype.show = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  })


  afterEach(() => {
    localStorage.clear();
  });

  describe('First time user (5 usages left)', () => {
    test('should show 5 usages left and default values selected', () => {
      renderBasicInfo();

      // Check usage message
      expect(screen.getByText('Te quedan 5 usos disponibles')).toBeInTheDocument();

      // Check default values are selected
      expect(screen.getByDisplayValue('170')).toBeInTheDocument(); // height
      expect(screen.getByDisplayValue('60')).toBeInTheDocument(); // weight
      expect(screen.getByDisplayValue('1999')).toBeInTheDocument(); // birth year
      
      // Check radio buttons - male should be selected by default
      const maleRadio = screen.getByLabelText('Masculino');
      expect(maleRadio).toBeChecked();
      
      // Check hypertension - normal should be selected by default
      const normalBP = screen.getByLabelText(/Normal.*120 mmHg/);
      expect(normalBP).toBeChecked();
      
      // Check camera - frontal should be selected by default
      const frontalCamera = screen.getByLabelText('Frontal');
      expect(frontalCamera).toBeChecked();

      // Check that Comenzar button is enabled
      const comenzarButton = screen.getByText('Comenzar');
      expect(comenzarButton).not.toBeDisabled();
    });

    test('should show 1 usage left with correct message when user has 4 usages', () => {
      // Set up localStorage to simulate 4 usages
      localStorage.setItem('usages', '4');
      
      renderBasicInfo();

      expect(screen.getByText('Te queda 1 uso disponible')).toBeInTheDocument();
    });
  });

  describe('User reached maximum usages', () => {
    test('should disable Comenzar button and show max usage message', () => {
      // Set up localStorage to simulate max usages reached
      localStorage.setItem('usages', MAX_USAGES.toString());
      
      renderBasicInfo();

      // Check that the max usage message is shown
      expect(screen.getByText('Has alcanzado el máximo de usos permitidos.')).toBeInTheDocument();
      expect(screen.getByText('Has alcanzado el máximo de usos permitidos. Por favor, contacta con el soporte para más información.')).toBeInTheDocument();

      // Check that Comenzar button is disabled
      const comenzarButton = screen.getByText('Comenzar');
      expect(comenzarButton).toBeDisabled();
    });
  });

  describe('User with saved vital signs data', () => {
    test('should remember and select all previously saved values', async () => {
      const savedData = {
        sex: 0, // female
        height: 165,
        weight: 55,
        age: 30,
        bp_group: 'prehypertension',
        facing_mode: 'environment'
      };
      localStorage.setItem('data', JSON.stringify(savedData));

      await renderBasicInfo();

      await waitFor(() => {
        expect(screen.getByDisplayValue('165')).toBeInTheDocument();
        expect(screen.getByDisplayValue('55')).toBeInTheDocument();
      })

      // Birth year should be calculated from age
      const currentYear = new Date().getFullYear();
      const expectedBirthYear = currentYear - 30;
      expect(screen.getByDisplayValue(expectedBirthYear.toString())).toBeInTheDocument();

      // Check radio buttons
      const femaleRadio = screen.getByLabelText('Femenino');
      expect(femaleRadio).toBeChecked();

      const prehypertensionBP = screen.getByLabelText(/Prehypertension.*120 ~ 139 mmHg/);
      expect(prehypertensionBP).toBeChecked();

      const backCamera = screen.getByLabelText('Trasera');
      expect(backCamera).toBeChecked();
    });

    test('should use defaults when saved data is malformed', () => {
      // Set up localStorage with malformed data
      localStorage.setItem('data', 'invalid json');
      
      renderBasicInfo();

      // Should fall back to defaults
      expect(screen.getByDisplayValue('170')).toBeInTheDocument(); // height
      expect(screen.getByDisplayValue('60')).toBeInTheDocument(); // weight
      expect(screen.getByDisplayValue('1999')).toBeInTheDocument(); // birth year
      
      const maleRadio = screen.getByLabelText('Masculino');
      expect(maleRadio).toBeChecked();
    });
  });

  describe('ConsentModal behavior', () => {
    test('should show modal when Comenzar is pressed and Aceptar should be disabled initially', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      // Check that modal is shown
      await waitFor(() => {
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      });

      // Check that Aceptar button is disabled initially
      const aceptarButton = screen.getByText('Aceptar');
      expect(aceptarButton).toBeDisabled();
    });

    test('should enable Aceptar button when user scrolls to the end of modal', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Find the dialog element
      const dialog = screen.getByTestId('consent-modal');
      
      // Mock scrolling to the bottom
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });

      // Aceptar button should still be disabled (not at bottom)
      const aceptarButton = screen.getByText('Aceptar');
      expect(aceptarButton).toBeDisabled();

      // Now scroll to the bottom
      Object.defineProperty(dialog, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });

      fireEvent.scroll(dialog);

      // Wait for state update
      await waitFor(() => {
        const aceptarButtonEnabled = screen.getByText('Aceptar');
        expect(aceptarButtonEnabled).toBeEnabled();
      });
    });

    test('should save data to localStorage and redirect to scan page when ConsentModal is accepted', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      // Fill out the form with custom values
      const heightInput = screen.getByDisplayValue('170');
      const weightInput = screen.getByDisplayValue('60');
      const birthYearInput = screen.getByDisplayValue('1999');

      await user.clear(heightInput);
      await user.type(heightInput, '175');
      
      await user.clear(weightInput);
      await user.type(weightInput, '70');
      
      await user.clear(birthYearInput);
      await user.type(birthYearInput, '1990');

      // Select female
      const femaleRadio = screen.getByLabelText('Femenino');
      await user.click(femaleRadio);

      // Select prehypertension
      const prehypertensionBP = screen.getByLabelText(/Prehypertension.*120 ~ 139 mmHg/);
      await user.click(prehypertensionBP);

      // Select back camera
      const backCamera = screen.getByLabelText('Trasera');
      await user.click(backCamera);

      // Click Comenzar
      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Mock that the user has scrolled to the end
      const dialog = screen.getByTestId('consent-modal');
      Object.defineProperty(dialog, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });
      fireEvent.scroll(dialog);

      await waitFor(() => {
        const aceptarButton = screen.getByText('Aceptar');
        expect(aceptarButton).toBeEnabled();
      });

      // Click Aceptar
      const aceptarButton = screen.getByText('Aceptar');
      await user.click(aceptarButton);

      // Check that data was saved to localStorage
      const savedData = JSON.parse(localStorage.getItem('data'));
      expect(savedData).toEqual({
        height: 175,
        weight: 70,
        sex: 0, // female
        age: new Date().getFullYear() - 1990,
        bp_mode: 'ternary',
        bp_group: 'prehypertension',
        facing_mode: 'environment'
      });

      // Check that it redirects to scan page
      expect(mockPush).toHaveBeenCalledWith('/scan', {});
    });

    test('should preserve line query parameter when redirecting to scan page', async () => {
      const user = userEvent.setup();
      
      // Setup search params with line parameter
      const mockSearchParams = new URLSearchParams('line=12345');
      useSearchParams.mockReturnValue(mockSearchParams);
      
      renderBasicInfo();

      // Click Comenzar
      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Mock that the user has scrolled to the end
      const dialog = screen.getByTestId('consent-modal');
      Object.defineProperty(dialog, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });
      fireEvent.scroll(dialog);

      await waitFor(() => {
        const aceptarButton = screen.getByText('Aceptar');
        expect(aceptarButton).toBeEnabled();
      });

      // Click Aceptar
      const aceptarButton = screen.getByText('Aceptar');
      await user.click(aceptarButton);

      // Check that the line query parameter is preserved when redirecting to scan page
      // Accept both ? and & join cases
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/scan\?line=12345$/), {});
    });

    test('should close modal when X button is clicked', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      });

      // Click the X button
      const closeButton = screen.getByText('X');
      await user.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      });
    });

    test('should close modal when Cerrar button is clicked', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Click the Cerrar button
      const cerrarButton = screen.getByText('Cerrar');
      await user.click(cerrarButton);

      // Modal should be closed
      await waitFor(() => {
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      });
    });
  });

  describe('Form validation and interaction', () => {
    test('should handle form submission with default values', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Mock scroll to enable Aceptar
      const dialog = screen.getByTestId('consent-modal');
      Object.defineProperty(dialog, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });
      fireEvent.scroll(dialog);

      await waitFor(() => {
        const aceptarButton = screen.getByText('Aceptar');
        expect(aceptarButton).toBeEnabled();
      });

      const aceptarButton = screen.getByText('Aceptar');
      await user.click(aceptarButton);

      // Check that default data was saved
      const savedData = JSON.parse(localStorage.getItem('data'));
      expect(savedData).toEqual({
        height: 170,
        weight: 60,
        sex: 1, // male
        age: new Date().getFullYear() - 1999,
        bp_mode: 'ternary',
        bp_group: 'normal',
        facing_mode: 'user'
      });

      expect(mockPush).toHaveBeenCalledWith('/scan', {});
    });

    test('should handle all hypertension options correctly', async () => {
      const user = userEvent.setup();
      renderBasicInfo();

      // Test hypertension option
      const hypertensionBP = screen.getByLabelText(/Hypertension.*>= 140 mmHg/);
      await user.click(hypertensionBP);

      const comenzarButton = screen.getByText('Comenzar');
      await user.click(comenzarButton);

      await waitFor(() => {
        expect(screen.getByText('Calibración')).toBeInTheDocument();
      });

      // Mock scroll and accept
      const dialog = screen.getByTestId('consent-modal');
      Object.defineProperty(dialog, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(dialog, 'clientHeight', { value: 400, writable: true });
      Object.defineProperty(dialog, 'scrollHeight', { value: 500, writable: true });
      fireEvent.scroll(dialog);

      await waitFor(() => {
        const aceptarButton = screen.getByText('Aceptar');
        expect(aceptarButton).toBeEnabled();
      });

      const aceptarButton = screen.getByText('Aceptar');
      await user.click(aceptarButton);

      const savedData = JSON.parse(localStorage.getItem('data'));
      expect(savedData.bp_group).toBe('hypertension');
    });
  });
});
