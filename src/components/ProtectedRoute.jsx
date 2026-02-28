import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();

    if (!currentUser || !isAdmin) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;
