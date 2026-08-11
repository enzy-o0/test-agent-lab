import React from 'react';
import type { ReactNode } from 'react';
import { pricePerItem } from '@/shared/consts';

export type OptionType = 'scoops' | 'toppings';
type StrictPropsWithChildren<P = unknown> = P & {
    children: ReactNode;
};

type OptionCountsType = {
    scoops: {
        [key: string]: number;
    };
    toppings: {
        [key: string]: number;
    };
};

type OptionTotalsType = {
    scoops: number;
    toppings: number;
};

interface OrderDetailsContextType {
    optionCounts: OptionCountsType;
    totals: OptionTotalsType;
    updateItemCount: (itemName: string, newItemCount: number, optionType: OptionType) => void;
    resetOrder: () => void;
}

const OrderDetailsContext = React.createContext<OrderDetailsContextType | null>(null);

export function useOrderDetails() {
    const contextValue = React.useContext(OrderDetailsContext);

    if (!contextValue) {
        throw new Error('useOrderDetails must be called from within as OrderDetailsProvider');
    }

    return contextValue;
}

// create custom hook to check whether we're in a provider

export function OrderDetailsProvider(props: StrictPropsWithChildren) {
    const [optionCounts, setOptionCounts] = React.useState<OptionCountsType>({
        scoops: {}, // { Chocolate: 1, Vanilla: 2}}
        toppings: {},
    });

    // React에서 지양하는 상태 변이가(mutation) 일어나지 않도록 함
    function updateItemCount(itemName: string, newItemCount: number, optionType: OptionType) {
        // make a copy of existing state
        const newOptionCounts = { ...optionCounts };

        // update the copy with the new infomation
        newOptionCounts[optionType][itemName] = newItemCount;

        // update the state with th updated copy
        setOptionCounts(newOptionCounts);
    }

    function resetOrder() {
        setOptionCounts({ scoops: {}, toppings: {} });
    }

    function calculatedTotal(optionType: OptionType) {
        const countArray = Object.values(optionCounts[optionType]);

        const totalCount = countArray.reduce((total, value) => total + value, 0);

        return totalCount * pricePerItem[optionType];
    }

    const totals = {
        scoops: calculatedTotal('scoops'),
        toppings: calculatedTotal('toppings'),
    };

    const value = { optionCounts, totals, updateItemCount, resetOrder };

    return <OrderDetailsContext.Provider value={value} {...props} />;
}
