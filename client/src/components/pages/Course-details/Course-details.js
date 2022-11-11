import React, { Component } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player";
import CoursesService from "./../../../service/courses.service";
import MarksService from "./../../../service/marks.service";
import AttentionService from "./../../../service/attention.service";
import CommentsService from "./../../../service/comments.service";
import AddComments from "./../../shared/AddComments/AddComments";
import Loader from "./../../shared/Spinner/Loader";
import Webcam from "react-webcam";
import { BroadcastChannel } from 'broadcast-channel';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Image,
  Modal,
} from "react-bootstrap";
import "./Course-details.css";
import axios from "axios";

class CourseDetails extends Component {
  constructor() {
    super();
    this.state = {
      formInfo: {
        amount_of_transaction: "",
        gender: "",
        transaction_hour: "",
        transaction_day: "",
        transaction_month: "",
        age: "", cvv: "",
        card: "",
      },
      course: undefined,
      comments: undefined,
     
      quiz: undefined,
      user: "",
      fraud: "",
      emoImage: "",
      emoResp: "",
      answer: undefined,
      correctAnswer: undefined,
      videoUrl: undefined,
      showModal: false,
      showModalBuy: false,
      isDisable: false,
      marksData: [],
      attentionsData: [],
      hidden: true,
      links: "",
    };

    this.coursesService = new CoursesService();
    this.commentsService = new CommentsService();
    this.marksService = new MarksService();
    this.attentionService = new AttentionService();
  }

  componentDidMount = () => {
    this.refreshCourse();
    this.showQuiz();
    
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("🚀 ~~ user", user);
    this.setState({
      user: user,
    });

    // setInterval(this.capture, 20000);
  };
  async sendData(reader) {
    // console.log(
    //   "🚀 ~ file: Course-details.js ~ line 71 ~ CourseDetails ~ sendData ~ reader",
    //   reader
    // );
    const formData = new FormData();
    formData.append("image", reader);
    try {
      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:8000/api/v1/emotion-detection",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      this.setState({ fraudRes: response });
      console.log(
        "🚀 ~ file: Course-details.js ~ line 83 ~ CourseDetails ~ sendData ~ response",
        response
      );
      this.handleAttentions();
      this.props.handleToast(true, response.data.detected_emotion, "#f8d7da");
      const bc = new window.BroadcastChannel('channel_name');
      bc.postMessage(this.props.loggedUser);
    } catch (error) {
      console.log(error);
      this.handleAttentions();
    }
  }

  capture = () => {
    const imageSrc = this.refs.webcam.getScreenshot();
    console.log("🚀 ~", imageSrc);
    var file = this.dataURLtoFile(imageSrc, "image.jpeg");
    console.log(file);
    this.sendData(file);
  };
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  handleMarks = () => {
   
    const mark = {
      user: this.props.loggedUser._id,
      course: this.state.course._id,
      teacher: this.state.course.owner._id,
      marks: 1,
    };
    console.log("mrks");
    this.marksService
      .saveMark(mark)
      .then(() => {
        // this.props.refreshCourse()
        console.log("hey");
      })
      .catch((err) =>
        this.props.handleToast(
          true,
          "An error has occurred, please try again later",
          "red"
        )
      );
  };
  handleAttentions = () => {
    const attention = {
      user: this.props.loggedUser._id,
      course: this.state.course._id,
      teacher: this.state.course.owner._id,
      attention: "not giving attention",
    };
    console.log("mrks");
    this.attentionService
      .saveAttention(attention)
      .then(() => {
        // this.props.refreshCourse()
        console.log("hey");
      })
      .catch((err) =>
        this.props.handleToast(
          true,
          "An error has occurred, please try again later",
          "red"
        )
      );
  };

  getFileFromBase64(string64, fileName) {
    const trimmedString = string64.replace("dataimage/jpegbase64", "");
    const imageContent = atob(trimmedString);
    const buffer = new ArrayBuffer(imageContent.length);
    const view = new Uint8Array(buffer);

    for (let n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }
    const type = "image/jpeg";
    const blob = new Blob([buffer], { type });
    return new File([blob], fileName, {
      lastModified: new Date().getTime(),
      type,
    });
  }
  handleClose = () => {
    this.setState({
      showModal: false,
    });
  };
  handleShow = () => {
    this.setState({
      showModal: true,
    });
  };
  handleCloseBuy = () => {
    this.setState({
      showModalBuy: false,
    });
  };
  handleShowBuy = () => {
    this.setState({
      showModalBuy: true,
    });
  };

  showQuiz = () => {
    const course_id = this.props.match.params.course_id;
    const getCourse = this.coursesService.getCourse(course_id);
    Promise.all([getCourse])
      .then((res) =>
        setTimeout(() => {
          this.setState({ hidden: false });
        }, res[0].data.duration + "000")
        // console.log("asd", res)
      )
      .catch(() => {
        this.props.handleToast(
          true,
          "An error has occurred, please try again later",
          "#f8d7da"
        );
      });
  };

  refreshCourse = () => {
    const course_id = this.props.match.params.course_id;
    const getCourse = this.coursesService.getCourse(course_id);
    const getCourseMarks = this.marksService.getCourseMarks(course_id);
    const getCourseAttention =
      this.attentionService.getCourseAttention(course_id);

    console.log("🚀 ~ etCourseMarks", this.state.user);
    console.log("🚀 ~  getCourse", getCourse);

    const getComments = this.commentsService.getCourseComments(course_id);

    Promise.all([getCourse, getComments, getCourseMarks, getCourseAttention])
      .then((res) =>
        // console.log('asd',res),
        this.setState({
          course: res[0].data,
          videoUrl: res[0].data.videos[0],
          comments: res[1].data,
          marksData: res[2].data,
          attentionsData: res[3].data,
        })
      )
      .catch(() => {
        this.props.history.push("/courses");
        this.props.handleToast(
          true,
          "An error has occurred, please try again later",
          "#f8d7da"
        );
      });
  };

  deleteComment = (commentId) => {
    this.commentsService
      .deleteComment(commentId)
      .then(() => {
        this.refreshCourse();
        this.props.handleToast(true, "Delete successful!", "#d4edda");
      })
      .catch(() => {
        this.props.history.push("/courses");
        this.props.handleToast(
          true,
          "An error has occurred while deleting, please try again later",
          "#f8d7da"
        );
      });
  };

  handleAnswer = (answer) => {
    const corAnswer = this.state.course.correctAnswer[0];
    
    // console.log(
    //   "🚀 ~ file: Course-details.js ~ line 73 ~ CourseDetails ~ answer",
    //   answer,
    //   corAnswer
    // );
    const value = {
      doc: this.state.course.quiz[0],
    };

    if (answer === corAnswer) {
      this.props.handleToast(true, "Correct Answer!", "#d4edda");
      this.handleMarks();
    } else {
      this.props.handleToast(true, "Wrong Answer!", "#f8d7da");
      this.setState({
        isDisable: true,
      });
      this.getSugg();
      this.setState({
        showModal: true,
      });
    }
  };
  getSugg = () => {
    console.log("api--> sugg");
    var bodyFormData = new FormData();
    bodyFormData.append("doc", this.state.course.quiz[0]);
    const foo = this;
    axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/v1/suggestions",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        //handle success
        console.log(response.data.links);
        foo.setState({
          links: response.data.links,
        });
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  };
  toggleInput = () => this.setState({ showInput: !this.state.showInput });

  setVideoUrl = (url) => this.setState({ videoUrl: url });
  handleInputChange = (e) =>
    this.setState({
      formInfo: { ...this.state.formInfo, [e.target.name]: e.target.value },
    });

  handleSubmit = (e) => {
    e.preventDefault();
    const userData = JSON.parse(this.state.user);
    const d = new Date();

    const month = d.getMonth() + 1; // Month	[mm]	(1 - 12)
    const day = d.getDate(); // Day		[dd]	(1 - 31)
    const hour = d.getHours(); // Year		[yyyy]
    const value = {
      amount_of_transaction: this.state.course.price,
      gender: userData.gender,
      transaction_hour: hour,
      transaction_day: day,
      transaction_month: month,
      age: parseInt(userData.age),
    };
    var bodyFormData = new FormData();
    const foo = this;
    bodyFormData.append("amount_of_transaction", 623.89);
    bodyFormData.append("gender", "female");
    bodyFormData.append("transaction_hour", 23);
    bodyFormData.append("transaction_day", 31);
    bodyFormData.append("transaction_month", 12);
    bodyFormData.append("age", 22);
    axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/v1/fraud-detection",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        //handle success
        console.log(response.data);
        foo.setState({
          fraud: response.data,
        });
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
    // axios
    //   .post("http://127.0.0.1:8000/api/v1/fraud-detection", value)
    //   .then((res) => {
    //     console.log(res.data);
    //     this.setState({
    //       fraud: res.data,
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user",
    };
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Container className="course-details ">
          <Webcam
            audio={false}
            height={350}
            ref="webcam"
            style={{ position: "fixed", bottom: 0, right: 0 }}
            screenshotFormat="image/jpeg"
            width={350}
            videoConstraints={videoConstraints}
          />
          {this.state.course ? (
            <>
              <section className="header">
                <Row>
                  <Col md={{ span: 8 }}>
                    <h1>{this.state.course.title}</h1>
                    <p>
                      <em> {this.state.course.lead}</em>
                    </p>

                    {this.state.course.owner && (
                      <p style={{ color: "#73726c", fontWeight: 700 }}>
                        Created by{" "}
                        <Link to={`/teachers/${this.state.course.owner._id}`}>
                          {this.state.course.owner.name}{" "}
                          {this.state.course.owner.surname}
                        </Link>
                      </p>
                    )}
                    <p>
                      <strong>Category:</strong> {this.state.course.category} |{" "}
                      <strong>Difficulty Level:</strong>{" "}
                      {this.state.course.difficultyLevel} |{" "}
                      <strong>Price:</strong> {this.state.course.price} € |{" "}
                      <strong>Duration:</strong> {this.state.course.duration}{" "}
                      mins.
                    </p>
                  </Col>
                  <Col md={{ span: 4 }}>
                    <img
                      className="mb-3 course-img"
                      src={this.state.course.imageUrl}
                      alt={this.state.course.title}
                    />
                  </Col>
                  <Col md={{ span: 7 }}>
                    <Button
                      onClick={this.handleShowBuy}
                      className="mt-3 mb-3 start-course"
                    >
                      Buy Now
                    </Button>
                  </Col>
                </Row>
                <Modal
                  show={this.state.showModalBuy}
                  onHide={this.handleCloseBuy}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Payment</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={this.handleSubmit}>
                      {!this.state.fraud ? (
                        <div>
                          <Form.Group controlId="username">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                              type="text"
                              disabled
                              name="amount_of_transaction"
                              value={this.state.course.price}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                          <Form.Group controlId="card">
                            <Form.Label>Card Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="card"
                              value={this.state.card}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                          <Form.Group controlId="cvv">
                            <Form.Label>cvv</Form.Label>
                            <Form.Control
                              type="text"
                              name="cvv"
                              value={this.state.cvv}
                              onChange={this.handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      ) : (
                        <p>{this.state.fraud.msg}</p>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <Button variant="dark" type="submit">
                          Submit
                        </Button>
                        <Form.Text id="loginHelpText" muted>
                          Click outside to cancel
                        </Form.Text>
                      </div>
                    </Form>
                  </Modal.Body>
                </Modal>
              </section>

              <section className="course-bckg">
                <Row>
                  <Col>
                  
                      <h3 className="mt-5 mb-3">Description</h3>
                  
                    <p>{this.state.course.description}</p>

                    <h3 className="mt-5 mb-4">What you will learn:</h3>
                    <ul className="whatYouWillLearn">
                      {this.state.course.whatYouWillLearn.map((elm, idx) => (
                        <li key={idx}>
                          <img
                            src="https://res.cloudinary.com/dodneiokm/image/upload/v1607883391/project3-ironhack/checked_ib75gx.png"
                            alt="Checked icon"
                          />
                          <p>{elm}</p>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-4 mb-4">Requirements:</h3>
                    <ul className="requirements mb-4">
                      {this.state.course.requirements.map((elm, idx) => (
                        <li key={idx}>
                          <img
                            src="https://res.cloudinary.com/dodneiokm/image/upload/v1607887317/project3-ironhack/double-check_tm7qmy.png"
                            alt="Double-Checked icon"
                          />
                          <p>{elm}</p>
                        </li>
                      ))}
                    </ul>

                    {this.props.loggedUser ? (
                      <Button
                        onClick={this.toggleInput}
                        className="mt-3 mb-3 start-course"
                      >
                        {this.state.showInput
                          ? "Close media"
                          : "See course media"}
                      </Button>
                    ) : (
                      <Button
                        onClick={this.toggleInput}
                        disabled
                        className="mt-3 mb-3 start-course"
                      >
                        Log In to see media
                      </Button>
                    )}

                    {/* Videos */}
                    {this.state.showInput && (
                      <motion.div
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          duration: 1.2,
                        }}
                      >
                        <Row>
                          <Col md={12} lg={8}>
                            <ReactPlayer
                              width="100%"
                              url={this.state.videoUrl}
                              controls
                            />
                          </Col>

                          <Col md={12} lg={4}>
                            {this.state.course.videos.map((elm, idx) => (
                              <Card.Header className="video-card" key={elm._id}>
                                <img
                                  src="https://res.cloudinary.com/dodneiokm/image/upload/v1607893554/project3-ironhack/play_u6mma0.png"
                                  alt="play icon"
                                  onClick={() => this.setVideoUrl(elm)}
                                />
                                <p style={{ display: "inline-flex" }}>
                                  Lesson {idx + 1}
                                </p>
                              </Card.Header>
                            ))}
                          </Col>
                        </Row>
                      {!this.state.hidden && 
                      <div>
                      <h3 className="mt-4 mb-4">Quiz:</h3>
                        <h4 className="mt-4 mb-4">{this.state.course.quiz}</h4>
                        <ul className="requirements mb-4">
                          {this.state.course.answer.map((elm, idx) => (
                            <li key={idx} className="pa-2">
                              <p style={{ display: "inline-flex" }}>
                                {idx + 1})
                                <Button
                                  disabled={this.state.isDisable}
                                  className="px-4 ml-3"
                                  onClick={() => this.handleAnswer(elm)}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  {elm}
                                </Button>
                              </p>
                            </li>
                          ))}
                        </ul> 
                      </div>}
                        {this.state.user.role === "Teacher" && (
                          <div>
                            <p>Student Marks</p>
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Marks</th>
                              </tr>
                              {this.state.marksData.map((val, key) => {
                                return (
                                  <tr key={key}>
                                    <td>{val.user.username}</td>
                                    <td>{val.marks}</td>
                                  </tr>
                                );
                              })}
                            </table>
                          </div>
                        )}
                        {this.state.user.role === "Teacher" && (
                          <div>
                            <p className="mt-5">Student Attention</p>
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Attention</th>
                              </tr>
                              {this.state.attentionsData.map((val, key) => {
                                return (
                                  <tr key={key}>
                                    <td>{val.user.username}</td>
                                    <td>{val.attention}</td>
                                  </tr>
                                );
                              })}
                            </table>
                          </div>
                        )}
                        <Modal
                          show={this.state.showModal}
                          onHide={this.handleClose}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Wrong Answer</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>Please Refer</p>
                            {this.state.links && (
                              <ul className="requirements mb-4">
                                {this.state.links.map((elm, idx) => (
                                  <li key={idx}>
                                    <Button
                                      className="px-4 mt-1"
                                      onClick={() => window.open(elm, "_blank")}
                                      variant="outline-primary"
                                      size="sm"
                                    >
                                      {elm}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </Modal.Body>
                        </Modal>
                      </motion.div>
                    )}
                  </Col>
                </Row>
              </section>

              {/* Comments */}

              <h3 className="mt-5 mb-3">Comments</h3>

              {this.state.comments.length > 0 ? (
                this.state.comments.map((elm) => (
                  <div className="mb-2" key={elm._id} {...elm}>
                    {elm.user && (
                      <div className="comments-card">
                        <div className="comment-body" style={{ width: "90%" }}>
                          <Image
                            className="avatar"
                            roundedCircle
                            src={elm.user.imageUrl}
                            alt={elm.user.username}
                          />
                          <div
                            className="comment-text"
                            style={{ width: "80%" }}
                          >
                            <p className="mb-0">
                              <strong>
                                {elm.user.username} {elm.timestamps}
                              </strong>
                            </p>
                            <p className="mb-0">
                              <em>" {elm.content} "</em>
                            </p>
                            <small>{elm.createdAt}</small>
                          </div>
                        </div>
                        {this.props.loggedUser &&
                        this.props.loggedUser._id === elm.user._id ? (
                          <Button
                            onClick={() => this.deleteComment(elm._id)}
                            variant="outline-danger"
                            size="sm"
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="mb-3 ml-3">No comments yet</p>
              )}

              {this.props.loggedUser && (
                <section>
                  <AddComments
                    refreshCourse={this.refreshCourse}
                    courseId={this.state.course._id}
                    loggedUser={this.props.loggedUser}
                    history={this.props.history}
                    handleToast={this.props.handleToast}
                  />
                </section>
              )}

              <Link to="/courses" className="btn btn-sm btn-outline-dark mt-5">
                Go back
              </Link>
            </>
          ) : (
            <Loader />
          )}
        </Container>
      </motion.div>
    );
  }
}

export default CourseDetails;
