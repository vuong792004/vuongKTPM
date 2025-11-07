import { useEffect, useState } from "react";
import { getProductById, getReview, postReview } from "../services/api.service";
import { useParams } from "react-router-dom";
import ProductInfor from "../components/detail-product/productInfo";
import Review from "../components/detail-product/review";

const DetailProductPage = () => {
    const { id } = useParams();
    const [productInfo, setProductInfo] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (id) {
            fetchProductInfo();
            fetchReview();
        }
    }, [id]);

    const fetchProductInfo = async () => {
        try {
            const res = await getProductById(id);
            setProductInfo(res.data);
        } catch (err) {
            console.error("Failed to fetch product:", err);
        }
    };

    const fetchReview = async () => {
        try {
            const res = await getReview(id);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch review:", err);
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await postReview(id, rating, comment);
            const newReview = res.data.reviewData;
            setReviews((prev) => [...prev, newReview]);
            setRating(0);
            setComment("");
        } catch (err) {
            console.error("Failed to submit review:", err);
        }
    };

    return (
        <>
            <ProductInfor productInfo={productInfo} reviews={reviews} />
            <Review
                reviews={reviews}
                rating={rating} setRating={setRating}
                comment={comment} setComment={setComment}
                handleSubmit={handleSubmit}
            />
        </>
    );
};

export default DetailProductPage;
