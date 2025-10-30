import { useState } from 'react';
import AuthForm from '../components/auth/authForm';
import AuthFooter from '../components/auth/authFooter';


const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '', remember: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = event => {
        const { name, value, type, checked } = event.target;
        setCredentials(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        alert(`
        Email: ${credentials.email}
        Password: ${credentials.password}
        Remember me: ${credentials.remember}
    `);
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
                />

                <AuthFooter />
            </div>
        </div>
    );
};

export default LoginPage;
