import axios from "axios";

export const createFilter = async (payload) => {
  const res = await axios.post("/event_storage/api/v1/filters", payload);

  return res.data;
};
