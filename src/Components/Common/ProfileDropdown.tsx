import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

//import images
import Profile from "../../assets/images/users/avatar-8.jpg";

const ProfileDropdown = () => {

    const profiledropdownData = createSelector(
        (state: any) => state.Profile,
        (user) => user.user
    );
    // Inside your component
    const user = useSelector(profiledropdownData);

    const [userName, setUserName] = useState("Admin");
    const [userPhoto, setUserPhoto] = useState(Profile);
    const userRole = localStorage.getItem("userRole");
    let storeRoleInfo: any;
    if (userRole) {
        storeRoleInfo = JSON.parse(userRole);
    }
    useEffect(() => {
        const authUSer: any = localStorage.getItem("authUser");
        if (authUSer) {
            const obj: any = JSON.parse(authUSer);
            setUserName(obj.user?.firstname + ' ' + obj.user?.lastname);
            setUserPhoto(obj.user?.profile_photo ?? Profile);
        }

    }, [userName, user]);

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={userPhoto}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text"> {userName || "Admin"}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{storeRoleInfo?.role_name}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {userName}!</h6>
                    {/* <DropdownItem className='p-0'>
                        <Link to="/profile" className="dropdown-item">
                            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">Profile</span>
                        </Link>
                    </DropdownItem> */}
                    <DropdownItem className='p-0'>
                        <Link to="/pages-profile-settings" className="dropdown-item"><i
                            className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i> <span
                                className="align-middle">Settings</span>
                        </Link>
                    </DropdownItem>
                    {
                        storeRoleInfo?.role_name === 'Admin' &&
                        <DropdownItem className='p-0'>
                            <Link to="/notification" className="dropdown-item">
                                <i className="mdi mdi-bell text-muted fs-16 align-middle me-1"></i>
                                <span className="align-middle">Send Notification</span>
                            </Link>
                        </DropdownItem>
                    }
                    {/* <DropdownItem className='p-0'>
                        <Link to="/pages-faqs" className="dropdown-item">
                            <i
                                className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle">Help</span>
                        </Link>
                    </DropdownItem> */}
                    <div className="dropdown-divider"></div>
                    <DropdownItem className='p-0'>
                        <Link to="/logout" className="dropdown-item">
                            <i
                                className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle" data-key="t-logout">Logout</span>
                        </Link>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;