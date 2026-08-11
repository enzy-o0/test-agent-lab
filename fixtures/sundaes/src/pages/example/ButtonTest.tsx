import React from 'react';

const ButtonTest = () => {
    const [buttonColor, setButtonColor] = React.useState('red');
    const nextColorClass = buttonColor === 'red' ? 'blue' : 'red';

    function onClickButton() {
        setButtonColor(nextColorClass);
    }

    return (
        <div>
            <h1>I'm gonna learn React Testing Library</h1>
            <button className={buttonColor} onClick={onClickButton}>Change to {nextColorClass}</button>
        </div>
    );
};

export default ButtonTest;
