import React, { useState, useEffect } from 'react';

const ShowMeasur = ({ id }) => {
    const [characteristics, setCharacteristics] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (id) {
            fetchCharacteristics();
        }
    }, [id]);

    const fetchCharacteristics = () => {
        fetch(`http://localhost:8080/getUserCharacteristics/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('No characteristics found or server error.');
                }
                return response.json();
            })
            .then((data) => {
                setCharacteristics(data);
            })
            .catch((error) => {
                console.log('Error:', error.message);
                setCharacteristics([])
            });
    };
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`http://localhost:8080/upload/${id}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            alert('File uploaded successfully');
        } catch (error) {
            console.error(error);
            alert('Error uploading file');
        }
    };

    const handleDownload = () => {
        fetch(`http://localhost:8080/exportData/${id}`, {
            method: 'GET',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error downloading file');
                }
                return response.text();
            })
            .then((data) => {
                const blob = new Blob([data], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `user_characteristics.csv`;
                link.click();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to download the file');
            });
    };


    if (characteristics.length === 0) {
        return (
            <>
                <p>No characteristics available for this user.</p>
                <button onClick={fetchCharacteristics}>
                    Refresh Table
                </button>
                <div>
                    <h4>Upload Data</h4>
                    <form onSubmit={handleUpload}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}/>
                        <button type="submit">Upload</button>
                    </form>
                </div>
            </>
        );

    } else {
        return (
            <div>
                <hr/>
                <h2>User Characteristics</h2>
                <div>
                    <h4>Upload Data</h4>
                    <form onSubmit={handleUpload}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}/>
                        <button type="submit">Upload</button>
                    </form>
                </div>
                <div>
                    <button onClick={handleDownload}>Download User Data</button>
                </div>
                <button onClick={fetchCharacteristics}>
                    Refresh Table
                </button>
                <table border="1" style={{width: '100%', marginTop: '20px'}}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Value</th>
                        <th>Method</th>
                        <th>Characteristic Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    {characteristics.map((characteristic, index) => (
                        <tr key={index}>
                            <td>{characteristic.id}</td>
                            <td>{new Date(characteristic.datum).toISOString().split('T')[0]}</td>
                            <td>{characteristic.hodnota}</td>
                            <td>{characteristic.metoda || 'N/A'}</td>
                            <td>{characteristic.characteristic_type}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
};

export default ShowMeasur;
