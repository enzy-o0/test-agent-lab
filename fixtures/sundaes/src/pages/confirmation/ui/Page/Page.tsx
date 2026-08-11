import axios from 'axios';
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import Container from 'react-bootstrap/esm/Container';
// import { useNavigate } from 'react-router-dom';
import { useOrderDetails } from '@/app/OrderDetailsProvider';
import { AlertBanner } from '@/shared/ui/Alert/AlertBanner';
import type { OrderPhaseComponentPropType } from '@/shared/type/orderPhaseType';

const URL = import.meta.env.API_URL;

export const OrderConfirmationPage = ({ setOrderPhase }: OrderPhaseComponentPropType) => {
    const [orderNumber, setOrderNumber] = React.useState(null);
    const [error, setError] = React.useState(false);
    // const navigate = useNavigate();
    const { resetOrder } = useOrderDetails();

    function handleClick() {
        resetOrder();
        // navigate('/', { replace: true });
        setOrderPhase('inProgress');
    }

    React.useEffect(() => {
        axios
            .post(`${URL}/order`)
            .then((response) => {
                console.log(response.data);
                setOrderNumber(response.data.orderNumber);
            })
            .catch(() => {
                setError(true);
            });
    }, []);

    const newOrderButton = <Button onClick={handleClick}>새로운 주문하기</Button>;

    if (error) {
        return (
            <>
                <AlertBanner message={null} variant={null} />
                {newOrderButton}
            </>
        );
    }

    if (orderNumber) {
        return (
            <Container style={{ textAlign: 'center' }}>
                <h1>Thank You!</h1>
                <p>주문 번호는 {orderNumber} 입니다.</p>
                <p>약관 동의는 아무일도 일어나지 않습니다.</p>
                {newOrderButton}
            </Container>
        );
    } else {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        );
    }
};
