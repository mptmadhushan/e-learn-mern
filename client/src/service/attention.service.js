
import runtimeEnv from "@mars/heroku-js-runtime-env";
import axios from "axios";

const env = runtimeEnv();

export default class AttentionService {
  constructor() {
    this.apiHandler = axios.create({
      baseURL: `${env.REACT_APP_API_URL}/attention`,
      withCredentials: true,
    });
  }

  getCourseAttention = (courseId) =>
    this.apiHandler.get(`/getAttention/${courseId}`);
  saveAttention = (markInfo) => this.apiHandler.post(`/newAttention`, markInfo);
 
}
