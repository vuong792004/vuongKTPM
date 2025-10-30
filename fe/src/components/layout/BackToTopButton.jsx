import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react"; // icon mũi tên lên
import './backtotop.css'
const BackToTopButton = () => {

    const [isVisible, setIsVisible] = useState(false);

    // Hiển thị nút khi scroll xuống
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Hàm scroll lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <button className="back-to-top" onClick={scrollToTop}>
                    <ArrowUp size={24} />
                </button>
            )}
        </>
    );
};

export default BackToTopButton;
