import { OptionResponseType } from '../Options/Options';
import { Col, Form } from 'react-bootstrap';
import { useOrderDetails } from '@/app/OrderDetailsProvider';

const URL = import.meta.env.API_URL;

const ToppingOption = ({ name, imagePath }: OptionResponseType) => {
    const { updateItemCount } = useOrderDetails();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateItemCount(name, e.target.checked ? 1 : 0, 'toppings');
    };
    return (
        <Col xs={12} sm={6} md={4} lg={3} style={{ textAlign: 'center' }}>
            <img style={{ width: '75%' }} src={`${URL}/${imagePath}`} alt={`${name} topping`} />
            <Form.Group controlId={`${name}-topping-checkbox`}>
                <Form.Check // prettier-ignore
                    type={'checkbox'}
                    label={name}
                    onChange={handleChange}
                />
            </Form.Group>
        </Col>
    );
};

export default ToppingOption;
