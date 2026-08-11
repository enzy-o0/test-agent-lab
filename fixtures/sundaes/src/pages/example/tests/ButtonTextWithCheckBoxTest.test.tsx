import { render, screen, fireEvent } from '@testing-library/react';
import { kebabCaseToTitleCase } from '../helpers';
import ButtonTextWithCheckBoxTest from '../ButtonTextWithCheckBoxTest';

test('button click flow', () => {
    render(<ButtonTextWithCheckBoxTest />);
    // name은 버튼 텍스트
    const buttonElement = screen.getByRole('button', { name: /blue/i });
    expect(buttonElement).toHaveClass('medium-violet-red');

    fireEvent.click(buttonElement);

    expect(buttonElement).toHaveTextContent(/red/i);
    expect(buttonElement).toHaveClass('midnight-blue');
});

test('checkbox flow', () => {
    render(<ButtonTextWithCheckBoxTest />);

    const buttonElement = screen.getByRole('button', { name: /blue/i });
    const checkBoxElement = screen.getByRole('checkbox', {
        name: /disable button/i,
    });

    expect(buttonElement).toBeEnabled();
    expect(checkBoxElement).not.toBeChecked();

    fireEvent.click(checkBoxElement);
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('gray');

    fireEvent.click(checkBoxElement);
    expect(buttonElement).toBeEnabled();
    // expect(buttonElement).toHaveClass("red");
    expect(buttonElement).toHaveClass('medium-violet-red');
});

test('checkbox flow after button click', () => {
    render(<ButtonTextWithCheckBoxTest />);

    const buttonElement = screen.getByRole('button', { name: /blue/i });
    const checkBoxElement = screen.getByRole('checkbox', {
        name: /disable button/i,
    });

    fireEvent.click(buttonElement);

    fireEvent.click(checkBoxElement);
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('gray');

    fireEvent.click(checkBoxElement);
    expect(buttonElement).toBeEnabled();
    // expect(buttonElement).toHaveClass('blue');
    expect(buttonElement).toHaveClass('midnight-blue');
});

describe('kebabCaseToTitleCase', () => {
    test('works for no hyphens', () => {
        expect(kebabCaseToTitleCase('red')).toBe('Red');
    });
    test('works for one hyphens', () => {
        expect(kebabCaseToTitleCase('midnight-blue')).toBe('Midnight Blue');
    });
    test('works for multiple hyphens', () => {
        expect(kebabCaseToTitleCase('medium-violet-red')).toBe('Medium Violet Red');
    });
});
