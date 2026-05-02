/**
 * Panic Button Utility
 * Reusable function for panic button functionality across all pages
 */

import API_URL from './config';

const API_BASE_URL = API_URL;

/**
 * Handle panic button click
 * @param {Function} navigate - React Router navigate function
 * @param {Function} setLoading - Optional loading state setter
 * @returns {Promise<void>}
 */
export const handlePanicButton = async (navigate, setLoading = null) => {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Please log in to use the panic button. This feature requires your account information.');
    if (navigate) {
      navigate("/login");
    }
    return;
  }

  // Confirm before creating emergency post
  const confirmed = window.confirm(
    '🚨 EMERGENCY PANIC ALERT 🚨\n\n' +
    'This will create an urgent emergency post on the community board with your information.\n\n' +
    'Are you in immediate danger and need help?'
  );

  if (!confirmed) {
    return;
  }

  try {
    if (setLoading) {
      setLoading(true);
    }

    // Get username from localStorage
    const userData = JSON.parse(currentUser);
    const username = userData.username;

    if (!username) {
      alert('⚠️ User information not found. Please log in again.');
      if (navigate) {
        navigate("/login");
      }
      return;
    }

    // Call backend panic endpoint
    const response = await fetch(`${API_BASE_URL}/panic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('🚨 EMERGENCY ALERT POSTED!\n\nYour emergency post has been created on the community board. Help is on the way!');
      // Redirect to community page to see the post
      if (navigate) {
        navigate("/community");
      }
    } else {
      // Handle specific error messages
      if (data.missingField === 'phone' || data.missingField === 'location') {
        const fieldName = data.missingField === 'phone' ? 'phone number' : 'location';
        alert(`⚠️ Missing ${fieldName.toUpperCase()}\n\n${data.message}\n\nPlease update your account profile with your ${fieldName}, then try again.\n\nFor immediate emergency assistance, call 911 or your local emergency number.`);
        // Redirect to account page
        if (navigate) {
          navigate("/account");
        }
      } else {
        alert('⚠️ Unable to create emergency alert.\n\n' + (data.message || 'Unknown error occurred.') + '\n\nFor immediate help, call 911 or your local emergency number.');
      }
    }
  } catch (error) {
    console.error('Panic button error:', error);
    alert('⚠️ Network error. Please contact emergency services directly:\n\n911 (or your local emergency number)');
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
};

