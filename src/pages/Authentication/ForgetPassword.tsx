import PropTypes from "prop-types";
import React, { useState } from "react";
import { Row, Col, Alert, Card, CardBody, Container, FormFeedback, Input, Label, Form, Spinner } from "reactstrap";

//redux
import { useDispatch } from "react-redux";

import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { userForgetPassword } from "../../slices/thunks";

// import images
// import profile from "../../assets/images/bg.png";
import logoLight from "../../assets/images/smallest.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";
import { toast, ToastContainer } from "react-toastify";
import config from "config";

const { commonText } = config;
const ForgetPasswordPage = (props: any) => {
  const [loader, setLoader] = useState<boolean>(false);

  const emailValidationRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().matches(emailValidationRegex, "Enter valid email!!").required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      try {
        setLoader(true);
        // Dispatch the forgot password action with the email value
        const response = await userForgetPassword(values.email);

        if (!response || response.error) {
          toast.error(response.error, { autoClose: 3000 });
          setLoader(false);
          return;
          // Handle error display if needed
        }
        validation.resetForm();
        toast.success("Send email Successfully", { autoClose: 3000 });
        setLoader(false);
      } catch (error: any) {
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster 
          setLoader(false);
        } else {
          // Fallback for other types of errors
          toast.error(error.message || "Something went wrong");
          setLoader(false);
        }
      }
    },
  });
 
  return (
    <ParticlesAuth>
      <div className="auth-page-content mt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <div>
                  <Link to="/" className="d-inline-block auth-logo">
                    <img src={logoLight} alt="" height="100" />
                  </Link>
                </div>
                <p className="mt-3 fw-medium fs-3">{commonText.PROJECT_NAME} Admin</p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Forgot Password?</h5>
                    <p className="text-muted">Reset password with {commonText.PROJECT_NAME}</p>
                    <i className="ri-mail-send-line display-5 text-success mb-3"></i>
                  </div>

                  <Alert className="border-0 alert-warning text-center mb-2 mx-2" role="alert">
                    Enter your email and instructions will be sent to you!
                  </Alert>

                  <Form onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit();
                    return false;
                  }}>
                    <div className="mb-4">
                      <Label className="form-label">Email</Label>
                      <Input
                        name="email"
                        className="form-control"
                        placeholder="Enter email"
                        type="email"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.email || ""}
                        invalid={validation.touched.email && validation.errors.email ? true : false}
                      />
                      {validation.touched.email && validation.errors.email ? (
                        <FormFeedback type="invalid">
                          <div>{validation.errors.email}</div>
                        </FormFeedback>
                      ) : null}
                    </div>

                    <div className="text-center mt-4">
                      <button className="btn btn-success w-100" type="submit" disabled={loader}>
                      {loader && <Spinner size="sm" className='me-2'> Loading... </Spinner>}
                        Send
                      </button>
                    </div>
                  </Form>
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Click here</Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <ToastContainer closeButton={false} limit={1} />
    </ParticlesAuth>
  );
};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
