import { render, screen } from '@testing-library/react';
import SummaryForm from '../ui/SummaryForm/SummaryForm';
import userEvent from '@testing-library/user-event';

test('Initial conditions', () => {
    render(<SummaryForm  setOrderPhase={vi.fn()}/>);

    const buttonElement = screen.getByRole('button', { name: /주문 확인하기/ });
    const checkboxElement = screen.getByRole('checkbox');

    expect(checkboxElement).not.toBeChecked();
    expect(buttonElement).toBeDisabled();
});

test('Checbox disables button on first click and enables on second click', async () => {
    const user = userEvent.setup();

    render(<SummaryForm setOrderPhase={vi.fn()}/>);

    const buttonElement = screen.getByRole('button', { name: /주문 확인하기/ });
    const checkboxElement = screen.getByRole('checkbox');

    await user.click(checkboxElement);
    expect(buttonElement).toBeEnabled();

    await user.click(checkboxElement);
    expect(buttonElement).toBeDisabled();
});

test("popover responds to hover", async () => {
    const user = userEvent.setup();
    render(<SummaryForm setOrderPhase={vi.fn()}/>);

    const nullPopover = screen.queryByText(/아이스크림이 실제로 배달되지 않습니다/);
    // popover starts out hidden
    // expect(nullPopover).toBeNull();
    // lint가 추천함... 나는 왜 안뜨지?
    expect(nullPopover).not.toBeInTheDocument();

    // popover appears on mouseover of checkbox label
    const termsAndConditions = screen.getByText(/동의가 필요합니다/);
    await user.hover(termsAndConditions);

    const popover = screen.getByText(/아이스크림이 실제로 배달되지 않습니다/);
    expect(popover).toBeInTheDocument();

    // popover disappears when we mouse out
    await user.unhover(termsAndConditions);
    expect(nullPopover).not.toBeInTheDocument();

})