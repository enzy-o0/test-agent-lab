import axios from 'axios';
import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import ScoopOption from '../ScoopOptions/ScoopOptions';
import ToppingOption from '../ToppingOptions/ToppingOption';
import { AlertBanner } from '@/shared/ui/Alert/AlertBanner';
import { pricePerItem } from '@/shared/consts';
import { formatCurrency } from '@/shared/lib/formatCurrency';
import { useOrderDetails } from '@/app/OrderDetailsProvider';

type OptionsPropType = {
    optionType: 'scoops' | 'toppings';
};

export type OptionResponseType = {
    name: string;
    imagePath: string;
};

export const Options = ({ optionType }: OptionsPropType) => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState<boolean | string>(false);
    const { totals } = useOrderDetails();

    const URL = import.meta.env.API_URL;

    React.useEffect(() => {
        // create an abortController to attach to network request
        const controller = new AbortController();

        axios
            .get(`${URL}/${optionType}`, {
                signal: controller.signal,
            })
            .then((response) => setItems(response.data))
            .catch(() => {
                setError(true);
            });

        // abort axios call on component unmount
        return () => {
            // controller.abort();
        };
    }, [optionType]);

    if (error) {
        return <AlertBanner variant="danger" />;
    }
    // TODO : null 대신 ToppingOption이 들어갈 예정
    const ItemComponent = optionType === 'scoops' ? ScoopOption : ToppingOption;
    const title = optionType[0].toUpperCase() + optionType.slice(1).toLowerCase();

    const optionItems = items.map((item: OptionResponseType) => (
        <ItemComponent key={item.name} name={item.name} imagePath={item.imagePath} />
    ));

    return (
        <>
            <h2>{title}</h2>
            <p>{formatCurrency(pricePerItem[optionType])} each</p>
            <p>
                {title} total: {formatCurrency(totals[optionType])}
            </p>
            <Row>{optionItems}</Row>
        </>
    );
};
