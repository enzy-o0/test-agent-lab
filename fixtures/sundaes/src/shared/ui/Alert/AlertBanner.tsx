import { Alert } from 'react-bootstrap';

type AlertBannerPropType = {
    message?: string | null;
    variant?: 'danger' | 'warning' | null;
};

export const AlertBanner = ({ message, variant }: AlertBannerPropType) => {
    const alertMessage = message || '예상되지 않은 오류가 있습니다. 잠시 후에 다시 시도해주세요';
    const alertVariant = variant || 'danger';

    return (
        <Alert variant={alertVariant} style={{ backgroundColor: 'red' }}>
            {alertMessage}
        </Alert>
    );
};
