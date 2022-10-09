import React, { Component } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player";
import CoursesService from "./../../../service/courses.service";
import CommentsService from "./../../../service/comments.service";
import AddComments from "./../../shared/AddComments/AddComments";
import Loader from "./../../shared/Spinner/Loader";
import Webcam from "react-webcam";

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
        age: "",
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
     
      links: [
        "https://www.simplilearn.com/tutorials/machine-learning-tutorial/bagging-in-machine-learning",
        "https://prwatech.in/blog/machine-learning/bagging-technique-in-machine-learning/",
        "https://machinelearningmastery.com/bagging-and-random-forest-ensemble-algorithms-for-machine-learning/",
        "https://www.statology.org/bagging-machine-learning/",
        "https://www.educba.com/machine-learning-algorithms/",
      ],
    };
    this.coursesService = new CoursesService();
    this.commentsService = new CommentsService();
  }

  componentDidMount = () => {
    this.refreshCourse();
    const user = localStorage.getItem("user");
    console.log("🚀 ~~ user", user);
    this.setState({
      user: user,
    });
    // this.capture()
    setInterval(this.capture, 10000);
  };
  async sendData(reader) {
    console.log(
      "🚀 ~ file: Course-details.js ~ line 71 ~ CourseDetails ~ sendData ~ reader",
      reader
    );
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
      this.props.handleToast(true, 'Emotion detected', '#f8d7da')
    } catch (error) {
      console.log(error);
    }
  }

  //   setRef = (webcam) => {
  //     this.webcam = webcam;
  //   };

  capture = () => {
    const imageSrc = this.refs.webcam.getScreenshot();
    console.log(
      "🚀 ~ file: Course-details.js ~ line 72 ~ CourseDetails ~ imageSrc",
      imageSrc
    );
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "File name", { type: "image/png" });
        console.log("🚀 ~ file: index.js ~ line 84 ~ .then ~ file", file);
        // setSelectedFile(file);
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          this.setState({ emoImage: reader.result });
        });
        reader.readAsDataURL(file);
        this.sendData(reader);
        console.log("image-->", reader);
      });
  };
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

  refreshCourse = () => {
    const course_id = this.props.match.params.course_id;
    const getCourse = this.coursesService.getCourse(course_id);
    console.log(
      "🚀 ~ file: Course-details.js ~ line 34 ~ CourseDetails ~ getCourse",
      getCourse
    );

    const getComments = this.commentsService.getCourseComments(course_id);

    Promise.all([getCourse, getComments])
      .then((res) =>
        this.setState({
          course: res[0].data,
          videoUrl: res[0].data.videos[0],
          comments: res[1].data,
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
    console.log(
      "🚀 ~ file: Course-details.js ~ line 73 ~ CourseDetails ~ answer",
      answer,
      corAnswer
    );

    axios
      .post("http://127.0.0.1:8000/api/v1/suggestions", this.state.course.quiz)
      .then((res) => {
        console.log(res.data);
        this.setState({
          links: res.data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    if (answer === corAnswer) {
      this.props.handleToast(true, "Correct Answer!", "#d4edda");
    } else {
      this.props.handleToast(true, "Wrong Answer!", "#f8d7da");
      this.setState({
        showModal: true,
      });
    }
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

    axios
      .post("http://127.0.0.1:8000/api/v1/fraud-detection", value)
      .then((res) => {
        console.log(res.data);
        this.setState({
          fraud: res.data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
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
                  style={{ position: "fixed",bottom:0,right:0 }}
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
                      hrs.
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
                      {this.state.fraud ? (
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
                        <h3 className="mt-4 mb-4">Quiz:</h3>
                        <h4 className="mt-4 mb-4">{this.state.course.quiz}</h4>
                        <ul className="requirements mb-4">
                          {this.state.course.answer.map((elm, idx) => (
                            <li key={idx} className="pa-2">
                              <p style={{ display: "inline-flex" }}>
                                {idx + 1})
                                <Button
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
                        <Modal
                          show={this.state.showModal}
                          onHide={this.handleClose}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Wrong Answer</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>Please Refer</p>
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
