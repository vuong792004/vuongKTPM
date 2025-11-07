
import React from 'react';
import { Carousel } from 'antd';
import './banner.css';



const Banner = () => {
    return (
        <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={2000}>
            <div>
                <img src='images/banner/banner1.webp' alt='Slide 1' className='banner-image' />
            </div>
            <div>
                <img src='images/banner/banner2.png' alt='Slide 2' className='banner-image' />
            </div>
            <div>
                <img src='images/banner/banner3.jpg' alt='Slide 3' className='banner-image' />
            </div>
        </Carousel>
    );
}

export default Banner;