// components/layout/Footer.test.tsx

import { render } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    // Render the Footer component
    const { container } = render(<Footer />);
    // Check if the footer rendered (basic smoke test)
    expect(container).toBeInTheDocument();
  });
});