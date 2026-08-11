import { render, screen } from '@/shared/lib';
import { OrderEntryPage } from '@/pages/entry';

import { http, HttpResponse } from 'msw';
import { server } from '@/app/apiMockServer';
import userEvent from '@testing-library/user-event';

const URL = import.meta.env.API_URL;

test('handles error for scoops and toppings routes', async () => {
    server.resetHandlers(
        http.get(`${URL}/scoops`, () => {
            return new HttpResponse(null, {
                status: 500,
            });
        }),
        http.get(`${URL}/toppings`, () => {
            return new HttpResponse(null, {
                status: 500,
            });
        }),
    );

    // const { container } = render(<OrderEntry />);
    render(<OrderEntryPage setOrderPhase={vi.fn()} />);

    const alerts = await screen.findAllByRole('alert', {
        // name: '예상되지 않은 에러가 있습니다. 추후에 다시 시도해주세요.',
    });

    // const alerts = await screen.findAllByText('예상되지 않은 에러가 있습니다. 추후에 다시 시도해주세요.');

    // logRoles(container);

    expect(alerts).toHaveLength(2);
});

test('disable order button if there are no scoops ordered', async () => {
    const user = userEvent.setup();
    render(<OrderEntryPage setOrderPhase={vi.fn()} />);

    const orderButton = screen.getByRole('button', {
        name: /주문하기/,
    });

    expect(orderButton).toBeDisabled();

    const vanillaInput = await screen.findByRole('spinbutton', {
        name: 'Vanilla',
    });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '1');

    expect(orderButton).toBeEnabled();

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '0');

    expect(orderButton).toBeDisabled();
});
