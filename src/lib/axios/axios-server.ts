import axios from "axios";
import { headers } from "next/headers";

export const createServerAxios = async() => {
  const cookie = (await headers()).get("cookie")
  
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      cookie: cookie || ""
    }
  })
}

