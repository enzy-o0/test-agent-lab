import { OrderPhaseComponentPropType } from '@/shared/type/orderPhaseType';
import React, { type FormEvent } from 'react';
import { Button, Form, OverlayTrigger, Popover } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';

const SummaryForm = ({setOrderPhase}: OrderPhaseComponentPropType) => {
    const [checkboxIsChecked, setCheckboxIsChecked] = React.useState(false);
    // const navigate = useNavigate();

    const popover = (
        <Popover id="popover-basic">
            <Popover.Body>아이스크림이 실제로 배달되지 않습니다. 주의 요망!!</Popover.Body>
        </Popover>
    );

    const checkboxLabel = (
        <OverlayTrigger placement="right" overlay={popover}>
            <span>
                동의가 필요합니다<span style={{ color: 'blue' }}>약관 동의</span>
            </span>
        </OverlayTrigger>
    );

    const checkboxOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckboxIsChecked(e.target.checked);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // navigate('/confirmation');
        setOrderPhase('completed');
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="terms-and-conditions">
                <Form.Check
                    type="checkbox"
                    checked={checkboxIsChecked}
                    onChange={checkboxOnChange}
                    label={checkboxLabel}
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!checkboxIsChecked}>
                주문 확인하기
            </Button>
        </Form>
    );
};

export default SummaryForm;
