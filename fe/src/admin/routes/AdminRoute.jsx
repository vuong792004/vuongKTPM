import { useContext, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../components/context/auth.context";
import { Spin } from "antd";

const AdminRoute = ({ children }) => {
    const { user, isAppLoading } = useContext(AuthContext);
    const location = useLocation();

    if (isAppLoading) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                }}
            >
                <Spin />
            </div>
        );
    }

    if (!user) {
        console.warn("Không có user trong context");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // console.log("User trong AdminRoute:", user); // log user khi vào /admin

    if (user.role?.toLowerCase() !== "admin") {
        console.warn("User không phải admin:", user.role);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};


export default AdminRoute;
