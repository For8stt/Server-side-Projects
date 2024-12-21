import React, {useEffect, useState} from 'react';


const Advertisement = () => {
    const [ad, setAd] = useState(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        fetchAdvertisement();

        const interval = setInterval(() => {
            setOffset((prevOffset) => prevOffset + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (offset >= 0) {
            fetchAdvertisement();
        }
    }, [offset]);


    const incrementClickCount = async (adId) => {
        try {
            const response = await fetch(`http://localhost:8080/increment-click/${adId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to update click count');
            }
            console.log('Click count updated')
            setAd((prevAd) => ({
                ...prevAd,
                click_count: prevAd.click_count + 1,
            }));
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    };
    const fetchAdvertisement = async () => {
        try {
            const response = await fetch(`http://localhost:8080/next-advertisement?offset=${offset}`);
            if (!response.ok) {
                throw new Error('No advertisements found');
            }
            const advertisement = await response.json();
            console.log(advertisement);

            setAd(advertisement);
        } catch (error) {
            console.log('all advertisements show');
        }
    };



    const handleClick = () => {
        if (ad) {
            incrementClickCount(ad.id);
        }
    };

    if (!ad) {
        return <div>Loading advertisement...</div>;
    }

    return (
        <div className="advertisement">
            <img src={ad.image_url} alt="Advertisement" className="advert-banner-img" style={{ width: '400px', height: '200px', objectFit: 'contain' }}/>
            <p className="advert-text">Click here for amazing offers!</p>
            <a
                href={ad.target_url}
                className="advert-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
            >
                Click Here
            </a>
            <p>Clicks: {ad.click_count}</p>
        </div>
    );
};

export default Advertisement;