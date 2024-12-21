import React, { useState,useEffect } from 'react';

const InsertDeleteMeasure = ({id}) => {
    const [datum,setDatum] = useState('');
    const [value,setValue] = useState('');
    const [method,setMethod] = useState('');
    const [characteristicType, setCharacteristicType] = useState('');
    const [deleteId, setDeleteId] = useState('');
    const [characteristic, setCharacteristic] = useState('');
    const [methods, setMethods] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/getMethods')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error fetching methods: ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (data.length > 0) {
                    setMethods(data.map(item => item.name));
                } else {
                    console.log('No methods available');
                    setMethods([]);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();

        const characteristic={
            user_id: id,
            datum,
            value,
            method,
            characteristic_type: characteristicType,
        };

        fetch('http://localhost:8080/addCharacteristic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characteristic),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error adding characteristic: ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Characteristic added:', data);
                alert('Characteristic successfully added!');
                setDatum('');
                setValue('');
                setMethod('');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to add characteristic. Please try again.');
            });
    }

    const handleDelete = (e) => {
        e.preventDefault();

        if (!deleteId || !characteristic) {
            alert('Please provide both the ID and the characteristic type.');
            return;
        }

        fetch(`http://localhost:8080/deleteCharacteristic/${characteristic}/${deleteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error deleting characteristic: ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Characteristic deleted:', data);
                alert('Characteristic successfully deleted!');
                setDeleteId('');
                setCharacteristic('');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to delete characteristic. Please try again.');
            });
    };


    return (
        <div>
            <hr/>
            <h3>Add Characteristic</h3>
            <form onSubmit={handleAdd}>
                <div>
                    <label>Date (YYYY-MM-DD):</label>
                    <input
                        type="date"
                        value={datum}
                        onChange={(e) => setDatum(e.target.value)}
                        required
                    />

                </div>
                <div>
                    <label>Value:</label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Characteristic Type:</label>
                    <select
                        value={characteristicType}
                        onChange={(e) => setCharacteristicType(e.target.value)}
                        required>

                        <option value="">Select Type</option>
                        <option value="vaha">Weight (vaha)</option>
                        <option value="tep">Heartbeat (tep)</option>
                        <option value="kroky">Steps (kroky)</option>
                    </select>
                </div>
                <div>
                    <label>Method:</label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <option value="">Select Method</option>
                        {methods.length > 0 ? (
                            methods.map((method, index) => (
                                <option key={index} value={method}>
                                    {method}
                                </option>
                            ))
                        ) : (
                            <option value="">No methods available</option>
                        )}
                    </select>
                </div>

                <button type="submit">Add Characteristic</button>
            </form>

            <hr/>

            <form onSubmit={handleDelete}>
                <h3>Delete Characteristic</h3>
                <div>
                    <label>Characteristic ID:</label>
                    <input
                        type="text"
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Characteristic:</label>
                    <select
                        value={characteristic}
                        onChange={(e) => setCharacteristic(e.target.value)}
                        required
                    >
                        <option value="">Select a сharacteristic</option>
                        <option value="user_characteristics_vaha">Weight (vaha)</option>
                        <option value="user_characteristics_tep">Pulse (tep)</option>
                        <option value="user_characteristics_kroky">Steps (kroky)</option>
                    </select>
                </div>
                <button type="submit">Delete Characteristic</button>
            </form>
        </div>
    );

}
export default InsertDeleteMeasure