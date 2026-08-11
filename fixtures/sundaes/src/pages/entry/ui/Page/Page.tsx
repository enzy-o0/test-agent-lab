import { Options } from '@/widgets/Options/ui/Options/Options';
import { useOrderDetails } from '@/app/OrderDetailsProvider';
import { formatCurrency } from '@/shared/lib/formatCurrency';
// import OrderSusmmary from '@/summary/OrderSummary';
// import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import type { OrderPhaseComponentPropType } from '@/shared/type/orderPhaseType';

export const OrderEntryPage = ({ setOrderPhase }: OrderPhaseComponentPropType) => {
    const { totals } = useOrderDetails();

    // const navigate = useNavigate();

    function handleClick() {
        // navigate('/summary');
        setOrderPhase('review');
    }

    const orderDisabled = totals.scoops === 0;

    return (
        <div>
            <h1>Design Your Sundae!</h1>
            <Options optionType="scoops" />
            <Options optionType="toppings" />
            <h2>Grand total: {formatCurrency(totals.scoops + totals.toppings)}</h2>
            <Button disabled={orderDisabled} onClick={handleClick}>
                주문하기
            </Button>
        </div>
    );
};
