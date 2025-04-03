import React, { useEffect, useCallback } from 'react';
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Collapse, UncontrolledTooltip } from 'reactstrap';
// Import Data
import navdata from "../LayoutMenuData";
//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";
import { useSelector } from "react-redux";
import { createSelector } from 'reselect';

const VerticalLayout = (props: any) => {
    const navData = navdata().props.children;
    const path = props.router.location.pathname;

    /*
 layout settings
 */

    const selectLayoutState = (state: any) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            leftsidbarSizeType: layout.leftsidbarSizeType,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
            layoutType: layout.layoutType
        })
    );
    // Inside your component
    const {
        leftsidbarSizeType, sidebarVisibilitytype, layoutType
    } = useSelector(selectLayoutProperties);

    //vertical and semibox resize events
    const resizeSidebarMenu = useCallback(() => {
        var windowSize = document.documentElement.clientWidth;
        const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
        var hamburgerIcon = document.querySelector(".hamburger-icon");
        if (windowSize >= 1025) {
            if (document.documentElement.getAttribute("data-layout") === "vertical") {
                document.documentElement.setAttribute("data-sidebar-size", leftsidbarSizeType);
            }
            if (document.documentElement.getAttribute("data-layout") === "semibox") {
                document.documentElement.setAttribute("data-sidebar-size", leftsidbarSizeType);
            }
            if ((sidebarVisibilitytype === "show" || layoutType === "vertical" || layoutType === "twocolumn") && document.querySelector(".hamburger-icon")) {
                if (hamburgerIcon !== null) {
                    hamburgerIcon.classList.remove("open");
                }
            } else {
                // var hamburgerIcon = document.querySelector(".hamburger-icon");
                if (hamburgerIcon !== null) {
                    hamburgerIcon.classList.add("open");
                }
            }

        } else if (windowSize < 1025 && windowSize > 767) {
            document.body.classList.remove("twocolumn-panel");
            if (document.documentElement.getAttribute("data-layout") === "vertical") {
                document.documentElement.setAttribute("data-sidebar-size", "sm");
            }
            if (document.documentElement.getAttribute("data-layout") === "semibox") {
                document.documentElement.setAttribute("data-sidebar-size", "sm");
            }
            if (humberIcon) {
                humberIcon.classList.add("open");
            }
        } else if (windowSize <= 767) {
            document.body.classList.remove("vertical-sidebar-enable");
            if (document.documentElement.getAttribute("data-layout") !== "horizontal") {
                document.documentElement.setAttribute("data-sidebar-size", "lg");
            }
            if (humberIcon) {
                humberIcon.classList.add("open");
            }
        }
    }, [leftsidbarSizeType, sidebarVisibilitytype, layoutType]);

    useEffect(() => {
        window.addEventListener("resize", resizeSidebarMenu, true);
    }, [resizeSidebarMenu]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const initMenu = () => {
            const pathName = process.env.PUBLIC_URL + path;
            const ul = document.getElementById("navbar-nav") as HTMLElement;
            const items: any = ul.getElementsByTagName("a");
            let itemsArray = [...items]; // converts NodeList to Array
            removeActivation(itemsArray);
            let matchingMenuItem = itemsArray.find((x) => {
                return x.pathname === pathName;
            });
            if (matchingMenuItem) {
                activateParentDropdown(matchingMenuItem);
            }
        };
        if (props.layoutType === "vertical") {
            initMenu();
        }
    }, [path, props.layoutType]);

    function activateParentDropdown(item: any) {
        item.classList.add("active");
        let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

        if (parentCollapseDiv) {
            // to set aria expand true remaining
            parentCollapseDiv.classList.add("show");
            parentCollapseDiv.parentElement.children[0].classList.add("active");
            parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
            if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
                parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
                if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
                if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
                }
            }
            return false;
        }
        return false;
    }

    const removeActivation = (items: any) => {
        let actiItems = items.filter((x: any) => x.classList.contains("active"));

        actiItems.forEach((item: any) => {
            if (item.classList.contains("menu-link")) {
                if (!item.classList.contains("active")) {
                    item.setAttribute("aria-expanded", false);
                }
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
            }
            if (item.classList.contains("nav-link")) {
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
                item.setAttribute("aria-expanded", false);
            }
            item.classList.remove("active");
        });
    };

    return (
        <React.Fragment>
            {/* menu Items */}
            {(navData || []).map((item: any, key: number) => {
                return (
                    <React.Fragment key={key}>
                        {/* Main Header */}
                        {item['isHeader'] ? (
                            <li className="menu-title">
                                <span data-key="t-menu">{props.t(item.label)}</span>
                            </li>
                        ) : (
                            item.subItems ? (
                                <li className="nav-item">
                                    <Link
                                        onClick={item.click}
                                        className="nav-link menu-link"
                                        to={item.link ? item.link : "/#"}
                                        data-bs-toggle="collapse"
                                        id={`tooltip-${item.label.replace(/\s+/g, '-').toLowerCase()}`} // Add a unique ID
                                    >
                                        <i className={item.icon}></i>
                                        <span data-key="t-apps">{props.t(item.label)}</span>
                                        {item.badgeName ? (
                                            <span
                                                className={"badge badge-pill bg-" + item.badgeColor}
                                                data-key="t-new"
                                            >
                                                {item.badgeName}
                                            </span>
                                        ) : null}
                                    </Link>

                                    {/* Tooltip */}
                                    <UncontrolledTooltip
                                        placement="right" // You can customize placement
                                        target={`tooltip-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                                    >
                                        {props.t(item.label)}
                                    </UncontrolledTooltip>

                                    <Collapse
                                        className="menu-dropdown"
                                        isOpen={item.stateVariables}
                                        id="sidebarApps"
                                    >
                                        <ul className="nav nav-sm flex-column test">
                                            {item.subItems.map((subItem: any, key: number) => (
                                                <React.Fragment key={key}>
                                                    {!subItem.isChildItem ? (
                                                        <li className="nav-item">
                                                            <Link
                                                                to={subItem.link ? subItem.link : "/#"}
                                                                className="nav-link"
                                                                id={`tooltip-${subItem.label.replace(/\s+/g, '-').toLowerCase()}`} // Tooltip target
                                                            >
                                                                {props.t(subItem.label)}
                                                                {subItem.badgeName ? (
                                                                    <span
                                                                        className={
                                                                            "badge badge-pill bg-" + subItem.badgeColor
                                                                        }
                                                                        data-key="t-new"
                                                                    >
                                                                        {subItem.badgeName}
                                                                    </span>
                                                                ) : null}
                                                            </Link>

                                                            {/* Tooltip for SubItem */}
                                                            <UncontrolledTooltip
                                                                placement="right"
                                                                target={`tooltip-${subItem.label.replace(/\s+/g, '-').toLowerCase()}`}
                                                            >
                                                                {props.t(subItem.label)}
                                                            </UncontrolledTooltip>
                                                        </li>
                                                    ) : (
                                                        // Additional nested logic for child items...
                                                        <li className="nav-item">
                                                            {/* Nested Tooltips go here */}
                                                        </li>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </ul>
                                    </Collapse>
                                </li>
                            ) : (
                                <li className="nav-item">
                                    <Link
                                        className="nav-link menu-link"
                                        to={item.link ? item.link : "/#"}
                                        id={`tooltip-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                                    >
                                        <i className={item.icon}></i>
                                        <span className='menu-text'>{props.t(item.label)}</span>
                                        {item.badgeName ? (
                                            <span
                                                className={"badge badge-pill bg-" + item.badgeColor}
                                                data-key="t-new"
                                            >
                                                {item.badgeName}
                                            </span>
                                        ) : null}
                                    </Link>

                                    {/* Tooltip */}
                                    <UncontrolledTooltip
                                        placement="right"
                                        target={`tooltip-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                                    >
                                        {props.t(item.label)}
                                    </UncontrolledTooltip>
                                </li>
                            )
                        )}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};

VerticalLayout.propTypes = {
    location: PropTypes.object,
    t: PropTypes.any,
};

export default withRouter(withTranslation()(VerticalLayout));