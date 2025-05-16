import React from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { Card, CardBody, Col } from "reactstrap";
import { ROLES } from "common/data/Constants";

const Widgets = (props: any) => {
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  const formatCount = (count: any) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"; // For millions
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k"; // For thousands
    }
    return count; // Return count as is if less than 1000
  };

  return (
    <React.Fragment>
      {storeRoleInfo.role_name !== ROLES.SALON_BARBER &&
        storeRoleInfo.role_name !== ROLES.SALON_OWNER &&
        storeRoleInfo.role_name !== ROLES.SALON_MANAGER && (
          <Col xl={3} md={6}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-block">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                        Salons
                      </p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-end">
                    <div className="d-block mt-4">
                      <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                        <span className="counter-value">
                          <CountUp
                            start={0}
                            end={formatCount(props?.dashboard?.totalSalons)}
                            // decimal={item.decimals}
                            suffix=""
                            duration={3}
                          />
                        </span>
                      </h4>
                      <Link to="/salons" className="text-info">
                        View Salons
                      </Link>
                    </div>
                    <div className="avatar-sm flex-shrink-0">
                      <span
                        className={
                          "avatar-title rounded-circle fs-4 bg-secondary-subtle text-secondary"
                        }
                      >
                        <i className="ri-building-fill"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}
      {storeRoleInfo.role_name !== ROLES.SALON_BARBER && (
        <Col xl={3} md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-block">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      Barbers
                    </p>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(props?.dashboard?.totalBarbers)}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                  <Link to="/barbers" className="text-info">
                    View Barbers
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-primary-subtle text-primary"
                    }
                  >
                    <i className="ri-user-3-line"></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
      {storeRoleInfo.role_name !== ROLES.SALON_BARBER && (
        <Col xl={3} md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-block">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      Customers
                    </p>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-end ">
                  <div className="d-block mt-4">
                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                      <span className="counter-value">
                        <CountUp
                          start={0}
                          end={formatCount(props?.dashboard?.totalCustomers)}
                          // decimal={item.decimals}
                          suffix=""
                          duration={3}
                        />
                      </span>
                    </h4>
                    <Link to="/customers" className="text-info">
                      View Customers
                    </Link>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span
                      className={
                        "avatar-title rounded-circle fs-4 bg-primary-subtle text-primary"
                      }
                    >
                      <i className="ri-user-3-fill"></i>
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end ">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(props?.dashboard?.totalAppointments)}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                  {/* <Link
                    to="/appointment-table"
                    className="text-info"
                  >
                    View Appointments
                  </Link> */}
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-info-subtle text-info"
                    }
                  >
                    <i className="ri-ticket-2-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Running Appointments (Walk-In)
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.activeAppointmentsCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-info-subtle text-info"
                    }
                  >
                    <i className="ri-coupon-4-fill"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Pending Walk In Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.pendingAppointmentsCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-warning-subtle text-warning"
                    }
                  >
                    <i className="mdi mdi-timer-sand"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Future Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.pendingFutureAppointmentsCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-warning-subtle text-warning"
                    }
                  >
                    <i className="ri-walk-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Completed Walk In Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.completedWalkInCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-success-subtle text-success"
                    }
                  >
                    <i className="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Completed Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.completedAppointmentsCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-success-subtle text-success"
                    }
                  >
                    <i className="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Canceled Appointments
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={formatCount(
                          props?.dashboard?.canceledAppointmentsCount
                        )}
                        // decimal={item.decimals}
                        suffix=""
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-danger-subtle text-danger"
                    }
                  >
                    <i className="ri-delete-bin-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Payment
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={props?.dashboard?.revenue?.total?.toFixed(2)}
                        decimals={2}
                        // decimal={item.decimals}
                        prefix="$"
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-success-subtle text-success"
                    }
                  >
                    <i className="ri-money-dollar-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Offline Payment
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={props?.dashboard?.revenue?.offline?.toFixed(2)}
                        decimals={2}
                        // decimal={item.decimals}
                        prefix="$"
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-success-subtle text-success"
                    }
                  >
                    <i className="ri-money-dollar-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className="card-animate">
          <CardBody>
            <div className="d-block">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Online Payment
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div className="d-block mt-4">
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={props?.dashboard?.revenue?.online?.toFixed(2)}
                        decimals={2}
                        prefix="$"
                        duration={3}
                      />
                    </span>
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      "avatar-title rounded-circle fs-4 bg-success-subtle text-success"
                    }
                  >
                    <i className="ri-money-dollar-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      {storeRoleInfo.role_name !== ROLES.SALON_BARBER &&
        storeRoleInfo.role_name !== ROLES.SALON_OWNER &&
        storeRoleInfo.role_name !== ROLES.SALON_MANAGER && (
          <Col xl={3} md={6}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-block">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                        Top Services
                      </p>
                    </div>
                  </div>
                  <div className="d-block mt-3">
                    {props?.dashboard?.topServicesWithDetails?.filter(
                      (service: any) => service.serviceisActive
                    ).length > 0 ? (
                      props?.dashboard?.topServicesWithDetails
                        ?.filter((service: any) => service.serviceisActive)
                        .map((service: any) => (
                          <div
                            key={service.serviceId}
                            className="d-flex justify-content-between align-items-center py-2 border-bottom"
                          >
                            <span
                              className="fw-medium fs-14 text-truncate"
                              style={{ maxWidth: "70%" }}
                            >
                              {service.serviceName}
                            </span>
                            <span className="fw-semibold fs-14">
                              <CountUp
                                start={0}
                                end={formatCount(service.usageCount)}
                                suffix=""
                                duration={3}
                              />
                            </span>
                          </div>
                        ))
                    ) : (
                      <span className="text-muted text-center w-100">
                        <i>No active services available!!!</i>
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}
      {storeRoleInfo.role_name !== ROLES.SALON_BARBER &&
        storeRoleInfo.role_name !== ROLES.SALON_OWNER &&
        storeRoleInfo.role_name !== ROLES.SALON_MANAGER &&
        props?.dashboard?.topSalonsWithDetails?.length > 1 && (
          <Col xl={3} md={6}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-block">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                        Top Rated Salon
                      </p>
                    </div>
                  </div>

                  <div className="d-block mt-3">
                    {props?.dashboard?.topSalonsWithDetails?.length > 0 ? (
                      props?.dashboard?.topSalonsWithDetails?.map(
                        (salon: any, index: any) => (
                          <div
                            key={salon.salonId}
                            className="d-flex justify-content-between align-items-center py-2 border-bottom"
                          >
                            <span
                              className="fw-medium fs-14 text-truncate"
                              style={{ maxWidth: "70%" }}
                            >
                              {salon.salonName}
                            </span>
                            <span className="fw-semibold fs-14 ">
                              <CountUp
                                start={0}
                                end={formatCount(salon.appointmentsCount)}
                                // decimal={item.decimals}
                                suffix=""
                                duration={3}
                              />
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-muted text-center w-100">
                        <i>No data available!!!</i>
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}

      {storeRoleInfo.role_name !== ROLES.SALON_BARBER &&
        storeRoleInfo.role_name !== ROLES.SALON_OWNER &&
        storeRoleInfo.role_name !== ROLES.SALON_MANAGER && (
          <Col xl={3} md={6}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-block">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                        Top Rated Barber
                      </p>
                    </div>
                  </div>

                  <div className="d-block mt-3">
                    {props?.dashboard?.topBarbersWithDetails?.length > 0 ? (
                      props?.dashboard?.topBarbersWithDetails?.map(
                        (barber: any, index: any) => (
                          <div
                            key={barber.barberId}
                            className="d-flex justify-content-between align-items-center py-2 border-bottom"
                          >
                            <span
                              className="fw-medium fs-14 text-truncate"
                              style={{ maxWidth: "70%" }}
                            >
                              {barber.barberName}
                            </span>
                            <span className="fw-semibold fs-14 ">
                              <CountUp
                                start={0}
                                end={formatCount(barber.appointmentsCount)}
                                // decimal={item.decimals}
                                suffix=""
                                duration={3}
                              />
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-muted text-center w-100">
                        <i>No data available!!!</i>
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}
      {/* {ecomWidgets.map((item, key) => (
                <Col xl={3} md={6} key={key}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1 overflow-hidden">
                                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">{item.label}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <h5 className={"fs-14 mb-0 text-" + item.badgeClass}>
                                        {item.badge ? <i className={"fs-13 align-middle " + item.badge}></i> : null} {item.percentage} %
                                    </h5>
                                </div>
                            </div>
                            <div className="d-flex align-items-end justify-content-between mt-4">
                                <div>
                                    <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="559.25">
                                        <CountUp
                                            start={0}
                                            prefix={item.prefix}
                                            suffix={item.suffix}
                                            separator={item.separator}
                                            end={item.counter}
                                            decimals={item.decimals}
                                            duration={4}
                                        />
                                    </span></h4>
                                    <Link to="#" className="text-decoration-underline">{item.link}</Link>
                                </div>
                                <div className="avatar-sm flex-shrink-0">
                                    <span className={"avatar-title rounded fs-3 bg-" + item.bgcolor+"-subtle"}>
                                        <i className={`text-${item.bgcolor} ${item.icon}`}></i>
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>))} */}
    </React.Fragment>
  );
};

export default Widgets;
