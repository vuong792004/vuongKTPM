import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { Eye, EyeOff } from 'lucide-react';

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

    const handleSubmit = (event) => {
        event.preventDefault();
        alert(`
        Full name: ${form.name}
        Email: ${form.email}
        Password: ${form.password}
        Confirm Password: ${form.confirmPassword}
    `);
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
