import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Form,
  Input,
  Label,
  FormFeedback,
  Spinner,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import logoLight from "../../assets/images/smallest.png";
import config from "config";
import { postSetPassword } from "Services/AuthService";

//formik
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";

const BasicPasswCreate = () => {
  const { commonText } = config;
  const navigate = useNavigate();

  document.title = "Create New Password | Shear Brilliance";
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [passwordShow, setPasswordShow] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [confrimPasswordShow, setConfrimPasswordShow] =
    useState<boolean>(false);

  // Example: Get a specific query parameter
  const token = queryParams.get("token");
  useEffect(() => {
    debugger;
  }, []);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(RegExp("(.*[a-z].*)"), "At least lowercase letter")
        .matches(RegExp("(.*[A-Z].*)"), "At least uppercase letter")
        .matches(RegExp("(.*[0-9].*)"), "At least one number")
        .required("This field is required"),
      confirm_password: Yup.string()
        .oneOf(
          [Yup.ref("password"), undefined],
          "Passwod & Confirm password does not match"
        )
        .required("Confirm Password is required"),
    }),

    // Inside your validation.onSubmit method:
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setLoader(true);
      try {
        // Prepare the payload with token and new password
        const payload = {
          token: token, // Use provided token or default
          newPassword: values.password,
        };

        // Call the API method with the payload
        const response = await postSetPassword(payload);
        var data: any = await response;

        // Check if the response indicates failure (success: false)
        if (!data.success) {
          toast.error(data.message); // Show the error message as a toast
          setLoader(false);
        } else {
          toast.success("Password reset successfully!"); // Success case, optional
          setLoader(false);
          navigate("/signin");
        }
      } catch (error: any) {
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          toast.error(error.message || "Something went wrong");
          setLoader(false);
        }
      } finally {
        setLoader(false);
        setSubmitting(false);
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
                  <Link to="/#" className="d-inline-block auth-logo">
                    <img src={logoLight} alt="" height="100" />
                  </Link>
                </div>
                <p className="mt-3 fs-15 fw-medium">
                  {commonText.PROJECT_NAME} Admin
                </p>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Create new password</h5>
                    <p className="text-muted">
                      Your new password must be different from previous used
                      password.
                    </p>
                  </div>

                  <div className="p-2">
                    <Form
                      onSubmit={validation.handleSubmit}
                      action="/reset-password"
                    >
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="password-input">
                          Password
                        </Label>
                        <div className="position-relative auth-pass-inputgroup">
                          <Input
                            type={passwordShow ? "text" : "password"}
                            className="form-control pe-5 password-input"
                            placeholder="Enter password"
                            id="password-input"
                            name="password"
                            value={validation.values.password}
                            onBlur={validation.handleBlur}
                            onChange={validation.handleChange}
                            invalid={
                              validation.errors.password &&
                              validation.touched.password
                                ? true
                                : false
                            }
                          />
                          {validation.errors.password &&
                          validation.touched.password ? (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          ) : null}
                          <Button
                            color="link"
                            onClick={() => setPasswordShow(!passwordShow)}
                            className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                            id="password-addon"
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </Button>
                        </div>
                        <div id="passwordInput" className="form-text">
                          Must be at least 8 characters.
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label
                          className="form-label"
                          htmlFor="confirm-password-input"
                        >
                          Confirm Password
                        </Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <Input
                            type={confrimPasswordShow ? "text" : "password"}
                            className="form-control pe-5 password-input"
                            placeholder="Confirm password"
                            id="confirm-password-input"
                            name="confirm_password"
                            value={validation.values.confirm_password}
                            onBlur={validation.handleBlur}
                            onChange={validation.handleChange}
                            invalid={
                              validation.errors.confirm_password &&
                              validation.touched.confirm_password
                                ? true
                                : false
                            }
                          />
                          {validation.errors.confirm_password &&
                          validation.touched.confirm_password ? (
                            <FormFeedback type="invalid">
                              {validation.errors.confirm_password}
                            </FormFeedback>
                          ) : null}
                          <Button
                            color="link"
                            onClick={() =>
                              setConfrimPasswordShow(!confrimPasswordShow)
                            }
                            className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </Button>
                        </div>
                      </div>

                      <div
                        id="password-contain"
                        className="p-3 bg-light mb-2 rounded"
                      >
                        <h5 className="fs-13">Password must contain:</h5>
                        <p id="pass-length" className="invalid fs-12 mb-2">
                          Minimum <b>8 characters</b>
                        </p>
                        <p id="pass-lower" className="invalid fs-12 mb-2">
                          At <b>lowercase</b> letter (a-z)
                        </p>
                        <p id="pass-upper" className="invalid fs-12 mb-2">
                          At least <b>uppercase</b> letter (A-Z)
                        </p>
                        <p id="pass-number" className="invalid fs-12 mb-0">
                          A least <b>number</b> (0-9)
                        </p>
                      </div>

                      {/* <div className="form-check">
                                                <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                            </div> */}

                      <div className="mt-4">
                        <Button
                          color="success"
                          className="w-100"
                          type="submit"
                          disabled={loader}
                        >
                          {loader && (
                            <Spinner size="sm" className="me-2">
                              {" "}
                              Loading...{" "}
                            </Spinner>
                          )}
                          Reset Password
                        </Button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Wait, I remember my password...{" "}
                  <Link
                    to="/login"
                    className="fw-semibold text-primary text-decoration-underline"
                  >
                    {" "}
                    Click here{" "}
                  </Link>{" "}
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

export default BasicPasswCreate;
