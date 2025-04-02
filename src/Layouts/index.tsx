import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import withRouter from '../Components/Common/withRouter';

//import Components
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import RightSidebar from '../Components/Common/RightSidebar';

//import actions
import {
    changeLayout,
    changeSidebarTheme,
    changeLayoutMode,
    changeLayoutWidth,
    changeLayoutPosition,
    changeTopbarTheme,
    changeLeftsidebarSizeType,
    changeLeftsidebarViewType,
    changeSidebarImageType,
    changeSidebarVisibility
} from "../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';
import Loader from 'Components/Common/Loader';
import { fetchPaymentConfig } from 'Services/ConfigurationService';
import { showErrorToast } from 'slices/layouts/toastService';

const Layout = (props: any) => {
    const [headerClass, setHeaderClass] = useState("");
    const [roleInfo, setRoleInfo] = useState();
    const [userInfo, setUserInfo] = useState();
    const [salonUserInfo, setSalonUserInfo] = useState();
    const [showLoader, setShowLoader] = useState(false);
    const [paymentMode, setpaymentMode] = useState();

    const dispatch: any = useDispatch();

    const selectLayoutState = (state: any) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            layoutType: layout.layoutType,
            leftSidebarType: layout.leftSidebarType,
            layoutModeType: layout.layoutModeType,
            layoutWidthType: layout.layoutWidthType,
            layoutPositionType: layout.layoutPositionType,
            topbarThemeType: layout.topbarThemeType,
            leftsidbarSizeType: layout.leftsidbarSizeType,
            leftSidebarViewType: layout.leftSidebarViewType,
            leftSidebarImageType: layout.leftSidebarImageType,
            preloader: layout.preloader,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
        })
    );
    // Inside your component
    const {
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        sidebarVisibilitytype
    } = useSelector(selectLayoutProperties);

    /*
    layout settings
    */
    useEffect(() => {
        if (
            layoutType ||
            leftSidebarType ||
            layoutModeType ||
            layoutWidthType ||
            layoutPositionType ||
            topbarThemeType ||
            leftsidbarSizeType ||
            leftSidebarViewType ||
            leftSidebarImageType ||
            sidebarVisibilitytype
        ) {
            window.dispatchEvent(new Event('resize'));
            dispatch(changeLeftsidebarViewType(leftSidebarViewType));
            dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
            dispatch(changeSidebarTheme(leftSidebarType));
            dispatch(changeLayoutMode(layoutModeType));
            dispatch(changeLayoutWidth(layoutWidthType));
            dispatch(changeLayoutPosition(layoutPositionType));
            dispatch(changeTopbarTheme(topbarThemeType));
            dispatch(changeLayout(layoutType));
            dispatch(changeSidebarImageType(leftSidebarImageType));
            dispatch(changeSidebarVisibility(sidebarVisibilitytype));
        }
    }, [layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        sidebarVisibilitytype,
        dispatch]);
    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (value: any) => {
        if (changeLayoutMode) {
            dispatch(changeLayoutMode(value));
        }
    };
    /*
    call dark/light mode
    */
    const changeShowLoader = (value: any) => {
        setShowLoader(value);
    };

    // class add remove in header 
    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
    });
    useEffect(() => {
        const fetchPaymentConfigData = async () => {
            try {
                const response: any = await fetchPaymentConfig();
                setpaymentMode(response?.enableOnlinePayment);
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

        fetchPaymentConfigData();
    }, []);

    function scrollNavigation() {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    }

    useEffect(() => {
        const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
        if (sidebarVisibilitytype === 'show' || layoutType === "vertical" || layoutType === "twocolumn") {
            humberIcon.classList.remove('open');
        } else {
            humberIcon && humberIcon.classList.add('open');
        }
        const authUSer: any = localStorage.getItem("authUser");
        if (authUSer) {
            setUserInfo(JSON.parse(authUSer));
        }
        const authSalonUser: any = localStorage.getItem("authSalonUser");
        if (authSalonUser) {
            setSalonUserInfo(JSON.parse(authSalonUser));
        }
        const userRole = localStorage.getItem("userRole");
        if (userRole) {
            setRoleInfo(JSON.parse(userRole));
        }
    }, [sidebarVisibilitytype, layoutType]);

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header
                    headerClass={headerClass}
                    layoutModeType={layoutModeType}
                    storeRoleInfo={roleInfo}
                    userInfo={userInfo}
                    salonUserInfo={salonUserInfo}
                    paymentMode={paymentMode}
                    onChangeLayoutMode={onChangeLayoutMode}
                    changeShowLoader={changeShowLoader} />
                <Sidebar
                    layoutType={layoutType}
                />

                <div className="main-content">
                    {props.children}
                    {showLoader && (
                        <Loader />
                    )}
                    <Footer />
                </div>

            </div>
            <RightSidebar />

        </React.Fragment>

    );
};

Layout.propTypes = {
    children: PropTypes.object,
};

export default withRouter(Layout);