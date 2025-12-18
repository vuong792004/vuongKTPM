import { message, Popconfirm } from 'antd';
import './review.css'
import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';

const Review = (props) => {

    const {
        reviews, comment, rating, setRating, setComment, handleSubmit
    } = props

    const { user } = useContext(AuthContext);

    const handleCheckLogin = () => {
        if (!user) {
            message.warning("You must be logged in to post a review.");
            return;
        }
    };
    const handleConfirmSubmit = () => {
        if (rating === 0) {
            message.warning("Please select a star rating before submitting.");
            return;
        }
        handleSubmit();
    };


    return (
        <div className="review-container">
            <h2>Reviews</h2>

            {/* List đánh giá */}
            {reviews.length === 0 && <p>No reviews yet.</p>}
            {reviews.map((r) => (
                <div key={r.review_id} className="review-item">
                    <div className="review-user">{r.user?.name || "Anonymous"}</div>
                    <div className="review-rating">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                    </div>
                    <div className="review-comment">{r.comment}</div>
                </div>
            ))}

            {/* Form gửi đánh giá */}
            <form className="review-form"
                onSubmit={(e) => e.preventDefault()}
            >
                <h3>Leave a review</h3>
                <div className="star-select">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={star <= rating ? "star selected" : "star"}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={!user} // khóa nếu chưa login
                />
                {user ? (
                    <Popconfirm
                        title="Post review"
                        description="Are you sure you want to submit this review?"
                        okText="Yes"
                        cancelText="No"
                        placement="bottom"
                        onConfirm={handleConfirmSubmit}                    >
                        <button type="button">Submit</button>
                    </Popconfirm>
                ) : (
                    <button type="button" onClick={handleCheckLogin}>
                        Submit
                    </button>
                )}
            </form>
        </div>
    );
};

export default Review;