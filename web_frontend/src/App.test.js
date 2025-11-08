import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  const dashboard = screen.getByText(/Dashboard/i);
  const reports = screen.getByText(/Reports/i);
  const history = screen.getByText(/History/i);
  expect(dashboard).toBeInTheDocument();
  expect(reports).toBeInTheDocument();
  expect(history).toBeInTheDocument();
});
