import userEvent from '@testing-library/user-event';
import { render, screen } from '@/shared/lib';
import ScoopOption from '@/widgets/Options/ui/ScoopOptions/ScoopOptions';

test('indicate if scoop count is non-int or out of range', async () => {
    const user = userEvent.setup();
    render(<ScoopOption name="Vanilla" imagePath="vanilla" />);

    const vanillaInput = screen.getByRole('spinbutton', {
        name: 'Vanilla',
    });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '-1');

    await screen.debug();
    expect(vanillaInput).toHaveClass('is-invalid', {
        exact: false,
    });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '2.5');

    expect(vanillaInput).toHaveClass('is-invalid', {
        exact: false,
    });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '11');

    expect(vanillaInput).toHaveClass('is-invalid', {
        exact: false,
    });

    await user.clear(vanillaInput);
    await user.type(vanillaInput, '3');

    expect(vanillaInput).not.toHaveClass('is-invalid', {
        exact: false,
    });
});
