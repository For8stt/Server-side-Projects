import React from 'react';
import { useNavigate } from 'react-router-dom';

import CreateDeleteUser from "./CreateDeleteUser";
import RegisterComponent from "./regis";
import Advertising from "./Advertising";

const AdminPanel = ({ setMessage }) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    };
    return (
        <div>
            <h2>Administrative panel</h2>

            <button onClick={goBack}>Go Back</button>

            <CreateDeleteUser/>
            <RegisterComponent setMessage={setMessage}/>
            <Advertising/>
        </div>
    );
};

export default AdminPanel;
