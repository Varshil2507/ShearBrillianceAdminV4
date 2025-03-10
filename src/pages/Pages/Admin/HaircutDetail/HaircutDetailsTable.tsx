import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  Form,
  Row,
  Col,
  Input,
  Label,
  ModalHeader,
} from "reactstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import TableContainer from "Components/Common/TableContainerReactTable";
import DeleteModal from "../../../../../src/Components/Common/DeleteModal";
import { addHaircutDetail, fetchHaircutDetails, updateHaircutDetail } from "Services/HaircutDetails";
import { toast, ToastContainer } from "react-toastify";

// Define the HaircutDetails type based on your table structure
interface HaircutDetails {
  id: number;
  appointment_id: string;
  UserId: string;
  customer_notes: string;
  haircut_style: string;
  pruduct_used: string;
  barber_notes: string;
  created_at: string;
}
export const HAIRCUT_DETAILS_ENDPOINT = '/haircut-details';

const HaircutDetailsTable: React.FC = () => {
  const [modal, setModal] = useState(false);
  const [newHaircut, setNewHaircut] = useState<HaircutDetails | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [haircutToDelete, setHaircutToDelete] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [haircutData, setHaircutData] = useState<HaircutDetails[]>([]);


  useEffect(() => {
    const fetchHaircutDetailList = async () => {
      try {

        const response: any = await fetchHaircutDetails();
        setHaircutData(response);
      } catch (error: any) {
          // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
      }
    };

    fetchHaircutDetailList();
  }, []);
  const columns = useMemo(
    () => [
      // {
      //   header: "ID",
      //   accessorKey: "id",
      //   enableColumnFilter: false,
      // },
      {
        header: "Appointment",
        accessorKey: "appointment_id",
        enableColumnFilter: false,
      },
      {
        header: "User",
        accessorKey: "UserId",
        enableColumnFilter: false,
      },
      {
        header: "Customer Notes",
        accessorKey: "customer_notes",
        enableColumnFilter: false,
      },
      {
        header: "Haircut Style",
        accessorKey: "haircut_style",
        enableColumnFilter: false,
      },
      {
        header: "Product Used",
        accessorKey: "pruduct_used",
        enableColumnFilter: false,
      },
      {
        header: "Barber Notes",
        accessorKey: "barber_notes",
        enableColumnFilter: false,
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: (cell: { row: { original: HaircutDetails } }) => (
          <div>
            <i
              className="ri-edit-2-fill"
              style={{
                cursor: "pointer",
                marginRight: "20px",
                color: "grey",
                fontSize: "20px",
              }}
              onClick={() => handleEdit(cell.row.original)}
            >
              {" "}
            </i>
            <i
              className="ri-delete-bin-line"
              style={{
                cursor: "pointer",
                color: "grey",
                fontSize: "20px",
              }}
              onClick={() => handleDeleteClick(cell.row.original)}
            ></i>
          </div>
        ),
      },
    ],
    []
  );

  const handleValidDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = (haircut: HaircutDetails) => {
    setNewHaircut(haircut);
    setModal(true);
  };


  const handleDeleteClick = (data: any) => {
    setHaircutToDelete(data.id);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (haircutToDelete !== null) {
      setHaircutData((prev) => prev.filter(haircut => haircut.id !== haircutToDelete));
      setHaircutToDelete(null);
    }
    setDeleteModal(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
    setHaircutToDelete(null);
  };

  const handleAddButtonClick = () => {
    setNewHaircut({
      id: 0,
      appointment_id: "",
      UserId: "",
      customer_notes: "",
      haircut_style: "",
      pruduct_used: "",
      barber_notes: "",
      created_at: new Date().toISOString(),
    });
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
  };
  
  const handleAddHairCut = async (values: Omit<HaircutDetails, 'id'>) => { 
    try {
      const newHairCutData = await addHaircutDetail({
        ...values, // Use selected image or default
      });
      setHaircutData((prevData) => [
        ...prevData,
        { ...newHairCutData }, // Append the newly created haircut
      ]);
      toggleModal();
    } catch (error: any) {
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          toast.error(error.message || "Something went wrong");
        }
    }
  };

  const handleUpdateHairCut = async (values: Omit<HaircutDetails, 'id'>) => {
    if (newHaircut) {
      try {
        // Attempt to update the haircut and log the response
        const updatedHairCutData = await updateHaircutDetail(newHaircut.id, {
          ...values
        });
        // Update the local state with the edited data if the API returns it
        setHaircutData((prevData) =>
          prevData.map((haircut) =>
            haircut.id === newHaircut.id ? { ...haircut, ...values } : haircut
          )
        );

        toggleModal(); // Close the modal
      } catch (error: any) {
          // Check if the error has a response property (Axios errors usually have this)
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message; // Extract the message from the response
        toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
      } else {
        // Fallback for other types of errors
        toast.error(error.message || "Something went wrong");
      }
      }
    }
  };

  const handleAddOrUpdateHaircut = (values: HaircutDetails) => {
    if (newHaircut) {
      if (newHaircut.id === 0) {
        const newId = haircutData.length
          ? haircutData[haircutData.length - 1].id + 1
          : 1;
        setHaircutData((prevData) => [...prevData, { ...values, id: newId }]);
      } else {
        setHaircutData((prevData) =>
          prevData.map((haircut) =>
            haircut.id === newHaircut.id ? { ...haircut, ...values } : haircut
          )
        );
      }
      toggleModal();
    }
  };

  // Validation schema for Yup
  const validationSchema = Yup.object().shape({
    appointment_id: Yup.string().required("Appointment ID is required"),
    UserId: Yup.string().required("User ID is required"),
    customer_notes: Yup.string().required("Customer notes are required"),
    haircut_style: Yup.string().required("Haircut style is required"),
    pruduct_used: Yup.string().required("Product used is required"),
    barber_notes: Yup.string().required("Barber notes are required"),
    created_at: Yup.string().required("Date is required"), // Validate date
  });

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <h5>Haircut Details Management</h5>
        </Col>
        <Col className="col-sm-auto ms-auto align-botto">
          <Button color="success" onClick={handleAddButtonClick}>
            <i className="ri-add-fill me- align-bottom"></i> Add Haircut Detail
          </Button>
        </Col>
      </Row>
      {(
        <TableContainer
          columns={columns}
          data={haircutData}
          isGlobalFilter={true}
          customPageSize={50}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search..."
        />
      )}

      {/* Modal for adding/editing a haircut detail */}
      <Modal isOpen={modal} toggle={toggleModal} centered
        backdrop="static" // Prevents closing on outside click
      >
        <ModalHeader className="modal-title"
          id="myModalLabel" toggle={() => {
            toggleModal();
          }}>
          {newHaircut?.id ? "Update Haircut" : "Add Haircut"}
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={
              newHaircut || {
                appointment_id: "",
                UserId: "",
                customer_notes: "",
                haircut_style: "",
                pruduct_used: "",
                barber_notes: "",
                created_at: new Date().toISOString(),
              }
            }
            validationSchema={validationSchema}
            onSubmit=
            {(values) => {
              if (newHaircut && newHaircut.id) {
                handleUpdateHairCut(values);
              } else {
                handleAddHairCut(values);
              }
            }}
          >
            {({ handleChange, handleBlur, values }) => (
              <FormikForm>
                <Row>
                  <Col lg={12}>
                    <div className="table-responsive">
                      <Label htmlFor="appointment_id" className="form-label">
                        Appointment
                      </Label>
                      <Field
                        type="text"
                        className="form-control"
                        id="appointment_id"
                        placeholder="Enter Appointment ID"
                        name="appointment_id"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.appointment_id}
                      />
                      <ErrorMessage
                        name="appointment_id"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="UserId" className="form-label">
                        User Name
                      </Label>
                      <Field
                        type="text"
                        className="form-control"
                        id="UserId"
                        placeholder="Enter User ID"
                        name="UserId"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.UserId}
                      />
                      <ErrorMessage
                        name="UserId"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="customer_notes" className="form-label">
                        Customer Notes
                      </Label>
                      <Field
                        as="textarea"
                        className="form-control"
                        id="customer_notes"
                        placeholder="Enter Customer Notes"
                        name="customer_notes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.customer_notes}
                      />
                      <ErrorMessage
                        name="customer_notes"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="haircut_style" className="form-label">
                        Haircut Style
                      </Label>
                      <Field
                        type="text"
                        className="form-control"
                        id="haircut_style"
                        placeholder="Enter Haircut Style"
                        name="haircut_style"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.haircut_style}
                      />
                      <ErrorMessage
                        name="haircut_style"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="pruduct_used" className="form-label">
                        Product Used
                      </Label>
                      <Field
                        type="text"
                        className="form-control"
                        id="pruduct_used"
                        placeholder="Enter Product Used"
                        name="pruduct_used"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.pruduct_used}
                      />
                      <ErrorMessage
                        name="pruduct_used"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="barber_notes" className="form-label">
                        Barber Notes
                      </Label>
                      <Field
                        as="textarea"
                        className="form-control"
                        id="barber_notes"
                        placeholder="Enter Barber Notes"
                        name="barber_notes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.barber_notes}
                      />
                      <ErrorMessage
                        name="barber_notes"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <Label htmlFor="created_at" className="form-label">
                      Date
                    </Label>
                    <Input
                      type="date"
                      className="form-control"
                      id="created_at"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.created_at ? new Date(values.created_at).toISOString().substring(0, 10) : ""}


                    />
                    <ErrorMessage
                      name="created_at"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col lg={12} className="hstack gap-2 justify-content-end">
                    <Button className="btn btn-light" onClick={toggleModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      className="btn btn-success"
                    >
                      Save
                    </Button>
                  </Col>
                </Row>
              </FormikForm>
            )}
          </Formik>
        </ModalBody>
      </Modal>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteConfirm}
        onCloseClick={handleCloseDeleteModal}
        title={haircutToDelete?.toString()}
      />
      
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default HaircutDetailsTable;
