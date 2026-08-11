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

// 훅과 Provider 를 한 파일에 두는 건 원본 픽스처의 구조 선택이다. 파일을 쪼개면
// 픽스처가 원본과 달라지므로, HMR DX 경고인 이 룰만 여기서 끈다.
// eslint-disable-next-line react-refresh/only-export-components
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
