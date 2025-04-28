import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import * as Yup from "yup";
import { useFormik } from "formik";
import { loginAPI, resetLoginFlag, socialLogin } from "../../slices/thunks";
import smallest from "../../assets/images/smallest.png";
import { createSelector } from 'reselect';
import { loginSuccess } from 'slices/auth/login/reducer';
import config from 'config';
import { showErrorToast, showSuccessToast } from 'slices/layouts/toastService';

const Login = (props: any) => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate(); // Get the navigate function

    const selectLayoutState = (state: any) => state;
    const loginpageData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.Account.user,
            error: state.Login.error,
            errorMsg: state?.Login?.errorMsg,
        })
    );

    const { user, error, errorMsg } = useSelector(loginpageData);

    const [userLogin, setUserLogin] = useState<any>([]);
    const [passwordShow, setPasswordShow] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);

    const { commonText } = config;
    useEffect(() => {

        if (user && (user.email !== userLogin.email || user.confirm_password !== userLogin.password)) {
            const updatedUserData = user.email;
            const updatedUserPassword = user.confirm_password || ""; // Adjust as necessary
            setUserLogin({
                email: updatedUserData,
                password: updatedUserPassword
            });
        }
    }, [user, userLogin.email, userLogin.password]);
    const emailValidationRegex = /^[a-z0-9._%+-]{3,}@[a-z0-9.-]{3,}\.[a-z]{2,}$/;

    const validation: any = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: userLogin.email,
            password: userLogin.password,
        },
        validationSchema: Yup.object({
            email: Yup.string()
            .matches(emailValidationRegex, "Enter valid email!!")
            .required("Please Enter Your Email"),
            password: Yup.string().required("Please Enter Your Password"),
        }),
        onSubmit: async (values) => {
            setLoader(true);
            try {
                const response = await dispatch(loginAPI(values, navigate));

                if (!response || response.error) {
                    showErrorToast(response.error);
                    setLoader(false);
                    // Handle error display if needed
                } else if (response.token) {
                    showSuccessToast("Login Successfully");
                    dispatch(loginSuccess(response));
                    navigate('/dashboard');
                } else {
                    setLoader(false);
                    showErrorToast(response.message);
                }
            } catch (error: any) {
                // Check if the error has a response property (Axios errors usually have this)
                if (error.response && error.response.data) {
                    const apiMessage = error.response.data.message; // Extract the message from the response
                    showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
                } else {
                    // Fallback for other types of errors
                    showErrorToast(error.message || "Something went wrong");
                }
                setLoader(false);
            }
        }
    });

    const signIn = (type: any) => {
        dispatch(socialLogin(type, navigate));
    };

    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
                setLoader(false);
            }, 3000);
        }
    }, [dispatch, errorMsg]);

    document.title = "SignIn | " + commonText.PROJECT_NAME ;
    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={smallest} alt="" height="100" />
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
                                            <h5 className="text-primary">Welcome Back!</h5>
                                            <p className="text-muted">Sign in to continue to {commonText.PROJECT_NAME}.</p>
                                        </div>
                                        {error && <Alert color="danger">{error}</Alert>}
                                        <div className="p-2 mt-4">
                                            <Form onSubmit={validation.handleSubmit}>
                                                <div className="mb-3">
                                                    <Label htmlFor="email" className="form-label">Email</Label>
                                                    <Input
                                                        name="email"
                                                        className="form-control"
                                                        placeholder="Enter email"
                                                        type="email"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.email || ""}
                                                        autoComplete="off"
                                                        invalid={validation.touched.email && Boolean(validation.errors.email)}
                                                    />
                                                    {validation.touched.email && validation.errors.email && (
                                                        <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <Label className="form-label" htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Enter Password"
                                                            autoComplete="new-password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.password && Boolean(validation.errors.password)}
                                                        />
                                                        {validation.touched.password && validation.errors.password && (
                                                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                        )}
                                                        <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" onClick={() => setPasswordShow(!passwordShow)}>
                                                            <i className="ri-eye-fill align-middle"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="form-check">
                                                        <Input className="form-check-input" type="checkbox" id="auth-remember-check" />
                                                        <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                                    </div>
                                                    <div>
                                                        <Link to="/forgot-password" className="text-muted">Forgot password?</Link>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <Button color="success" disabled={loader} className="btn btn-success w-100" type="submit">
                                                        {loader && <Spinner size="sm" className='me-2'> Loading... </Spinner>}
                                                        Sign In
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* <div className="mt-4 text-center">
                                    <p className="mb-0">Don't have an account? <Link to="/register" className="fw-semibold text-primary text-decoration-underline"> Signup </Link></p>
                                </div> */}
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default Login;
