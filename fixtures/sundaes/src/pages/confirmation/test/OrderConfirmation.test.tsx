import { HttpResponse, http } from 'msw';
import { server } from '@/app/apiMockServer';
import { render, screen } from '@/shared/lib';
import { OrderConfirmationPage } from '@/pages/confirmation';

const URL = import.meta.env.API_URL;

test('error response from server for submitting order', async () => {
    server.resetHandlers(
        http.post(`${URL}/order`, () => {
            return new HttpResponse(null, { status: 500 });
        }),
    );

    render(<OrderConfirmationPage setOrderPhase={vitest.fn} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('예상되지 않은 오류가 있습니다. 잠시 후에 다시 시도해주세요');
});
