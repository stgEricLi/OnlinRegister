import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { RegisteredUser } from "../../interfaces/IUser";
import "./UserList.css";

import {
  refreshUsers,
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
  const isLoading = useAppSelector(getUsersLoading);
  const lastFetch = useAppSelector(getUsersLastFetch);

  // Debug: Make userList globally accessible for console debugging
  // console.log("UserList - userList:", userList);
  // (window as any).userList = userList;

  // Load All Users
  useEffect(() => {
    if (userList.length === 0) {
      // Calling getAllUsers Thunk → httpService.get("/users")
      dispatch(getAllUsers());
    }
  }, [dispatch, userList.length]);

  // Auto-refresh if data is stale (older than 5 minutes)
  useEffect(() => {
    if (lastFetch) {
      const now = Date.now();
      const isStale = now - lastFetch > 300000; // 5 minutes
      if (isStale) {
        // Calling refreshUsers Thunk → httpService.get("/users")
        dispatch(refreshUsers());
      }
    }
  }, [dispatch, lastFetch]);

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

  const handleRefresh = () => {
    dispatch(refreshUsers());
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

  // Local state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "Admin" | "Manager" | "User" | "all"
  >("all");

  // This tells TypeScript that the state can only hold one of three specific string values: "email", "role", "createdAt"
  // This is called a union type of string literals.
  const [sortBy, setSortBy] = useState<"email" | "role" | "username">(
    "username"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "email" | "role" | "username") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort users
  // React.useMemo() is a React Hook that helps optimize performance by memoizing (caching) the result of expensive calculations.
  // It only recalculates when its dependencies change.
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = userList.filter((user) => {
      // Search filter
      const matchesSearch = user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    // console.log("💡 filtered:", filtered);
    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "username":
          comparison = a.username.localeCompare(b.username);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
    // console.log("💡 sortBy:", sortBy);
    // console.log("💡 result:", filtered);
    return filtered;
  }, [userList, searchTerm, roleFilter, sortBy, sortOrder]);

  const userStatus = React.useMemo(() => {
    return {
      total: userList.length,
      admin: userList.filter((u) => u.role === "Admin").length,
      manager: userList.filter((u) => u.role === "Manager").length,
      regular: userList.filter((u) => u.role === "User").length,
    };
  }, [userList]);

  if (isLoading) {
    return (
      <div className="user-list">
        <div className="list-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="list-container">
        {/* Header */}
        <div className="list-header">
          {/* Header Title*/}
          <div className="header-content">
            <h1 className="list-title">User List</h1>
            <p className="list-subtitle">View and manage all user accounts</p>
          </div>
          {/* Header Buttons*/}
          <div className="header-actions">
            {/* Refresh Button*/}
            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔄</span>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <div className="error-messages">
                <p className="error-message">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="error-close"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{userStatus.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userStatus.admin}</div>
              <div className="stat-label">Administrators</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userStatus.manager}</div>
              <div className="stat-label">Managers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userStatus.regular}</div>
              <div className="stat-label">Regular Users</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          {/* Search Box */}
          <div className="search-group">
            <label htmlFor="search" className="search-label">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email address..."
              className="search-input"
            />
          </div>
          {/* Filters Drop-Down */}
          <div className="filter-group">
            <label htmlFor="roleFilter" className="filter-label">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value as "Admin" | "Manager" | "User" | "all"
                )
              }
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="User">Users</option>
              <option value="Manager">Managers</option>
              <option value="Admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className="users-section">
          {filteredAndSortedUsers.length == 0 ? (
            <>
              <div className="empty-state">
                <h3>No Users Found</h3>
                <p>
                  {searchTerm || roleFilter !== "all"
                    ? "No users match your current filters."
                    : "No users are currently registered."}
                </p>
                {(searchTerm || roleFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Table Header */}
              <div className="table-header">
                <button
                  onClick={() => handleSort("email")}
                  className={`sort-button ${
                    sortBy === "email" ? "active" : ""
                  }`}
                >
                  Email
                  {sortBy === "email" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleSort("role")}
                  className={`sort-button ${sortBy === "role" ? "active" : ""}`}
                >
                  Role
                  {sortBy === "role" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleSort("username")}
                  className={`sort-button ${
                    sortBy === "username" ? "active" : ""
                  }`}
                >
                  Name
                  {sortBy === "username" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
                <div className="actions-header">Actions</div>
              </div>

              <div className="user-rows">
                {filteredAndSortedUsers.map((user) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
