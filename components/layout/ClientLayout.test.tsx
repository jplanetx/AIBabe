// components/layout/ClientLayout.test.tsx

import { render } from '@testing-library/react';
import ClientLayout from './ClientLayout';

describe('ClientLayout', () => {
  it('renders children without crashing', () => {
    // Render the ClientLayout with a simple child element
    const { getByText } = render(
      <ClientLayout>
        <span>Test Child</span>
      </ClientLayout>
    );
    // Check if the child is present in the document
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});