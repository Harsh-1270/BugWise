import React from 'react'
import LoggedInHeader from './LoggedInHeader';



const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/';
  };


export default function BugHistory() {
  return (
    <div>
      <h1>Bug History</h1>
    </div>
  )
}

