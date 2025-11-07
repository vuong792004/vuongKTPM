import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";

// khi login r thì kh cho vào trang login và register nua
const GuestRoute = (props) => {
    const { user } = useContext(AuthContext);

    if (user?.name) {
        return <Navigate to="/" replace />;
    }

    return <>{props.children}</>;
};

export default GuestRoute;
