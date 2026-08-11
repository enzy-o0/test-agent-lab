import '../App.css';
import { OrderSummaryPage } from '@/pages/summary';
import { OrderDetailsProvider } from './OrderDetailsProvider';
import { OrderConfirmationPage } from '@/pages/confirmation';
import React from 'react';
import { Container } from 'react-bootstrap';
import { OrderEntryPage } from '@/pages/entry';
import { OrderPhaseComponentPropType, OrderPhaseType } from '@/shared/type/orderPhaseType';

function App() {
    const [orderPhase, setOrderPhase] = React.useState<OrderPhaseType>('inProgress');

    // eslint-disable-next-line no-unused-vars
    let Component: ({ setOrderPhase }: OrderPhaseComponentPropType) => JSX.Element = OrderEntryPage;

    switch (orderPhase) {
        case 'inProgress':
            Component = OrderEntryPage;
            break;
        case 'review':
            Component = OrderSummaryPage;
            break;
        case 'completed':
            Component = OrderConfirmationPage;
            break;
        default:
    }
    return (
        <OrderDetailsProvider>
            {/* <OrderEntry />
            <OrderSummary />
            <OrderConfirmation /> */}
            <Container>{<Component setOrderPhase={setOrderPhase} />}</Container>
            {/* <BrowserRouter>
                <Routes>
                    <Route path="/" element={<OrderEntry />} />
                    <Route path="/summary" element={<OrderSummary />} />
                    <Route path="/confirmation" element={<OrderConfirmation setOrderPhase={setOrderPhase} />} />
                </Routes>
            </BrowserRouter> */}
        </OrderDetailsProvider>
    );
}

export default App;
