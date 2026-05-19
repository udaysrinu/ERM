// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { TrendChart } from '../src/components/TrendChart';

// Recharts uses ResponsiveContainer which relies on layout measurement.
// Stub ResizeObserver in jsdom so charts render with a measurable parent.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver;

describe('<TrendChart>', () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });
  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
  });

  it('renders loading state on initial render', () => {
    fetchSpy.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />);
    expect(screen.getByText(/loading evolution/i)).toBeInTheDocument();
  });

  it('renders empty-state when fewer than 2 sessions returned', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        sessions: [
          {
            id: 'x',
            createdAt: new Date().toISOString(),
            overallScore: 3,
            pillars: [],
          },
        ],
      }),
    } as any);
    render(<TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />);
    await waitFor(() => {
      expect(screen.getByText(/at least 2 historical sessions/i)).toBeInTheDocument();
    });
  });

  it('renders chart when 3+ sessions returned', async () => {
    const sessions = Array.from({ length: 3 }, (_, i) => ({
      id: `s${i}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      overallScore: 3 + i * 0.2,
      pillars: [{ pillarId: 'gov', pillarName: 'Governance', score: 3 + i * 0.1 }],
    }));
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ sessions }),
    } as any);
    const { container } = render(
      <TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />,
    );
    await waitFor(() => {
      // Recharts ResponsiveContainer must be present (proves we're in chart-rendering branch).
      expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
      // And the empty-state copy must NOT be in the DOM.
      expect(screen.queryByText(/at least 2 historical sessions/i)).toBeNull();
    });
  });

  it('refetches when entityId changes', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({ sessions: [] }) } as any);
    const { rerender } = render(
      <TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />,
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    rerender(<TrendChart entityId="dis" operatorEmail="t@gmail.com" benchmarkType="target" />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it('refetches when benchmarkType changes', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({ sessions: [] }) } as any);
    const { rerender } = render(
      <TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />,
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    rerender(<TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="industry" />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it('handles fetch error gracefully (no crash)', async () => {
    fetchSpy.mockRejectedValue(new Error('network down'));
    expect(() => {
      render(<TrendChart entityId="gen" operatorEmail="t@gmail.com" benchmarkType="target" />);
    }).not.toThrow();
    await waitFor(() => {
      expect(screen.getByText(/unable to load trend/i)).toBeInTheDocument();
    });
  });
});
