import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoireView from '../src/components/HistoireView.jsx';

describe('App Test Suite', () => {
  it('should run a basic test successfully', () => {
    expect(true).toBe(true);
  });

  it('shows the Histoire dictionary tab and core Akméda term', () => {
    render(<HistoireView />);

    const dicButton = screen.getByRole('button', { name: /Dictionnaire/i });
    fireEvent.click(dicButton);

    expect(screen.getByText(/Akméda/i)).toBeTruthy();
    expect(screen.getByText(/Le héros\. Ce nom désigne un héros\./i)).toBeTruthy();
  });
});

