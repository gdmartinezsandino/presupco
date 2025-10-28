// Mock nodemailer-express-handlebars
jest.mock('nodemailer-express-handlebars', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    compile: jest.fn(),
    render: jest.fn(),
  })),
}));