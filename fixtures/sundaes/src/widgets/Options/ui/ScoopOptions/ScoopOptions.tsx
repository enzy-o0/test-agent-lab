import { OptionResponseType } from '../Options/Options';
import Col from 'react-bootstrap/Col';
import { useOrderDetails } from '@/app/OrderDetailsProvider';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/Row';
import React from 'react';

const URL = import.meta.env.API_URL;

const ScoopOption = ({ name, imagePath }: OptionResponseType) => {
    const { updateItemCount } = useOrderDetails();
    const [isValid, setIsValid] = React.useState(true);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = e.target.value;

        const currentValueFoat = parseFloat(currentValue);
        // const currentValueInteger = parseInt(currentValue);
        // Number.isInteger(currentValueInteger);

        const valueIsValid =
            0 <= currentValueFoat && currentValueFoat <= 10 && Math.floor(currentValueFoat) === currentValueFoat;

        setIsValid(valueIsValid);

        const newValue = valueIsValid ? parseInt(currentValue) : 0;

        updateItemCount(name, newValue, 'scoops');
        // const isPositiveInteger = Number.isInteger(e.target.value) && parseInt(e.target.value) >= 0;
        // if (!isPositiveInteger) {
        //     setIsInvalid(false);
        //     updateItemCount(name, 0, 'scoops');
        //     return;
        // }

        // updateItemCount(name, parseInt(e.target.value), 'scoops');
    };

    return (
        <Col xs={12} sm={6} md={4} lg={3} style={{ textAlign: 'center' }}>
            <img style={{ width: '75%' }} src={`${URL}/${imagePath}`} alt={`${name} scoop`} />
            <Form.Group controlId={`${name}-count`} as={Row} style={{ marginTop: '10px' }}>
                <Form.Label column xs="6" style={{ textAlign: 'right' }}>
                    {name}
                </Form.Label>
                <Col xs="5" style={{ textAlign: 'left' }}>
                    <Form.Control
                        max={10}
                        isInvalid={!isValid}
                        type="number"
                        defaultValue={0}
                        onChange={handleChange}
                    ></Form.Control>
                </Col>
            </Form.Group>
        </Col>
    );
};

export default ScoopOption;
