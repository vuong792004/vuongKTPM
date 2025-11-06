import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthForm = ({ handleChange, handleSubmit, credentials, isSubmitting, error }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form className="auth-form" onSubmit={(e) => handleSubmit(e, credentials)}>
            {/* Email */}
            <label>
                <span>Email address</span>
                <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
            </label>

            {/* Password với con mắt */}
            <label>
                <span>Password</span>
                <div className="auth-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    <span
                        className="auth-eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                </div>
            </label>

            {/* Remember me */}
            <label className="auth-remember">
                <input
                    type="checkbox"
                    name="remember"
                    checked={credentials.remember}
                    onChange={handleChange}
                />
                Remember me
            </label>

            {/* Hiển thị 1 lỗi string */}
            {error && (
                <div className="auth-error" style={{ marginTop: "8px" }}>
                    <p>{error}</p>
                </div>
            )}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
};

export default AuthForm;
