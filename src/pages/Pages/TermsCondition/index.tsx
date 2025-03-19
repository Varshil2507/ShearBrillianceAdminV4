import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import config from "config";

const { commonText } = config;
const SalonTermsCondition = () => {
  document.title = `Salon Terms & Conditions | ${ commonText.PROJECT_NAME }`;
  return (
    <>
    
    <Container style={{ marginTop: "80px" }} className="form-control">
      <h1 className="text-center font-weight-bold">{commonText.PROJECT_NAME}</h1>
      <Row className="mt-1">
        <Col xs={12} className="text-center">
          <h1>END USER LICENSE AGREEMENT (EULA)</h1>
          <h3>{commonText.PROJECT_NAME} Terms Of Use</h3>
          <p>
            <strong>Last updated: 03/19/2025</strong>
          </p>
        </Col>

        <Col xs={12}>
          <p>
          {commonText.PROJECT_NAME} is governed by our Terms of Use (EULA). Please
            review our Terms of Use within the app for information on
            subscriptions, payment terms, and usage policies. Before using our
            app, please read and agree to our Terms of Use. You can find the
            complete Terms of Use by clicking. By using our app, you agree to
            be bound by these terms, including our auto-renewing subscription
            policies.
          </p>
          <p>
            Please read these Terms of Use ("Terms") carefully before using
            the {commonText.PROJECT_NAME} platform (the "Platform") operated by {commonText.PROJECT_NAME} ("us," "we," or "our"). These Terms govern your access
            to and use of the Platform. By accessing or using the Platform,
            you agree to be bound by these Terms. If you do not agree with any
            part of these Terms, please do not access or use the Platform.
          </p>
        </Col>

        <Col xs={12}>
          <h4>
            <strong>Use of the Platform:</strong>
          </h4>

          <p>
            Eligibility: You must be at least 18 years old to access and use
            the Platform. By accessing or using the Platform, you represent
            and warrant that you are 18 years of age or older.
          </p>
          <p>
            Account Creation: In order to access certain features of the
            Platform, you may be required to create an account. You are
            responsible for providing accurate and complete information during
            the account creation process. You must keep your account
            credentials secure and confidential and promptly notify us of any
            unauthorized use of your account. The entity or individual who
            owns the rights to the Application and grants the license under
            this EULA.
          </p>
          <p>
            User Conduct: You agree to use the Platform in compliance with all
            applicable laws, regulations, and these Terms. You must not use
            the Platform for any unlawful or unauthorized purpose, and you
            must not interfere with or disrupt the integrity or performance of
            the Platform. The individual or entity that is using or intends to
            use the Application under the terms of this EULA.
          </p>
          <h4>
            <strong>Acceptance of Terms:</strong>
          </h4>

          <p>
            State that users must accept the terms to access or use the
            service. Specify that continued use constitutes agreement to any
            updates or modifications.
          </p>
          <h4>
            <strong>Eligibility:</strong>
          </h4>
          <p>
            Define who is eligible to use your service (e.g., age
            restrictions). State that by using the service, users confirm they
            meet these eligibility criteria.
          </p>
          <h4>
            <strong>Intellectual Property</strong>
          </h4>
          <p>
            Ownership: The Platform and its content, including but not limited
            to text, graphics, images, logos, trademarks, and software, are
            owned or licensed by {commonText.PROJECT_NAME} and are protected by
            copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            Limited License: We grant you a limited, non-exclusive,
            non-transferable, and revocable license to access and use the
            Platform for personal, non-commercial purposes. You may not
            modify, distribute, transmit, reproduce, or create derivative
            works based on the Platform or its content without our prior
            written consent.
          </p>
          <h4>
            <strong>LICENSE GRANT</strong>
          </h4>
          <p>
            Grant of License: The Platform and its content, including but not
            limited to text, graphics, images, logos, trademarks, and
            software, are owned or licensed by {commonText.PROJECT_NAME} and are
            protected by copyright, trademark, and other intellectual property
            laws.
          </p>
          <p>
            Scope of Use: The User may install and use the Application on
            compatible devices owned or controlled by the User. The
            Application is intended for use by children aged 3 to 13. The User
            acknowledges and agrees to supervise children using the
            Application to ensure appropriate usage.
          </p>
          <h4>
            <strong>Terms of Use Content:</strong>
          </h4>
          <p>
            Make sure that your Terms of Use cover all necessary aspects
            related to auto-renewing subscriptions, payment details,
            cancellation policies, and any other relevant information.
          </p>
          <p>
            Ensure that the language used is clear and understandable by your
            app's users.
          </p>
          <h4>
            <strong>Limitation of Liability</strong>
          </h4>
          <p>
            To the maximum extent permitted by law, {commonText.PROJECT_NAME} and its
            affiliates, officers, directors, employees, agents, and licensors
            shall not be liable for any direct, indirect, incidental, special,
            consequential, or exemplary damages, including but not limited to
            damages for loss of profits, goodwill, use, data, or other
            intangible losses arising out of or in connection with your use of
            the Platform or these Terms, even if {commonText.PROJECT_NAME} has been
            advised of the possibility of such damages.
          </p>
          <p>
            Scope of Use: The User may install and use the Application on
            compatible devices owned or controlled by the User. The
            Application is intended for use by children aged 3 to 13. The User
            acknowledges and agrees to supervise children using the
            Application to ensure appropriate usage.
          </p>
          <h4>
            <strong>Severability</strong>
          </h4>
          <p>
            If any provision of these Terms is found to be invalid, illegal,
            or unenforceable, the remaining provisions shall continue in full
            force and effect.
          </p>
          <h4>
            <strong>Governing Law</strong>
          </h4>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of [Jurisdiction]. Any legal action or proceeding arising
            out of or in connection with these Terms shall be brought
            exclusively in the courts of [Jurisdiction].
          </p>
          <p>
            In your app's metadata (such as the app description), include a
            functional link to the Terms of Use. This link should lead users
            directly to the document containing your app's terms and
            conditions.
          </p>
          <h4>
            <strong>Review Schedule 2, Section 3.8(b):</strong>
          </h4>
          <p>
            Familiarize yourself with the specific requirements outlined in
            Schedule 2, section 3.8(b) of the Paid Applications in Schedule 2,
            section 3.8(b) of the Paid Applications agreement. Cross-check
            your Terms of Use to confirm that they align with the specified
            terms and conditions.
          </p>
          <h4>
            <strong>Amendments:</strong>
          </h4>
          <p>
            Specify that the Licensor reserves the right to modify the terms
            of this EULA. Users will be notified of significant changes, and
            continued use of the Software constitutes acceptance of the
            modified terms.
          </p>
          <h4>
            <strong>Entire Agreement:</strong>
          </h4>
          <p>
            This EULA constitutes the entire agreement between the User and
            the Licensor relating to the Application and supersedes all prior
            or contemporaneous oral or written communications, proposals, and
            representations with respect to the Application.
          </p>
          <h4>
            <strong>Governing law and jurisdiction:</strong>
          </h4>
          <p>
            This EULA shall be governed by and construed in accordance with
            the laws of the jurisdiction in which the Licensor is located,
            without giving effect to its conflict of laws principles.
          </p>
          <h4>
            <strong>Amendments:</strong>
          </h4>
          <p>
            We reserve the right to modify or revise these Terms at any time,
            and such modifications or revisions will be effective immediately
            upon posting on the Platform. Your continued use of the Platform
            after any modifications or revisions to these Terms shall signify
            your acceptance of such modifications or revisions.
          </p>
          <h4>Note:</h4>
          <p>
            This terms of use template is a fictional representation and
            should be modified and tailored to meet the specific requirements
            and legal regulations of the platform or service. It is always
            recommended to seek legal counsel to ensure compliance with
            applicable laws and regulations.
          </p>
        </Col>
      </Row>
    </Container>
   
  </>
);
};

export default SalonTermsCondition;
