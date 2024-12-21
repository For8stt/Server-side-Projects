//Yulian Kisil id:128371
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import AdminPanel from './functionality/AdminPanel';
import RegisSign from './functionality/RegisAndSign';
import UserInterface from "./functionality/UserInterface";
import PageForMeasur from "./functionality/PageForMeasur";
import PageForMethods from "./functionality/PageForMethods";
import PageForChart from "./functionality/PageForChart";




function App() {
    const [message, setMessage] = useState('');
    const [showRegister, setShowRegister] = useState('register');
    const [id, setId] = useState(undefined);
    const [methods, setMethods] = useState([]);
    const [admin, setAdmin] = useState(false);


    useEffect(() => {
        fetch('http://localhost:8080/hello')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request error: ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                setMessage(data.message);
            })
            .catch((error) => {
                console.error('Data retrieval error:', error);
            });
    }, []);



    return (
        <Router>
            <div className="App">
                <div className='Header' style={{backgroundColor: '#90ee90', color: 'blue'}}>
                    <h2>ID is: {id}</h2>
                    <p>Messages from the server: {message}</p>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/regissign">Registration or Login</Link>
                            </li>
                            {id !== undefined && !admin && (
                                <li>
                                    <Link to="/userInterface">User Interface</Link>
                                </li>
                            )}
                            {id !== undefined && admin && (
                                <li>
                                    <Link to="/admin">Go to Admin Panel</Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>


                <Routes>
                    <Route
                        path="/regissign"
                        element={<RegisSign {...{setMessage, setShowRegister, showRegister, setId, setAdmin}} />}
                    />
                    {id !== undefined && !admin && (
                        <Route
                            path="/userInterface"
                            element={<UserInterface />}
                        />
                    )}
                    {id !== undefined && admin && (
                        <Route path="/admin" element={<AdminPanel setMessage={setMessage}/>}/>
                    )}
                    <Route
                        path="/userInterface/PageForMeasur"
                        element={<PageForMeasur {...{id}} />}
                    />
                    <Route
                        path="/userInterface/PageForMethods"
                        element={<PageForMethods {...{methods,setMethods}} />}
                    />
                    <Route
                        path="/userInterface/PageForChart"
                        element={<PageForChart {...{id, methods}} />}
                    />
                </Routes>

            </div>
        </Router>
    );
}

export default App;
