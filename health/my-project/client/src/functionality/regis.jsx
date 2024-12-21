import React, { useState } from 'react';


const RegistComponent = ({ setMessage }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');

    const handleAddUser = (e) => {
        e.preventDefault();

        const newUser = {
            email,
            name,
            password,
            age,
            height,
        };

        fetch('http://localhost:8080/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || 'Unknown error occurred');
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('User added:', data);
                console.log('User ID:', data.userId);
                setMessage('User successfully added!');
            })
            .catch((error) => {
                console.error('Error adding a user:', error);
                setMessage(error.message);
            });
    };

    return (
        <>
            <h2>Registration</h2>
            <form onSubmit={handleAddUser}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Age:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Height:</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">register</button>
            </form>
        </>
    );
};

export default RegistComponent;