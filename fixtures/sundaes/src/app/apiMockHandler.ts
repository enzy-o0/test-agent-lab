import { delay, http, HttpResponse } from 'msw';

const URL = import.meta.env.API_URL;

export const handlers = [
    http.get(`${URL}/scoops`, () => {
        // Note that you DON'T have to stringify the JSON!
        return HttpResponse.json([
            { name: 'Chocolate', immagePath: '/images/chocolate.png' },
            { name: 'Vanilla', immagePath: '/images/vanilla.png' },
        ]);
    }),
    http.get(`${URL}/toppings`, () => {
        // Note that you DON'T have to stringify the JSON!
        return HttpResponse.json([
            { name: 'Cherries', immagePath: '/images/cherries.png' },
            { name: 'M&Ms', immagePath: '/images/m-and-ms.png' },
            { name: 'Hot fudge', immagePath: '/images/hot-fudge.png' },
        ]);
    }),
    http.post(`${URL}/order`, async () => {
        await delay(400);
        // Note that you DON'T have to stringify the JSON!
        return HttpResponse.json(
            {
                orderNumber: 123123123,
            },
            {
                status: 201,
            },
        );
    }),
];
