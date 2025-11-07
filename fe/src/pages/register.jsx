import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { postRegister } from '../services/api.service';
import { Eye, EyeOff } from 'lucide-react';
import { message } from 'antd';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState([]); // mảng lỗi
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        try {
            const res = await postRegister(
                form.name,
                form.email,
                form.password,
                form.confirmPassword
            );

            if (res.success === false) {
                const allErrors = res.errors.map((err) => err.message);
                setErrors(allErrors);
                return;
            }
            message.success('Registration successful! Please log in to continue.');
            navigate('/login');
        } catch (err) {
            console.error('Unexpected error:', err);
            if (err.response?.data?.errors) {
                const allErrors = err.response.data.errors.map((e) => e.message);
                setErrors(allErrors);
            } else {
                setErrors([err.response?.data?.message || 'Registration failed']);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create your TNH account</h1>
                <p>Earn loyalty points and keep track of all Apple devices you love.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Full name</span>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        <span>Email address</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>Password</span>
                        <div className="auth-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="auth-eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </label>

                    <label>
                        <span>Confirm password</span>
                        <div className="auth-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="auth-eye-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </label>


                    {/* Hiển thị tất cả lỗi dưới form */}
                    {errors.length > 0 && (
                        <div className="auth-error">
                            <ul>
                                {errors.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}


                    <button type="submit" className="auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                    <p style={{ marginTop: 10 }}>
                        <Link
                            to="/"
                            style={{
                                display: 'inline-block',
                                padding: '10px 18px',
                                border: '1px solid #000',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                color: '#000',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#000';
                            }}
                        >
                            Back To Homepage
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
