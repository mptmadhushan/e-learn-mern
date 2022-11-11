import runtimeEnv from "@mars/heroku-js-runtime-env";
import axios from "axios";

const env = runtimeEnv();

export default class MarksService {
  constructor() {
    this.apiHandler = axios.create({
      baseURL: `${env.REACT_APP_API_URL}/marks`,
      withCredentials: true,
    });
  }

  getCourseMarks = (courseId) =>
    this.apiHandler.get(`/getMarks/${courseId}`);
  saveMark = (markInfo) => this.apiHandler.post(`/newMark`, markInfo);
 
}
