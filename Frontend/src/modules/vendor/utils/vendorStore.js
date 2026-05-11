// A simple local-storage based state manager for Vendor Mock App
export const getVendorData = () => {
  const data = localStorage.getItem('vendor_data');
  if (data) return JSON.parse(data);
  return null;
};

export const setVendorData = (data) => {
  localStorage.setItem('vendor_data', JSON.stringify(data));
  // Dispatch a custom event so other components can listen to changes if needed
  window.dispatchEvent(new Event('vendor_data_updated'));
};

export const initVendorState = (profile) => {
  const initialState = {
    isLoggedIn: true,
    profile, // Now includes token
    jobsApplied: [],
  };
  setVendorData(initialState);
  return initialState;
};

export const logoutVendor = () => {
  localStorage.removeItem('vendor_data');
  window.location.href = '/vendor/login';
};

export const applyForJob = (jobId) => {
  const data = getVendorData();
  if (!data) return false;

  data.jobsApplied.push(jobId);
  setVendorData(data);
  return true;
};
