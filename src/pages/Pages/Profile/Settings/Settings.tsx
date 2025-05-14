import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Container, Form, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from "classnames";

import * as Yup from "yup";
//import images
import Profile from "../../../../assets/images/users/avatar-8.jpg";
import { useFormik } from 'formik';
import { changePassword, updatePatchUser, updateUser } from 'Services/UserService';
import config from 'config';
import { showErrorToast, showSuccessToast, showWarningToast } from 'slices/layouts/toastService';
import { strictNameValidation } from 'Components/Common/Namevalidation';

export const USERS_ENDPOINT = "/users";


const Settings: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState("1");
    const { commonText } = config;

    const tabChange = (tab: any) => {
        if (activeTab !== tab) setActiveTab(tab);
    };
    const [userPhoto, setUserPhoto] = useState(Profile);
    const [authUserInfo, setAuthUserInfo] = useState<any>();
    const [user, setUser] = useState<any>(null);
    document.title = `Profile Settings | ${ commonText.PROJECT_NAME } Admin`;
    useEffect(() => {
        const authUSer: any = localStorage.getItem("authUser");
        if (authUSer) {
            const obj: any = JSON.parse(authUSer);
            setAuthUserInfo(obj);
            setUser(obj.user);
            setUserPhoto(obj.user.profile_photo);
        }

    }, []);

    const userSchema = Yup.object().shape({
        firstname: strictNameValidation.required("First name is required"),
        lastname: strictNameValidation.required("Last name is required"),
        mobile_number: Yup.string().required("Mobile number is required").matches(
            /^(?:\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/,
            "Mobile number must be 10 digits"
        ),
        // profile_photo: Yup.string().url("Invalid URL")
    });
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const changePasswordSchema = Yup.object().shape({
        oldpassword: Yup.string()
            .matches(passwordRegex, "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!")
            .required("Old password is required"),
        newpassword: Yup.string()
            .matches(passwordRegex, "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!")
            .required("New password is required")
            .notOneOf([Yup.ref('oldpassword'), null], 'New password must be different from the old password'),
        confirmpassword: Yup.string()
            .matches(passwordRegex, "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!")
            .oneOf([Yup.ref('newpassword'), ""], 'Passwords must match')
            .required("Confirm password is required"),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: user?.id || null,
            firstname: user?.firstname ?? "",
            lastname: user?.lastname ?? "",
            address: user?.address ?? "",
            mobile_number: user?.mobile_number ?? "",
            profile_photo: user?.profile_photo ?? Profile
        },
        validationSchema: userSchema,
        onSubmit: (values) => {
            // Prepare FormData object 
            if (values.id !== null) {
                handleUpdateUser(values.id, values);
            }
        }
    });
    const passwordformik = useFormik({
        enableReinitialize: true,
        initialValues: {
            oldpassword: "",
            newpassword: "",
            confirmpassword: "",
        },
        validationSchema: changePasswordSchema,
        onSubmit: (values) => {
            // Prepare FormData object  
            handleChangePassword(values);
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check the file extension
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension && allowedExtensions.includes(fileExtension)) {
                setSelectedImage(file); // Save the file object directly
                formik.setFieldValue('profile_photo', file);
            } else {
                showWarningToast("Invalid file type");
                e.target.value = ''; // Clear the file input
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const { key } = event;
        const inputElement = event.target as HTMLInputElement;
        const cursorPosition = inputElement.selectionStart ?? 0; // Fallback to 0 if null
        const currentValue = inputElement.value;

        // Prevent space at the start or multiple consecutive spaces
        if (
            key === " " &&
            (cursorPosition === 0 || currentValue[cursorPosition - 1] === " ")
        ) {
            event.preventDefault();
        }
    };

    const handleChangePassword = async (values: any) => {
        // setRoleData((prevData) =>
        //   prevData.map((role) => (role.id === id ? { ...role, ...values } : role))
        // );
        // validation.resetForm();
        try {
            const obj = {
                oldPassword: values.oldpassword,
                newPassword: values.newpassword
            }
            const response = await changePassword(obj);
            // showSuccessToast("Password change successfully");
            showSuccessToast(response?.message);

            passwordformik.resetForm();
        } catch (error: any) {
            // Check if the error has a response property (Axios errors usually have this)
            if (error.response && error.response.data) {
                const apiMessage = error.response.data.message; // Extract the message from the response
                showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
            } else {
                // Fallback for other types of errors
                showErrorToast(error.message || "Something went wrong");
            }
            // if (error.response) {
            //     const errorMessage = error.response.data.message || 'An error occurred'; // Adjust based on your API structure
            //     console.error('Error Response:', errorMessage);

            //     // Show the error message using toast
            //     showErrorToast(errorMessage);
            // } else {
            //     // Handle network or unexpected errors
            //     console.error('Unexpected Error:', error);
            //     showErrorToast('An unexpected error occurred. Please try again later.');
            // }
        }
    };

    const handleUpdateUser = async (id: number, updatedUserData: any) => {
        try {
            const formData = new FormData();

            if (selectedImage) {
                formData.append('profile_photo', selectedImage); // If a new image is selected
            }
            formData.append('id', updatedUserData.id.toString());
            formData.append('firstname', updatedUserData.firstname);
            formData.append('lastname', updatedUserData.lastname);
            formData.append('address', updatedUserData.address);
            formData.append('mobile_number', updatedUserData.mobile_number);

            const updatedUser = await updatePatchUser(id, formData);
            if (updatedUser.user) {
                const obj = {
                    berber: authUserInfo.barber,
                    salon: authUserInfo.salon,
                    token: authUserInfo.token,
                    user: updatedUser.user
                }
                localStorage.setItem("authUser", JSON.stringify(obj));
                showSuccessToast("User updated successfully");
                // Make sure updatedUsers is of type User[]
                setUser(updatedUser.user);
                setUserPhoto(updatedUser.user.profile_photo);

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
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <div className="position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg profile-setting-img">
                            <img src={userPhoto} className="profile-wid-img" alt="" />
                            <div className="overlay-content">
                                <div className="text-end p-3">
                                    <div className="p-0 ms-auto rounded-circle profile-photo-edit">
                                        <Input id="profile-foreground-img-file-input" type="file"
                                            className="profile-foreground-img-file-input" />
                                        {/* <Label htmlFor="profile-foreground-img-file-input"
                                            className="profile-photo-edit btn btn-light">
                                            <i className="ri-image-edit-line align-bottom me-1"></i> Change Cover
                                        </Label> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col xxl={3}>
                            <Card className="mt-n5">
                                <CardBody className="p-4">
                                    <div className="text-center">
                                        {/* {formik.values.profile_photo} */}
                                        <div className="profile-user position-relative d-inline-block mx-auto  mb-4">
                                            <img src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : userPhoto ? userPhoto : Profile}
                                                className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                                                alt="user-profile" />
                                            <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                <Input id="profile-img-file-input" type="file"
                                                    className="profile-img-file-input"
                                                    onChange={handleImageChange}
                                                    accept="image/*" />
                                                <Label htmlFor="profile-img-file-input"
                                                    className="profile-photo-edit avatar-xs">
                                                    <span className="avatar-title rounded-circle bg-light text-body">
                                                        <i className="ri-camera-fill"></i>
                                                    </span>
                                                </Label>
                                            </div>
                                        </div>
                                        <h5 className="fs-16 mb-1">{user?.firstname} {user?.lastname}</h5>
                                        <p className="text-muted mb-0">{user?.role?.role_name}</p>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* <Card>
                                <CardBody>
                                    <div className="d-flex align-items-center mb-5">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title mb-0">Complete Your Profile</h5>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Link to="#" className="badge bg-light text-primary fs-12"><i
                                                className="ri-edit-box-line align-bottom me-1"></i> Edit</Link>
                                        </div>
                                    </div>
                                    <div className="progress animated-progress custom-progress progress-label">
                                        <div className="progress-bar bg-danger" role="progressbar" style={{ "width": "30%" }}>
                                            <div className="label">30%</div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card> */}

                        </Col>

                        <Col xxl={9}>
                            <Card className="mt-xxl-n5">
                                <CardHeader>
                                    <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                                        role="tablist">
                                        <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "1" })}
                                                onClick={() => {
                                                    tabChange("1");
                                                }}
                                                type="button">
                                                <i className="fas fa-home"></i>
                                                Personal Details
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "2" })}
                                                onClick={() => {
                                                    tabChange("2");
                                                }}
                                                type="button">
                                                <i className="far fa-user"></i>
                                                Change Password
                                            </NavLink>
                                        </NavItem>

                                    </Nav>
                                </CardHeader>
                                <CardBody className="p-4">
                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId="1">
                                            <Form onSubmit={formik.handleSubmit}>
                                                <Row>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="firstname" className="form-label">First
                                                                Name</Label>
                                                            <Input type="text" id="firstname"
                                                                value={formik.values.firstname}
                                                                onKeyDown={handleKeyDown}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}

                                                                placeholder="Enter your firstname" className={
                                                                    formik.touched.firstname && formik.errors.firstname
                                                                        ? "form-control is-invalid"
                                                                        : "form-control"
                                                                } />
                                                            {/* {formik.touched.firstname && formik.errors.firstname && (
                                                                <div className="invalid-feedback">
                                                                    {formik.errors.firstname}
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="lastname" className="form-label">Last
                                                                Name</Label>
                                                            <Input type="text" id="lastname"
                                                                placeholder="Enter your lastname" value={formik.values.lastname}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                onKeyDown={handleKeyDown}
                                                                className={
                                                                    formik.touched.lastname && formik.errors.lastname
                                                                        ? "is-invalid"
                                                                        : ""
                                                                } />
                                                            {/* {formik.touched.lastname && formik.errors.lastname && (
                                                                <div className="invalid-feedback">
                                                                    {formik.errors.lastname}
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="address" className="form-label">Address</Label>
                                                            <Input type="text" className="form-control" id="address"
                                                                placeholder="Enter address"
                                                                value={formik.values.address}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="mobile_number"
                                                                className="form-label">Mobile Number</Label>
                                                            <Input
                                                                type="tel"
                                                                id="mobile_number"
                                                                placeholder="Enter Mobile Number"
                                                                value={formik.values.mobile_number}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className={
                                                                    formik.touched.mobile_number &&
                                                                        formik.errors.mobile_number
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col lg={12}>
                                                        <div className="hstack gap-2 justify-content-end">
                                                            <button type="submit"
                                                                className="btn btn-primary">Save</button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </TabPane>

                                        <TabPane tabId="2">
                                            <Form onSubmit={passwordformik.handleSubmit}>
                                                <Row className="g-2">
                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="oldpassword" className="form-label">Old
                                                                Password*</Label>
                                                            <Input type="password"
                                                                id="oldpassword"
                                                                placeholder="Enter current password"
                                                                value={passwordformik.values.oldpassword}
                                                                onChange={passwordformik.handleChange}
                                                                onBlur={passwordformik.handleBlur} className={
                                                                    passwordformik.touched.oldpassword && passwordformik.errors.oldpassword
                                                                        ? "form-control is-invalid"
                                                                        : "form-control"
                                                                } />
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="newpassword" className="form-label">New
                                                                Password*</Label>
                                                            <Input type="password"
                                                                id="newpassword" placeholder="Enter new password"
                                                                value={passwordformik.values.newpassword}
                                                                onChange={passwordformik.handleChange}
                                                                onBlur={passwordformik.handleBlur} className={
                                                                    passwordformik.touched.newpassword && passwordformik.errors.newpassword
                                                                        ? "form-control is-invalid"
                                                                        : "form-control"
                                                                } />
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="confirmpassword" className="form-label">Confirm
                                                                Password*</Label>
                                                            <Input type="password"
                                                                id="confirmpassword"
                                                                placeholder="Confirm password" value={passwordformik.values.confirmpassword}
                                                                onChange={passwordformik.handleChange}
                                                                onBlur={passwordformik.handleBlur} className={
                                                                    passwordformik.touched.confirmpassword && passwordformik.errors.confirmpassword
                                                                        ? "form-control is-invalid"
                                                                        : "form-control"
                                                                } />
                                                        </div>
                                                    </Col>

                                                    <Col lg={12}>
                                                        <div className="text-end">
                                                            <button type="submit" className="btn btn-success">Change
                                                                Password</button>
                                                        </div>
                                                    </Col>

                                                </Row>

                                            </Form>
                                        </TabPane>



                                        <TabPane tabId="4">
                                            <div className="mb-4 pb-2">
                                                <h5 className="card-title text-decoration-underline mb-3">Security:</h5>
                                                <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fs-14 mb-1">Two-factor Authentication</h6>
                                                        <p className="text-muted">Two-factor authentication is an enhanced
                                                            security meansur. Once enabled, you'll be required to give
                                                            two types of identification when you log into Google
                                                            Authentication and SMS are Supported.</p>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-sm-3">
                                                        <Link to="#"
                                                            className="btn btn-sm btn-primary">Enable Two-facor
                                                            Authentication</Link>
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fs-14 mb-1">Secondary Verification</h6>
                                                        <p className="text-muted">The first factor is a password and the
                                                            second commonly includes a text with a code sent to your
                                                            smartphone, or biometrics using your fingerprint, face, or
                                                            retina.</p>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-sm-3">
                                                        <Link to="#" className="btn btn-sm btn-primary">Set
                                                            up secondary method</Link>
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fs-14 mb-1">Backup Codes</h6>
                                                        <p className="text-muted mb-sm-0">A backup code is automatically
                                                            generated for you when you turn on two-factor authentication
                                                            through your iOS or Android Twitter app. You can also
                                                            generate a backup code on twitter.com.</p>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-sm-3">
                                                        <Link to="#"
                                                            className="btn btn-sm btn-primary">Generate backup codes</Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <h5 className="card-title text-decoration-underline mb-3">Application Notifications:</h5>
                                                <ul className="list-unstyled mb-0">
                                                    <li className="d-flex">
                                                        <div className="flex-grow-1">
                                                            <label htmlFor="directMessage"
                                                                className="form-check-label fs-14">Direct messages</label>
                                                            <p className="text-muted">Messages from people you follow</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                                <Input className="form-check-input" type="checkbox"
                                                                    role="switch" id="directMessage" defaultChecked />
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="desktopNotification">
                                                                Show desktop notifications
                                                            </Label>
                                                            <p className="text-muted">Choose the option you want as your
                                                                default setting. Block a site: Next to "Not allowed to
                                                                send notifications," click Add.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                                <Input className="form-check-input" type="checkbox"
                                                                    role="switch" id="desktopNotification" defaultChecked />
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="emailNotification">
                                                                Show email notifications
                                                            </Label>
                                                            <p className="text-muted"> Under Settings, choose Notifications.
                                                                Under Select an account, choose the account to enable
                                                                notifications for. </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                                <Input className="form-check-input" type="checkbox"
                                                                    role="switch" id="emailNotification" />
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="chatNotification">
                                                                Show chat notifications
                                                            </Label>
                                                            <p className="text-muted">To prevent duplicate mobile
                                                                notifications from the Gmail and Chat apps, in settings,
                                                                turn off Chat notifications.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                                <Input className="form-check-input" type="checkbox"
                                                                    role="switch" id="chatNotification" />
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="d-flex mt-2">
                                                        <div className="flex-grow-1">
                                                            <Label className="form-check-label fs-14"
                                                                htmlFor="purchaesNotification">
                                                                Show purchase notifications
                                                            </Label>
                                                            <p className="text-muted">Get real-time purchase alerts to
                                                                protect yourself from fraudulent charges.</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="form-check form-switch">
                                                                <Input className="form-check-input" type="checkbox"
                                                                    role="switch" id="purchaesNotification" />
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="card-title text-decoration-underline mb-3">Delete This
                                                    Account:</h5>
                                                <p className="text-muted">Go to the Data & Privacy section of your profile
                                                    Account. Scroll to "Your data & privacy options." Delete your
                                                    Profile Account. Follow the instructions to delete your account :
                                                </p>
                                                <div>
                                                    <Input type="password" className="form-control" id="passwordInput"
                                                        placeholder="Enter your password" defaultValue="make@321654987"
                                                        style={{ maxWidth: "265px" }} />
                                                </div>
                                                <div className="hstack gap-2 mt-3">
                                                    <Link to="#" className="btn btn-soft-danger">Close &
                                                        Delete This Account</Link>
                                                    <Link to="#" className="btn btn-light">Cancel</Link>
                                                </div>
                                            </div>
                                        </TabPane>
                                    </TabContent>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Settings;