import React from "react";
import { useNavigate } from 'react-router-dom';

import ShowMeasur from "./ShowMeasur";
import InsertDeleteMeasure from "./InsertDeleteMeasur";

const PageForMeasur=({id})=>{
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            <h2>Page for measurement</h2>
            <button onClick={goBack}>Go Back</button>
            <InsertDeleteMeasure {...{id}} />
            <ShowMeasur {...{id}} />
        </>
    );
}

export default PageForMeasur;