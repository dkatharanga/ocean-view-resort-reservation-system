import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", // Must match your Spring Boot server port
});

export default API;