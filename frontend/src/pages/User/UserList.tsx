import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { RegisteredUser } from "../../interfaces/IUser";
import "./UserList.css";

import {
  getAllUsers,
  allUsers,
  getUsersError,
  getUsersLoading,
  getUsersLastFetch,
  clearSelectedUser,
  setSelectedUser,
  clearError,
} from "../../store/slices/userSlice";

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const userList = useAppSelector(allUsers);
  const error = useAppSelector(getUsersError);

  // Load All Users
  useEffect(() => {
    if (userList.length === 0) {
      // Calling getAllUsers Thunk -> httpService.get("/users")
      dispatch(getAllUsers());
    }
  }, [dispatch, userList.length]);

  // Clear errors when component unmounts
  useEffect(() => {
    // The return function is React's way of saying "run this when cleaning up this effect."
    // This is a React pattern for handling side effects that need to be cleaned up when:
    // Component unmounts (gets removed from the DOM)
    // Dependencies change (the effect runs again)
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "role-badge role-admin";
      case "Manager":
        return "role-badge role-manager";
      case "User":
      default:
        return "role-badge role-user";
    }
  };

  const handleUserClick = (user: RegisteredUser) => {
    //  if (onUserSelect) {
    //    onUserSelect(user);
    //  } else {
    //    // Default behavior - navigate to user management with selected user
    dispatch(clearSelectedUser());
    console.log("UserList - Selected User: ", user);
    dispatch(setSelectedUser(user)); // Update selectedUser at userSlice
    navigate(`/useredit/${user.id}`);
    //  }
  };

  return (
    <div className="user-list">
      <div className="list-container">
        <div className="users-section">
          <div className="empty-state"></div>

          <div className="table-header"></div>

          <div className="user-rows">
            {userList.map((user) => (
              <div key={user.id} className="user-row">
                {/* Eamil */}
                <div className="user-email">
                  <div className="email-text">{user.email}</div>
                  <div className="user-id">ID: {user.id}</div>
                </div>

                {/* Role */}
                <div className="user-role">
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </div>

                {/* Name */}
                <div className="user-created">
                  <span>{user.username}</span>
                </div>

                {/* Button */}
                <div className="user-actions">
                  <button
                    onClick={() => handleUserClick(user)}
                    className="action-btn view-btn"
                    title="View/Edit User"
                  >
                    <span className="action-icon">👁️</span>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
