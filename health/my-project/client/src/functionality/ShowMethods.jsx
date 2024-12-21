import React, { useEffect } from 'react';

const ShowMethods = ({methods,setMethods}) => {
    useEffect(() => {
        const fetchMethods = () => {
            fetch('http://localhost:8080/getMethods')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error getting methods');
                    }
                    return response.json();
                })
                .then((data) => {
                    setMethods(data);
                })
                .catch((error) => {
                    console.error(error.message);
                });
        };
        fetchMethods();
    }, []);





    return (
        <div>
            <h2>Methods</h2>
            <table border="1" style={{width: '100%', marginTop: '20px'}}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Method</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {methods.length === 0 ? (
                    <tr>
                        <td colSpan="2">Methods not found.</td>
                    </tr>
                ) : (
                    methods.map((method) => (
                        <tr key={method.id}>
                            <td>{method.id}</td>
                            <td>{method.name}</td>
                            <td>{method.description}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            {/*<button onClick={fetchMethods}>Update data</button>*/}
        </div>
    );
};

export default ShowMethods;
