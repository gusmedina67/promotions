import axios from "axios";

const API_BASE_URL = "https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg";

export const scanQRCode = (qr_code_id) => {
  return axios.post(`${API_BASE_URL}/scan`, { qr_code_id });
};

export const submitWinnerDetails = (qr_code_id, name, phone, email) => {
  return axios.post(`${API_BASE_URL}/submit-winner`, { qr_code_id, name, phone, email });
};

export const createQRCode = (prize_type) => {
  return axios.post(`${API_BASE_URL}/generate-qrcodes`, { prize_type });
};

export const updateQRCode = (qr_code_id, prize_type) => {
  return axios.post(`${API_BASE_URL}/update-prize`, { qr_code_id, prize_type });
};
