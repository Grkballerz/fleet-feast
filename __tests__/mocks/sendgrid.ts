/**
 * SendGrid Mock Helper
 * Provides mock implementation of SendGrid mail service for testing
 */

export const mockSendEmail = jest.fn().mockResolvedValue([
  {
    statusCode: 202,
    body: "",
    headers: {},
  },
]);

export const mockSetApiKey = jest.fn();

const mockSendGrid = {
  setApiKey: mockSetApiKey,
  send: mockSendEmail,
};

// Mock the SendGrid module
jest.mock("@sendgrid/mail", () => mockSendGrid);

// Reset mocks before each test
beforeEach(() => {
  mockSendEmail.mockClear();
  mockSetApiKey.mockClear();
});

export default mockSendGrid;
