import axios, { AxiosInstance } from "axios";

export const customAxios: AxiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}`,
});

customAxios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
customAxios.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error) {
    console.log(error);

    // Handle other errors
    return Promise.reject(error);
  }
);
