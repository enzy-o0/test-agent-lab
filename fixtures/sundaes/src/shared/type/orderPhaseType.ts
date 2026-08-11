import type { Dispatch, SetStateAction } from 'react';

export type OrderPhaseType = 'inProgress' | 'review' | 'completed';
export type OrderPhaseComponentPropType = {
    setOrderPhase: Dispatch<SetStateAction<OrderPhaseType>>;
};

