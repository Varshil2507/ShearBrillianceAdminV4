import React from 'react'

import { Container } from 'reactstrap'
import BreadCrumb from 'Components/Common/BreadCrumb'
import Displayappointment from './salonappointment';
import config from 'config';

const { commonText } = config;
const Salonappointment = () => {

    document.title = `Appointments | ${ commonText.PROJECT_NAME }`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Currently In-Salon: Walk-In Appointments" pageTitle="Tasks" />
                    <Displayappointment />
                </Container>
            </div>
        </React.Fragment>


    )
}

export default Salonappointment