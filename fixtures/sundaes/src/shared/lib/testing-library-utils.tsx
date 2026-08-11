import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { OrderDetailsProvider } from '@/app/OrderDetailsProvider';

export const renderWithContext = (ui: React.ReactElement, options?: RenderOptions) =>
    render(ui, { wrapper: OrderDetailsProvider, ...options });


