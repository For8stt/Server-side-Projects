import React from "react";

import AddRemoveMethod from "./AddRemoveMethod";
import ShowMethods from "./ShowMethods";
import {useNavigate} from "react-router-dom";


const PageForMethods=({methods,setMethods})=>{
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            <h2>Page for methods</h2>
            <button onClick={goBack}>Go Back</button>
            <AddRemoveMethod {...{setMethods}} />
            <ShowMethods {...{methods, setMethods}} />
        </>
    );
}

export default PageForMethods;