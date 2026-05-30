// Local storage manager for User App
export const getUserData = () => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const setUserData = (data) => {
  localStorage.setItem('user_data', JSON.stringify(data));
  window.dispatchEvent(new Event('user_data_updated'));
};

export const initUserState = (userData) => {
  // userData comes from backend login/register response: { id, name, email, mobile, location, role, walletBalance, profilePicture, token }
  const initialState = {
    isLoggedIn: true,
    token: userData.token,
    profile: userData, // Store all user fields directly accessible as user.profile.*
    user: userData,    // Also store as user.user.* for compatibility
    wallet: userData.walletBalance || 0,
    recentActivity: [],
    bookings: []
  };
  setUserData(initialState);
  return initialState;
};

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = '/';
};

export const deductUserWallet = (amount) => {
  const data = getUserData();
  if (!data || data.wallet < amount) return false;
  data.wallet -= amount;
  setUserData(data);
  return true;
};
