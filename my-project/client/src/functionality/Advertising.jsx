import React, { useState, useEffect } from 'react';

const AdvertisementsTable = () => {
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAd, setNewAd] = useState({
        image_url: '',
        target_url: '',
        click_count: 0,
    });
    const [message, setMessage] = useState('');
    const [adIdToDelete, setAdIdToDelete] = useState('');
    const [adToEdit, setAdToEdit] = useState(null);

    useEffect(() => {
        fetchAdvertisements();
    }, []);


    const fetchAdvertisements = () => {
        fetch('http://localhost:8080/advertisements')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch advertisements');
                }
                return response.json();
            })
            .then((data) => {
                setAdvertisements(data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error)
                setLoading(false);
            });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAd((prevAd) => ({
            ...prevAd,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newAd.image_url || !newAd.target_url) {
            setMessage('Image URL and Target URL are required.');
            return;
        }

        fetch('http://localhost:8080/advertisements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAd),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add advertisement');
                }
                return response.json();
            })
            .then(() => {
                setMessage('Advertisement added successfully!');
                setNewAd({ image_url: '', target_url: '', click_count: 0 });
                fetchAdvertisements();
            })
            .catch((error) => {
                console.log(error);
                setMessage('Failed to add advertisement');
            });
    };
    const handleDelete = (e) => {
        e.preventDefault();

        if (!adIdToDelete) {
            setMessage('Please provide a valid Advertisement ID to delete.');
            return;
        }

        fetch(`http://localhost:8080/advertisements/${adIdToDelete}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete advertisement');
                }
                setMessage(`Advertisement with ID ${adIdToDelete} deleted successfully!`);
                setAdIdToDelete('');
                fetchAdvertisements();
            })
            .catch((error) => {
                console.log(error);
                setMessage('Failed to delete advertisement');
            });
    };
    const handleEditClick = (ad) => {
        setAdToEdit(ad);
    };
    const handleEditSubmit = (e) => {
        e.preventDefault();

        fetch(`http://localhost:8080/advertisements/${adToEdit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adToEdit),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to update advertisement');
                }
                setMessage('Advertisement updated successfully!');
                setAdToEdit(null);
                fetchAdvertisements();
            })
            .catch((error) => {
                console.log(error);
                setMessage('Failed to update advertisement');
            });
    };

    if (loading) {
        return <p>Loading...</p>;
    }


    return (
        <div>
            {message && <p>{message}</p>}
            <h1>Advertisements List</h1>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>image_url</th>
                    <th>target_utl</th>
                    <th>Click count</th>
                </tr>
                </thead>
                <tbody>
                {advertisements.length === 0 ? (
                    <tr>
                        <td colSpan="5">No advertisements found</td>
                    </tr>
                ) : (
                    advertisements.map((ad) => (
                        <tr key={ad.id}>
                            <td>{ad.id}</td>
                            <td>{ad.image_url}</td>
                            <td>{ad.target_url}</td>
                            <td>{ad.click_count}</td>
                            <td>
                                <button onClick={() => handleEditClick(ad)}>Edit</button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            <h2>Add New Advertisement</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Image URL:</label>
                    <input
                        type="text"
                        name="image_url"
                        value={newAd.image_url}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Target URL:</label>
                    <input
                        type="text"
                        name="target_url"
                        value={newAd.target_url}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Add Advertisement</button>
            </form>
            {adToEdit && (
                <div>
                    <h2>Edit Advertisement</h2>
                    <form onSubmit={handleEditSubmit}>
                        <div>
                            <label>Image URL:</label>
                            <input
                                type="text"
                                name="image_url"
                                value={adToEdit.image_url}
                                onChange={(e) =>
                                    setAdToEdit({ ...adToEdit, image_url: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label>Target URL:</label>
                            <input
                                type="text"
                                name="target_url"
                                value={adToEdit.target_url}
                                onChange={(e) =>
                                    setAdToEdit({ ...adToEdit, target_url: e.target.value })
                                }
                                required
                            />
                        </div>
                        <button type="submit">Update Advertisement</button>
                        <button type="button" onClick={() => setAdToEdit(null)}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}


            <h2>Delete Advertisement</h2>
            <form onSubmit={handleDelete}>
                <div>
                    <label>Advertisement ID to delete:</label>
                    <input
                        type="text"
                        value={adIdToDelete}
                        onChange={(e) => setAdIdToDelete(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Delete Advertisement</button>
            </form>
        </div>
    );
};

export default AdvertisementsTable;
