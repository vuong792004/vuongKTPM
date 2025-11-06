import { useContext, useState } from 'react';
import AuthForm from '../components/auth/authForm';
import AuthFooter from '../components/auth/authFooter';
import { AuthContext } from '../components/context/auth.context';
import { postLogin } from '../services/api.service';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '', remember: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = event => {
        const { name, value, type, checked } = event.target;
        setCredentials(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };


    const handleSubmit = async (event, values) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await postLogin(values.email, values.password);

            if (res.success === false) {
                setError(res.message || "Invalid email or password");
                return;
            }

            if (res.data?.token) {
                const token = res.data.token;
                localStorage.setItem("access_token", token);

                // Decode token để lấy role
                const decoded = jwtDecode(token);
                setUser(decoded);

                message.success("Login successful");

                // Redirect theo role
                if (decoded.role?.toLowerCase() === "admin") {
                    navigate("/admin", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p>Sign in to manage your orders and enjoy faster checkout.</p>

                <AuthForm
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    credentials={credentials}
                    isSubmitting={isSubmitting}
                    error={error}
                />

                <AuthFooter />
            </div>
        </div>
    );
};

export default LoginPage;
