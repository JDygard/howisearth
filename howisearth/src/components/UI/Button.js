import React from 'react';

const Button = props => {
    var id = 1;
    if (props.id) {
        id = props.id;
    }
    const clickMeHandler = (event) => {
        props.clickMe(event);
    }
    return (
        <button onClick={clickMeHandler} id={id}>
            {props.children}
        </button>
    )
}

export default Button;