import { Link, useNavigate } from 'react-router-dom';


const AuthFooter = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-footer">
            {/* <span>Forgot password?</span> */}
            <p>
                New to TNH Store? <Link to="/register">Create an account</Link>
            </p>
            <p style={{ marginTop: 10 }}>
                <Link
                    to="/"
                    style={{
                        display: "inline-block",
                        padding: "10px 18px",
                        border: "1px solid #000",
                        borderRadius: "6px",
                        textDecoration: "none",
                        color: "#000",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#000", e.currentTarget.style.color = "#fff")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "#000")}
                >
                    Back To Homepage
                </Link>
            </p>
        </div>
    )
}

export default AuthFooter