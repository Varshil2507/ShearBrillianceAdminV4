import React from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import config from 'config';
import BarberAppointmentTable from './BarberAppointmentTable';

const { commonText } = config;
const ReactBarberAppointmentTable = () => {
  document.title = `Barber Schedules | ${ commonText.PROJECT_NAME }`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid className='data-section'>
          <Row>
            <Col lg={12}>
              <Card>

                <CardBody>
                  <BarberAppointmentTable />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

    </React.Fragment>
  );
};

export default ReactBarberAppointmentTable;