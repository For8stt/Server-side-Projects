import React from 'react';
import { useNavigate } from 'react-router-dom';
import Advertisement from "./Advertisement";


const UserInterface = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    };

    return (

        <div>
            <h2>User panel</h2>

            <button onClick={goBack}>Go Back</button>
            <div>
                <p>Go to the measurement page:</p>
                <button onClick={() => navigate('/userInterface/PageForMeasur')}>Measurement</button>
                <p>Go to the page with methods:</p>
                <button onClick={() => navigate('/userInterface/PageForMethods')}>Methods</button>
                <p>Go to the page with the chart:</p>
                <button onClick={() => navigate('/userInterface/PageForChart')}>Chart</button>
            </div>
            <Advertisement/>
        </div>
    );
};

export default UserInterface;
