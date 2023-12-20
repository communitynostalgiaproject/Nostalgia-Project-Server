jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis()
  }));
});