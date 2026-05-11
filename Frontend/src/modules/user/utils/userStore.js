// Local storage manager for User App
export const getUserData = () => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const setUserData = (data) => {
  localStorage.setItem('user_data', JSON.stringify(data));
  window.dispatchEvent(new Event('user_data_updated'));
};

export const initUserState = (profile) => {
  const initialState = {
    isLoggedIn: true,
    profile,
    wallet: 150.00, // starting balance as per image
    recentActivity: [
      { id: "ACT-101", type: "Search", desc: "Searched for Drivers in CP", date: "Today" }
    ],
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
