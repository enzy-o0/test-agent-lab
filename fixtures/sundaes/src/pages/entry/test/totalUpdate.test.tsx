import { render, screen } from '@/shared/lib';
import { Options } from '@/widgets/Options/ui/Options/Options';
import userEvent from '@testing-library/user-event';
import { OrderEntryPage } from '@/pages/entry';

test('update scoop subtotal when scoops chagned', async () => {
    const user = userEvent.setup();

    render(<Options optionType="scoops" />);

    // make sure total starts out at $0.00
    const scoopsSubtotal = screen.getByText('Scoops total: $', {
        exact: false,
    });

    expect(scoopsSubtotal).toHaveTextContent('0.00');

    // update vanilla scoops to 1 and check subtotal
    const vanillaInput = await screen.findByRole('spinbutton', { name: 'Vanilla' });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '1');
    expect(scoopsSubtotal).toHaveTextContent('2.00');

    // update chocolate scoops to 2 and check subtotal

    const chocolateInput = await screen.findByRole('spinbutton', { name: 'Chocolate' });

    await user.clear(chocolateInput);
    await user.type(chocolateInput, '2');
    expect(scoopsSubtotal).toHaveTextContent('6.00');
});

test('update topping subtotal when toppings chagned', async () => {
    const user = userEvent.setup();

    render(<Options optionType="toppings" />);

    // make sure total starts out at $0.00
    const toppingsSubtotal = screen.getByText('Toppings total: $', {
        exact: false,
    });

    expect(toppingsSubtotal).toHaveTextContent('0.00');

    const chrriesInput = await screen.findByRole('checkbox', { name: 'Cherries' });

    await user.click(chrriesInput);
    expect(toppingsSubtotal).toHaveTextContent('1.50');

    const mandmsInput = await screen.findByRole('checkbox', { name: 'M&Ms' });

    await user.click(mandmsInput);
    expect(toppingsSubtotal).toHaveTextContent('3.00');

    await user.click(mandmsInput);
    expect(toppingsSubtotal).toHaveTextContent('1.50');
});

describe('grand total', () => {
    test('grand total starts at $0.00', () => {
        const { unmount } = render(<OrderEntryPage setOrderPhase={vi.fn()}/>);

        // const grandTotal = screen.getByText('Grand total: $', {
        //     exact: false,
        // });

        const grandTotal = screen.getByRole('heading', {
            name: /Grand total: \$/,
        });

        expect(grandTotal).toHaveTextContent('0.00');

        unmount();
    });

    test('grand total updates properly if scoop is added first', async () => {
        const user = userEvent.setup();

        render(<OrderEntryPage setOrderPhase={vi.fn()}/>);

        // const grandTotal = screen.getByText('Grand total: $', {
        //     exact: false,
        // });

        const grandTotal = screen.getByText('Grand total: $', {
            exact: false,
        });

        const vanillaInput = await screen.findByRole('spinbutton', { name: 'Vanilla' });

        await user.clear(vanillaInput);
        await user.type(vanillaInput, '2');

        expect(grandTotal).toHaveTextContent('4.00');

        const chrriesInput = await screen.findByRole('checkbox', { name: 'Cherries' });

        await user.click(chrriesInput);

        expect(grandTotal).toHaveTextContent('5.50');
    });
    test('grand total updates properly if toppings is added first', async () => {
        const user = userEvent.setup();

        render(<OrderEntryPage setOrderPhase={vi.fn()}/>);

        const chrriesInput = await screen.findByRole('checkbox', { name: 'Cherries' });
        await user.click(chrriesInput);

        const grandTotal = screen.getByText('Grand total: $', {
            exact: false,
        });

        expect(grandTotal).toHaveTextContent('1.50');

        const vanillaInput = await screen.findByRole('spinbutton', { name: 'Vanilla' });

        await user.clear(vanillaInput);
        await user.type(vanillaInput, '2');

        expect(grandTotal).toHaveTextContent('5.50');
    });
    test('grand total updates properly if item is removed', async () => {
        const user = userEvent.setup();
        render(<OrderEntryPage setOrderPhase={vi.fn()} />);

        const cherriesCheckbox = await screen.findByRole('checkbox', {
            name: 'Cherries',
        });

        await user.click(cherriesCheckbox);

        const vanillaInput = await screen.findByRole('spinbutton', {
            name: 'Vanilla',
        });

        await user.clear(vanillaInput);
        await user.type(vanillaInput, '2');

        await user.clear(vanillaInput);
        await user.type(vanillaInput, '1');

        const grandTotal = screen.getByRole('heading', { name: /Grand total: \$/ });
        expect(grandTotal).toHaveTextContent('3.50');

        await user.click(cherriesCheckbox);
        expect(grandTotal).toHaveTextContent('2.00');
    });
});
