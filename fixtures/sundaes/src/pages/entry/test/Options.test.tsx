import userEvent from '@testing-library/user-event';
import { render, screen } from '@/shared/lib';

import { Options } from '@/widgets/Options/ui/Options/Options';

test('displays image for each scoop option from server', async () => {
    render(<Options optionType={'scoops'} />);

    // 이미지 찾기
    const scoopImages = (await screen.findAllByRole('img', { name: /scoop$/i })) as [HTMLInputElement];
    expect(scoopImages).toHaveLength(2);

    // 이미지 alt text 찾기
    const altText = scoopImages.map((element) => element.alt);
    expect(altText).toEqual(['Chocolate scoop', 'Vanilla scoop']);
});

test('displays image for each topping option from server', async () => {
    render(<Options optionType={'toppings'} />);

    // 이미지 찾기
    const toppingsImages = (await screen.findAllByRole('img', { name: /topping$/i })) as [HTMLInputElement];
    expect(toppingsImages).toHaveLength(3);

    // 이미지 alt text 찾기
    const altText = toppingsImages.map((element) => element.alt);
    expect(altText).toEqual(['Cherries topping', 'M&Ms topping', 'Hot fudge topping']);
});

test("don't update total if scoops input is invalid", async () => {
    const user = userEvent.setup();
    render(<Options optionType="scoops" />);

    const vanillaInput = await screen.findByRole('spinbutton', {
        name: 'Vanilla',
    });

    const scoopsSubtotal = screen.getByText('Scoops total: $0.00');

    await user.clear(vanillaInput);

    await user.type(vanillaInput, '2.5');

    expect(scoopsSubtotal).toHaveTextContent('$0.00');

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '100');
    expect(scoopsSubtotal).toHaveTextContent('$0.00');

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '-1');
    expect(scoopsSubtotal).toHaveTextContent('$0.00');
});
