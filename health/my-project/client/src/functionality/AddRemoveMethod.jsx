import React, { useState } from 'react';


const AddMethodForm = ({setMethods}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deleteId, setDeleteId] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();

        const newMethod = {
            name,
            description
        };
        if (name.trim() === '') {
            alert("Fields cannot be empty or contain only spaces.");
            return;
        }

        fetch('http://localhost:8080/addMethod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMethod),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || 'Failed to add method. Please try again.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('Method added:', data);
                alert('Method successfully added!');
                setName('');
                setDescription('');
                if (data.methods) {
                    setMethods(data.methods);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(error.message);
            });
    };
    const handleDelete = (e) => {
        e.preventDefault();
        if (deleteId.trim() === '' ) {
            alert("Fields cannot be empty or contain only spaces.");
            return;
        }

        fetch(`http://localhost:8080/deleteMethod/${deleteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || 'Error deleting Method. Please try again.');
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('Method deleted:', data);
                setMethods(data.methods);
                alert('Method successfully deleted!');
                setDeleteId('');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(error.message);
            });
    };

    return (
        <div>
            <h2>Add New Method</h2>
            <form onSubmit={handleAdd}>
                <div>
                    <label htmlFor="name">Method Name:</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add Method</button>
            </form>
            <hr/>

            <form onSubmit={handleDelete}>
                <h3>Delete Method</h3>
                <div>
                    <label>Method id:</label>
                    <input
                        type="text"
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Delete Method</button>
            </form>
        </div>
    );
};

export default AddMethodForm;
