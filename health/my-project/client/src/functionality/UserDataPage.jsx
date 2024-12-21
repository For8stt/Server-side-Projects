import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);
const calculateLinearRegression = (data) => {
    const n = data.length;
    if (n === 0) return null;

    const sumX = data.reduce((acc, val, idx) => acc + idx, 0);
    const sumY = data.reduce((acc, val) => acc + val, 0);
    const sumXY = data.reduce((acc, val, idx) => acc + idx * val, 0);
    const sumX2 = data.reduce((acc, _, idx) => acc + idx * idx, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};


const UserDataPage = ({ id , methods}) => {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('vaha');
    const [selectedMethod, setSelectedMethod] = useState('');

    const fetchData = () => {
        if (!id || !startDate || !endDate) {
            alert('Please select a valid date range.');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            alert('End date must be greater than start date.');
            return;
        }


        fetch(`http://localhost:8080/getUserData/${id}?startDate=${startDate}&endDate=${endDate}`)
            .then((response) => {
                if (!response.ok) {

                    if (response.status === 404) {
                        return [];
                    }

                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const formattedData = data.map(item => ({
                    ...item,
                    date: new Date(item.date).toISOString().split('T')[0]
                })).sort((a, b) => new Date(a.date) - new Date(b.date));
                setData(formattedData);
            })
            .catch((error) => {
                console.error('Error:', error);
                if (error.message !== 'HTTP Error: 404') {
                    alert('Failed to load user data');
                }else {
                    alert('No data in this time period ');
                }
                setData([]);
            });
    };
    const filteredData = data.filter(item =>
        item.characteristic_type === selectedType &&
        (!selectedMethod || item.method.toLowerCase() === selectedMethod.toLowerCase())
    );

    const yValues = filteredData.map(item => item.value);
    const regression = calculateLinearRegression(yValues);

    const regressionLine = regression
        ? filteredData.map((_, idx) => regression.slope * idx + regression.intercept)
        : [];




    // const chartData = {
    //     labels: filteredData.map(item => item.date),
    //     datasets: [
    //         {
    //             label: 'User Data',
    //             data: filteredData.map(item => item.value),
    //             fill: false,
    //             borderColor: 'rgba(75, 192, 192, 1)',
    //             pointBorderColor: 'rgba(75, 192, 192, 1)',
    //             pointBackgroundColor: 'rgba(75, 192, 192, 1)',
    //         },
    //     ],
    // };
    const chartData = {
        labels: filteredData.map(item => item.date),
        datasets: [
            {
                label: 'User Data',
                data: filteredData.map(item => item.value),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: 'rgba(75, 192, 192, 1)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                showLine: false,
            },
            {
                label: 'Linear Regression',
                data: regressionLine,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderDash: [7, 5],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date' },
                type: 'category',
            },
            y: {
                title: { display: true, text: 'Value' },
                type: 'linear',
            },
        },
    };

    return (
        <div>
            <h1>User Data</h1>

            <div style={{marginBottom: '20px'}}>
                <label>Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <label style={{marginLeft: '10px'}}>End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={fetchData} style={{marginLeft: '10px'}}>Fetch Data</button>
            </div>

            <div style={{marginBottom: '20px'}}>
                <label>Select Data Type:</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                        style={{marginLeft: '10px'}}>
                    <option value="vaha">Weight (vaha)</option>
                    <option value="tep">Heart Rate (tep)</option>
                    <option value="kroky">Steps (kroky)</option>
                </select>
            </div>

            <div style={{marginBottom: '20px'}}>
                <label>Select Method:</label>
                <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}
                        style={{marginLeft: '10px'}}>
                    <option value="">All Methods</option>
                    {methods.map(method => (
                        <option key={method.id} value={method.name}>
                            {method.name}
                        </option>
                    ))}
                </select>
            </div>


            {filteredData.length > 0 && (
                <>
                    <div style={{height: '400px', marginBottom: '20px'}}>
                        <Line data={chartData} options={chartOptions}/>
                    </div>

                    <table border="1" style={{width: '100%'}}>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Value</th>
                            <th>Method</th>
                            <th>Characteristic Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id}>
                                <td>{new Date(item.date).toISOString().split('T')[0]}</td>
                                <td>{item.value}</td>
                                <td>{item.method || 'N/A'}</td>
                                <td>{item.characteristic_type}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}

            {filteredData.length === 0 && <p>No data available for the selected range.</p>}
        </div>
    );
};

export default UserDataPage;
