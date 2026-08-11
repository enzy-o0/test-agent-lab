import { fireEvent, render, screen } from '@testing-library/react';
import ButtonTest from '../ButtonTest';

test('App contains correct heading', () => {
    render(<ButtonTest />);
    const headingElement = screen.getByText(/learn React/i);
    expect(headingElement).toBeInTheDocument();
});

test('button starts with correct label and color', () => {
    // const { container } = render(<App />);
    // logRoles(container);
    render(<ButtonTest />);
    // name은 버튼 텍스트
    const buttonElement = screen.getByRole('button', { name: /blue/i });
    expect(buttonElement).toHaveClass('red');
});

test('button has correct label and color after click', () => {
    render(<ButtonTest />);
    // name은 버튼 텍스트
    const buttonElement = screen.getByRole('button', { name: /blue/i });
    expect(buttonElement).toHaveClass('red');

    fireEvent.click(buttonElement);

    expect(buttonElement).toHaveTextContent(/red/i);
    expect(buttonElement).toHaveClass('blue');
    // expect(buttonElement).toHaveStyle({ "background-color": "blue" });
});