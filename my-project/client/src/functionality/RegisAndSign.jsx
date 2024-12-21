import React from 'react';
import { useNavigate } from 'react-router-dom';

import RegisterComponent from './regis';
import SwitcherRS from "./switcherRS";
import Sign from './sign'

const RegisSign = ({ setMessage ,setShowRegister,showRegister,setId , setAdmin }) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    };
    return (
        <div>
            <h2>Registration or login  panel</h2>

            <button onClick={goBack}>Go Back</button>

            <SwitcherRS {...{setShowRegister,showRegister}} />
            {showRegister === 'register' && <RegisterComponent setMessage={setMessage} />}
            {showRegister === 'sign' && <Sign {...{ setMessage, setId , setAdmin}}/>}
        </div>
    );
};

export default RegisSign;
