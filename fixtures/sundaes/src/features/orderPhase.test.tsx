import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../app';

test('order phases for happy path', async () => {
    const user = userEvent.setup();
    // render app
    const { unmount } = render(<App />);

    // add ice crean scoops and toppings

    const vanillaInput = await screen.findByRole('spinbutton', {
        name: 'Vanilla',
    });
    await user.clear(vanillaInput);
    await user.type(vanillaInput, '1');

    const chocolateInput = await screen.findByRole('spinbutton', {
        name: 'Chocolate',
    });
    await user.clear(chocolateInput);
    await user.type(chocolateInput, '2');

    const cherriesCheckbox = await screen.findByRole('checkbox', {
        name: 'Cherries',
    });
    await user.click(cherriesCheckbox);

    // find and click order button
    const orderSummaryButton = screen.getByRole('button', {
        name: /주문하기/,
    });
    await user.click(orderSummaryButton);

    // check summary information based on order

    const summaryHeading = screen.getByRole('heading', { name: 'Order Summary' });
    expect(summaryHeading).toBeInTheDocument();

    const scoopsHeading = screen.getByRole('heading', {
        name: 'Scoops: $6.00',
    });
    expect(scoopsHeading).toBeInTheDocument();

    const toppingsHeading = screen.getByRole('heading', {
        name: 'Toppings: $1.50',
    });

    expect(toppingsHeading).toBeInTheDocument();

    expect(screen.getByText('1 Vanilla')).toBeInTheDocument();
    expect(screen.getByText('2 Chocolate')).toBeInTheDocument();
    expect(screen.getByText('Cherries')).toBeInTheDocument();

    // const optionItems = screen.getAllByRole('listitem');
    // const optionItemsText = optionItems.map((item) => item.textContent);
    // expect(optionItemsText).toEqual(['1 Vanilla', '2 Chocolate', 'Cherries'])

    // accept terms and conditions and click button to confirm order

    const tcCheckbox = screen.getByRole('checkbox', {
        name: /약관 동의/,
    });
    await user.click(tcCheckbox);

    const confirmOrderButton = screen.getByRole('button', {
        name: /주문 확인하기/,
    });

    await user.click(confirmOrderButton);

    const loading = screen.getByText(/loading/i);
    expect(loading).toBeInTheDocument();

    // confirm order number and confirmation page

    const thankYouHeader = await screen.findByRole('heading', {
        name: /thank you/i,
    });

    expect(thankYouHeader).toBeInTheDocument();

    const notLoading = screen.queryByText(/loading/i);
    expect(notLoading).not.toBeInTheDocument();

    // click "new order" button on confirmation page
    const orderNumber = await screen.findByText(/주문 번호/);
    expect(orderNumber).toBeInTheDocument();

    const orderResetButton = screen.getByRole('button', {
        name: /새로운 주문하기/,
    });
    await user.click(orderResetButton);

    // check that scoops and toppings subtotals have been reset

    const scoopsTotal = await screen.findByText('Scoops total: $0.00');
    expect(scoopsTotal).toBeInTheDocument();

    const toppingsTotal = screen.getByText('Toppings total: $0.00');
    expect(toppingsTotal).toBeInTheDocument();

    unmount();
});

test('Toppings header is not on summary page if no toppings ordered', async () => {
    const user = userEvent.setup();

    render(<App />);

    const vanillaInut = await screen.findByRole('spinbutton', {
        name: 'Vanilla',
    });
    await user.clear(vanillaInut);
    await user.type(vanillaInut, '1');

    const chorolateInut = await screen.findByRole('spinbutton', {
        name: 'Chocolate',
    });

    await user.clear(chorolateInut);
    await user.type(chorolateInut, '2');

    const orderSummaryButton = screen.getByRole('button', {
        name: /주문하기/,
    });

    await user.click(orderSummaryButton);

    const scoopsHeading = screen.getByRole('heading', {
        name: 'Scoops: $6.00',
    });
    expect(scoopsHeading).toBeInTheDocument();

    const toppingsHeading = screen.queryByRole('heading', {
        name: /toppings/i,
    });
    expect(toppingsHeading).not.toBeInTheDocument();
});

test('Toppings header is not on summary page if toppings ordered, then removed', async () => {
    const user = userEvent.setup();

    render(<App />);

    const vanillaIpnut = await screen.findByRole('spinbutton', {
        name: 'Vanilla',
    });
    await user.clear(vanillaIpnut);
    await user.type(vanillaIpnut, '1');

    const cherriesTopping = await screen.findByRole('checkbox', {
        name: 'Cherries',
    });

    await user.click(cherriesTopping);
    expect(cherriesTopping).toBeChecked();
    const toppingsTotal = screen.getByText('Toppings total: $', {
        exact: false,
    });
    expect(toppingsTotal).toHaveTextContent('1.50');

    await user.click(cherriesTopping);
    expect(cherriesTopping).not.toBeChecked();
    expect(toppingsTotal).toHaveTextContent('0.00');

    const orderSummaryButton = screen.getByRole('button', {
        name: /주문하기/,
    });

    await user.click(orderSummaryButton);

    const scoopsHeading = screen.getByRole('heading', {
        name: 'Scoops: $2.00',
    });
    expect(scoopsHeading).toBeInTheDocument();

    const toppingsHeading = screen.queryByRole('heading', {
        name: 'Toppings: $1.50',
    });

    expect(toppingsHeading).not.toBeInTheDocument();
});
