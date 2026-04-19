import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hub home content', () => {
  render(<App />);
  expect(screen.getByText(/Campus Operations,/i)).toBeInTheDocument();
});
