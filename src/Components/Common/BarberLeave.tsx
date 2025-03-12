import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Flatpickr from "react-flatpickr";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify

interface BarberLeaveModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (leaveData: any) => void;
}
const reasons = [
  'personal',
  'sick',
  'family_emergency',
  'vacation',
  'training',
  'child care',
  'maternity_leave',
  'bereavement',
  'appointment',
  'other'
];

const BarberLeaveModal: React.FC<BarberLeaveModalProps> = ({ isOpen, toggle, onSubmit }) => {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    availability_status: Yup.string().required("Status is required"),
    // start_date: Yup.string().required("Start date is required"),
    // end_date: Yup.string().required("End date is required"),
    reason: Yup.string().required("Reason is required"),

    start_time: Yup.string().when("availability_status", (availability_status, schema) => {
      // Ensure availability_status is treated as a string
      if (typeof availability_status === "string" && availability_status === "available") {
        return schema.required("Start time is required");
      }
      return schema.notRequired();
    }),

    end_time: Yup.string().when("availability_status", (availability_status, schema) => {
      // Ensure availability_status is treated as a string
      if (typeof availability_status === "string" && availability_status === "available") {
        return schema.required("End time is required");
      }
      return schema.notRequired();
    })
  });



  const formik = useFormik({
    initialValues: {
      availability_status: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      reason: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setShowSpinner(true);
      if (values.availability_status === "available") {
        const startTime = values.start_time;
        const endTime = values.end_time;
        if (startTime >= endTime) {
          // Show an error or prevent submission
          toast.error("Start time must be earlier than end time.");
          setShowSpinner(false);
          return; // Prevent further execution
        }

      }

      try {

        const leaveData = {
          availability_status: values.availability_status,
          start_date: formatDate(values.start_date),
          end_date: formatDate(values.end_date),
          start_time: values.start_time,
          end_time: values.end_time,
          reason: values.reason,
        };

        await onSubmit(leaveData);
        formik.resetForm();
        setShowSpinner(false);
        // Pass the leaveData to the parent component
        toast.success("Leave request submitted successfully!"); // Success toast
      } catch (error) {
        toast.error("Something went wrong, please try again!"); // Error toast
      } finally {
        setShowSpinner(false);
        toggle();  // Close the modal after form submission
      }
    },
  });

  const formatDate = (dateString: any) => {
    if (!dateString) return ""; // Return an empty string if dateString is invalid
    const date = new Date(dateString);
    // Get the user's current timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: userTimeZone, // Automatically adapts to the user's location
    };

    // Get formatted date
    const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA ensures YYYY-MM-DD format

    // Replace slashes with dashes to ensure YYYY-MM-DD format
    return formattedDate.replace(/\//g, '-');
  };


  return (
    <Modal isOpen={isOpen} toggle={toggle} centered backdrop="static">
      <ModalHeader toggle={toggle}>Leave Request</ModalHeader>
      <ModalBody>
        <Form onSubmit={formik.handleSubmit}>
          <Row>
            {/* Availability Status */}
            <Col lg={12}>
              <FormGroup>
                <Label for="availability_status">Availability Status</Label>
                <Input
                  type="select"
                  id="availability_status"
                  value={formik.values.availability_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.availability_status && !!formik.errors.availability_status}
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </Input>
                {formik.touched.availability_status && formik.errors.availability_status && (
                  <FormFeedback>{formik.errors.availability_status}</FormFeedback>
                )}
              </FormGroup>
            </Col>
          </Row>

          {/* Conditionally Render Start Time and End Time Fields */}
          {formik.values.availability_status === "available" && (
            <Row>
              <Col lg={6}>
                <FormGroup>
                  <Label for="start_time">Start Time</Label>
                  <Input
                    type="time"
                    id="start_time"
                    value={formik.values.start_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.start_time && !!formik.errors.start_time}
                  />
                  {formik.touched.start_time && formik.errors.start_time && (
                    <FormFeedback>{formik.errors.start_time}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
              <Col lg={6}>
                <FormGroup>
                  <Label for="end_time">End Time</Label>
                  <Input
                    type="time"
                    id="end_time"
                    value={formik.values.end_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.end_time && !!formik.errors.end_time}
                  />
                  {formik.touched.end_time && formik.errors.end_time && (
                    <FormFeedback>{formik.errors.end_time}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
          )}

          {/* Date Picker */}
          <Row>
            <Col lg={12}>
              <FormGroup>
                <Label for="date">Select Leave Dates</Label>
                <Flatpickr
                  name="date"
                  id="date"
                  className="form-control"
                  placeholder="Select dates"
                  options={{
                    mode: "range", // Enables range selection
                    dateFormat: "d M, Y", // Date format
                    minDate: "today", // Prevent selection of past dates
                  }}
                  value={[formik.values.start_date, formik.values.end_date]}
                  onChange={(selectedDates: any) => {
                    formik.setFieldValue("start_date", selectedDates[0]);
                    formik.setFieldValue("end_date", selectedDates[1]);
                  }}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.start_date && formik.errors.start_date && (
                  <FormFeedback>{formik.errors.start_date}</FormFeedback>
                )}
              </FormGroup>
            </Col>
          </Row>

          {/* Reason */}
          <Row>
            <Col lg={12}>
              <FormGroup>
                <Label for="reason">Reason for Leave</Label>
                <Input
                  type="select"
                  name="reason"
                  id="reason"
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.reason && !!formik.errors.reason}
                >
                  <option value="">Select Reason</option>
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason.replace(/_/g, ' ').toUpperCase()} {/* Format enum value */}
                    </option>
                  ))}
                </Input>
                {formik.touched.reason && formik.errors.reason && (
                  <FormFeedback>{formik.errors.reason}</FormFeedback>
                )}
              </FormGroup>
            </Col>
          </Row>
          {/* Submit and Cancel Buttons */}
          <ModalFooter>
            <Button color="secondary" onClick={toggle}>Cancel</Button>
            <Button
              type="submit"
              color="primary"
              disabled={showSpinner} // Disable button while submitting
            >
              {showSpinner && <Spinner size="sm" className="me-2">Submitting...</Spinner>}
              Submit
            </Button>
          </ModalFooter>
        </Form>
      </ModalBody>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick rtl={false} draggable pauseOnHover />
    </Modal>
  );
};


export default BarberLeaveModal;
