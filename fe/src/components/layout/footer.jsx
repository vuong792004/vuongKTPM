import './footer.css';
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">

                {/* Logo & About Us */}
                <div className="footer-about">
                    <h2 className="footer-logo">TNH Store</h2>
                    <p className="footer-description">
                        TNH Store is a shop specializing in providing genuine Apple products such as iPhone, iPad, MacBook, and accessories. We are committed to offering our customers the best shopping experience, high-quality products, and dedicated after-sales service.
                    </p>
                </div>

                {/* Social */}
                <div className="footer-socials">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <Facebook className="social-icon" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <Instagram className="social-icon" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <Twitter className="social-icon" />
                    </a>
                </div>

                {/* Copy right */}
                <p className="footer-text">© {new Date().getFullYear()} TNH Store. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
