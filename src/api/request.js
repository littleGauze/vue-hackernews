import axios from "axios"

export function createServer(baseURL) {
  const server = axios.create({ baseURL })
  return server
}
