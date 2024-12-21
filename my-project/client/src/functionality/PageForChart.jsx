import React from "react";
import { useNavigate } from 'react-router-dom';

import UserDataPage from "./UserDataPage";


const PageForChart=({id, methods})=>{
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    };
    return (
        <>
            <h2>Page for graphs</h2>
            <button onClick={goBack}>Go Back</button>
            <UserDataPage {...{id, methods}} />
        </>
    );
}

export default PageForChart;