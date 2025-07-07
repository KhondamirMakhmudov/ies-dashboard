import axios from "axios";
import { config } from "@/config";
import storage from "../storage";
import { get } from "lodash";

const request = axios.create({
  baseURL: config.JAVA_API_URL,
  params: {},
  headers: {
    common: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
  },
});

request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { request };
