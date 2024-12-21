import React from "react";

function SwitcerRScomponent({setShowRegister,showRegister}){
    return (
        <div>
            <label>
                <input
                    type="radio"
                    value="on"
                    checked={showRegister==='register'}
                    onChange={() => setShowRegister('register')}
                />
                registration
            </label>
            <label>
                <input
                    type="radio"
                    value="off"
                    checked={showRegister==='sign'}
                    onChange={() => setShowRegister('sign')}
                />
                sign-in
            </label>
        </div>
    );
}

export default SwitcerRScomponent;
