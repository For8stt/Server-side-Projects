import React, { useState, useEffect } from 'react';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [csvFile, setCsvFile] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers =  () => {
        fetch('http://localhost:8080/users')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setLoading(false);
            });
    }
    const deleteUser=(id)=>{
        fetch(`http://localhost:8080/users/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }
                setMessage(`User with ID ${id} has been deleted`);
                fetchUsers();
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
                setMessage('Failed to delete user');
            });
    }
    const downloadCSV = () => {
        fetch('http://localhost:8080/users/csv')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch CSV');
                }
                return response.blob();
            })
            .then((blob) => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'users.csv');
                link.click();
            })
            .catch((error) => {
                console.error('Error downloading CSV:', error);
            });
    };

    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCsvFile(file);
        }
    };

    const uploadCsv = () => {
        if (!csvFile) {
            setMessage('Please select a CSV file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);

        fetch('http://localhost:8080/upload-csv', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to upload CSV');
                }
                return response.json();
            })
            .then((data) => {
                setMessage(data.message);
                fetchUsers();
            })
            .catch((error) => {
                console.error('Error uploading CSV:', error);
                setMessage('Failed to upload CSV');
            });
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <div>
                <h1>List of users</h1>
                {message && <p>{message}</p>}

                <button onClick={fetchUsers}>Refresh list</button>
                <button onClick={downloadCSV}>Download Users as CSV</button>

                <input type="file" accept=".csv" onChange={handleCsvUpload}/>
                <button onClick={uploadCsv}>Upload CSV</button>

                {users.length === 0 ? (
                    <p>No users found</p>
                ) : (
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                {user.id}): {user.name} ({user.email})
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    style={{marginLeft: '10px', color: 'red'}}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </>
    );
};

export default UsersList;
