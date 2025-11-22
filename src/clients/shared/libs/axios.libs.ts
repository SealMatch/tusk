import axios, { AxiosInstance } from "axios";

const isProd = process.env.VERCEL_ENV === "production";

export const customAxios: AxiosInstance = axios.create({
  baseURL: isProd
    ? process.env.NEXT_PUBLIC_PROD_URL
    : process.env.NEXT_PUBLIC_LOCAL_URL,
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
