import config from "config";
import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";
const { commonText } = config;

const PrivacyPolicy = () => {
  document.title = `Privacy Policy | ${ commonText.PROJECT_NAME }`;

    return (
      <React.Fragment>
   
        <Container>
          <Row className="text-center mt-5">
            <Col xs="12">
              <h1 className="display-4 mt-5">{commonText.PROJECT_NAME}</h1>
              <h2 className="mt-2">Privacy Policy</h2>
              <p>
                <strong>Last updated: 03/19/2025</strong>
              </p>
            </Col>
          </Row>
  
          <Row className="mt-2">
            <Col xs="12">
              <Card>
                <CardBody>
                  <CardTitle tag="h4">Introduction</CardTitle>
                  <CardText>
                    This Privacy Policy governs the manner in which {commonText.PROJECT_NAME} ("we," "us," or "our") collects, uses, maintains,
                    and discloses information collected from users of the {commonText.PROJECT_NAME} platform. This Privacy Policy applies to the
                    platform and all products and services offered by {commonText.PROJECT_NAME}.
                  </CardText>
  
                  <CardTitle tag="h4">
                    Personal Identification Information:
                  </CardTitle>
                  <CardText>
                    We may collect personal identification information from users
                    in various ways, including when users sign up for an account,
                    book appointments, and interact with the Platform. The
                    information collected may include name, email address, phone
                    number, and payment details.
                  </CardText>
  
                  <CardTitle tag="h4">
                    Non-Personal Identification Information:
                  </CardTitle>
                  <CardText>
                    We may collect non-personal identification information about
                    users, including browser name, device type, and connection
                    information.
                  </CardText>
  
                  <CardTitle tag="h4">Web Browser Cookies:</CardTitle>
                  <CardText>
                    We may use cookies to enhance the user experience. You may set
                    your browser to refuse cookies, but certain parts of the
                    Platform may not function properly.
                  </CardText>
  
                  <CardTitle tag="h4">
                    How We Use Collected Information:
                  </CardTitle>
                  <CardText>
                    <ul>
                      <li>To personalize user experience</li>
                      <li>To improve customer service</li>
                      <li>To process payments securely</li>
                      <li>
                        To send periodic emails related to the user’s account or
                        appointment reminders
                      </li>
                    </ul>
                  </CardText>
  
                  <CardTitle tag="h4">How We Protect Your Information:</CardTitle>
                  <CardText>
                    We adopt appropriate data collection and security measures to
                    protect your personal information.
                  </CardText>
  
                  <CardTitle tag="h4">
                    Sharing Your Personal Information:
                  </CardTitle>
                  <CardText>
                    We do not sell or rent personal information. We may share
                    aggregated demographic information with trusted partners.
                  </CardText>
  
                  <CardTitle tag="h4">Changes to This Privacy Policy:</CardTitle>
                  <CardText>
                    We may update this Privacy Policy from time to time. Changes
                    will be posted on this page.
                  </CardText>
  
                  <CardTitle tag="h4">Your Acceptance of These Terms:</CardTitle>
                  <CardText>
                    By using {commonText.PROJECT_NAME}, you signify acceptance of this
                    Privacy Policy.
                  </CardText>
  
                  <CardTitle tag="h4">
                    Compliance with Children&apos;s Online Privacy Protection Act:
                  </CardTitle>
                  <CardText>
                    We do not knowingly collect information from children under
                    13. Contact us if you believe your child has provided personal
                    information.
                  </CardText>
  
                  <CardTitle tag="h4">Third-Party Websites:</CardTitle>
                  <CardText>
                    We are not responsible for third-party websites linked from
                    our Platform.
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
     
      </React.Fragment>
    );
  
};

export default PrivacyPolicy;
