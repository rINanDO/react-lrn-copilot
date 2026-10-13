import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routeObjects } from './index';

vi.mock('../component/search/bwb-search-page', () => ({ default: () => <div>search page</div> }));
vi.mock('../component/search/cvdr-search-page', () => ({ default: () => <div>cvdr search page</div> }));
vi.mock('../component/bwb/bwb-expressions', () => ({ default: () => <div>expressions page</div> }));
vi.mock('../component/page/bwb-landing-page', () => ({ default: () => <div>landing page</div> }));
vi.mock('../component/bwb/toestand-view', () => ({ default: () => <div>toestand page</div> }));
vi.mock('../component/cvdr/cvdr-view', () => ({ default: () => <div>cvdr page</div> }));

afterEach(cleanup);

function renderAt(url: string) {
  render(<RouterProvider router={createMemoryRouter(routeObjects, { initialEntries: [url] })} />);
}

describe('router', () => {
  it.each([
    ['/bwb', 'landing page'],
    ['/bwb/zoeken?q=grondwet', 'search page'],
    ['/bwb/BWBR0001840', 'expressions page'],
    ['/bwb/BWBR0001840/2023-02-22_0', 'toestand page'],
    ['/cvdr/zoeken?q=handhaving', 'cvdr search page'],
    ['/cvdr/CVDR744131/2', 'cvdr page'],
  ])('renders %s as the %s', (url, page) => {
    renderAt(url);
    expect(screen.getByText(page)).toBeInTheDocument();
  });
});
