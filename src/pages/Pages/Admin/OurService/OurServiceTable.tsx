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
  Spinner,
} from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import {
  fetchServices,
  addService,
  updateService,
  updatePatchStatus,
  deleteService,
} from "../../../../Services/Service";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "Components/Common/Loader";
import AppointmentConfirmationModal from "Components/Common/AppointmentStatusChange";

interface Service {
  id: number;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  default_service_time: number;
  isActive: boolean;
}

const ServiceTable: React.FC = () => {
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [modal, setModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null); // State for the role to delete
  const [newService, setNewService] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Flag for edit operation
  const [showLoader, setShowLoader] = useState(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [setIsActive, setIsActiveInfo] = useState(true); // Initialize with default value
  const [errors, setErrors] = useState({ minPrice: '', maxPrice: '' });
  const [limits, setLimits] = useState({ minAllowed: 0, maxAllowed: 0 });
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');


  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);

  useEffect(() => {
    const fetchServiceList = async () => {
      try {
        const response: any = await fetchServices();
        setServiceData(response);
        setTotalItems(response?.length);
        if (serviceData?.length === 0) {
          const timer = setTimeout(() => {
            setShowLoader(false);
          }, 5000); // Hide loader after 5 seconds
          return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
        } else {
          setShowLoader(false); // Immediately hide loader if data is available
        }
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

    fetchServiceList();
  }, []);

  // Handle change event
  const handleActiveChange = async (id: any, event: any) => {
    try {
      const isChecked = event; // Get the checkbox value
      const obj = {
        isActive: isChecked,
      };
      const updatedUser = await updatePatchStatus(id, obj);
      setServiceData((prevData) =>
        prevData.map((service) =>
          service.id === id ? { ...service, ...updatedUser } : service
        )
      );
      setIsEditMode(false); // Enable edit mode
      toast.success("Status updated successfully", { autoClose: 2000 });
      fetchServices();
      toggleConfirmModal();
      setSelectedService(null);
      setShowSpinner(false);
    } catch (error: any) {
      setShowSpinner(false);
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

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: newService?.name || "",
      min_price: newService?.min_price || 0,
      max_price: newService?.max_price || 0,
      description: newService?.description || "",
      default_service_time: newService?.default_service_time || 0,
      isActive: newService?.isActive || false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Service Name"),
      min_price: Yup.number().required("Please Enter Minimum Price"),
      max_price: Yup.number().required("Please Enter Maximum Price"),
      description: Yup.string().required("Please Enter Service Description"),
      default_service_time: Yup.number().required("Please Enter Description"),
    }),
    onSubmit: async (values) => {
      const minError = validateMinPrice(minPrice);
      const maxError = validateMaxPrice(maxPrice);

      if (!minError && !maxError) {
        setShowSpinner(true);
        values.name.trim();
        if (newService) {
          await handleUpdateService(newService.id, values);
        } else {
          await handleAddService(values);
        }
      } else {
        setShowSpinner(false);
        setErrors({ minPrice: minError, maxPrice: maxError });
      }
    },
  });
  const handleAddService = async (
    values: Omit<Service, "id" | "created_at">
  ) => {
    try {
      const newService = await addService({
        ...values,
        created_at: new Date().toISOString(),
        isActive: setIsActive,
      });
      toast.success("Service added successfully", { autoClose: 2000 });
      toggleModal();
      setServiceData((prevData) => [...prevData, newService]);
      setShowSpinner(false);
      setMinPrice("");
      setMaxPrice("");
      setErrors({ minPrice: '', maxPrice: '' });
      validation.resetForm();
    } catch (error: any) {
      setShowSpinner(false);
      // Check if the error response contains a message from the server
      const errorMessage =
        error.response?.data?.message ||
        "Error adding service, please try again later";
      toast.error(errorMessage, { autoClose: 2000 });
      console.error("Error adding service:", error);
    }
  };

  const handleUpdateService = async (
    id: number,
    values: Omit<Service, "id">
  ) => {
    try {
      // Find the existing service to retain the created_at value
      const existingService = serviceData.find((service) => service.id === id);

      if (!existingService) {
        throw new Error("Service not found");
      }

      // Prepare the updated service data including created_at
      const serviceDataToUpdate: Omit<Service, "id"> = {
        ...values,
        isActive: setIsActive,
      };

      await updateService(id, serviceDataToUpdate);

      toast.success("Service updated successfully", { autoClose: 2000 });
      toggleModal();
      setShowSpinner(false);
      setMinPrice("");
      setMaxPrice("");
      setErrors({ minPrice: '', maxPrice: '' });
      setServiceData((prevData) =>
        prevData.map((service) =>
          service.id === id ? { ...service, ...values } : service
        )
      );

      validation.resetForm();
    } catch (error: any) {
      setShowSpinner(false);
      // Capture the error message from the API response
      const errorMessage =
        error.response?.data?.message ||
        "Error updating service, please try again later";
      toast.error(errorMessage, { autoClose: 2000 });
      console.error("Error updating service:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
      },
      {
        header: "Service Time (In minutes)",
        accessorKey: "default_service_time",
        enableColumnFilter: false,
      },
      {
        header: "Price",
        accessorKey: "price",
        enableColumnFilter: false,
        cell: ({ row }: { row: { original: Service } }) => {
          const { min_price, max_price } = row.original;

          // Ensure valid numbers or use a default fallback
          const formattedMinPrice = Number(min_price || 0).toFixed(2);
          const formattedMaxPrice = Number(max_price || 0).toFixed(2);
          return (
            <span
              style={{
                color: "#4CAF50",
                textAlign: "left",
                fontWeight: "bold",
                display: "block",
              }}
            >
              ${formattedMinPrice} - ${formattedMaxPrice}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "isActive",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Service } }) => (
          <div className="form-check form-switch mb-3">
            <Input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="isActive"
              checked={cell.row.original.isActive} // Bind to state
              onChange={() =>
                confirmService(cell.row.original)
              } // Pass ID and new value
            />
          </div>
        ),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Service } }) => (
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
            ></i>
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = (service: Service) => {
    setIsEditMode(true); // Enable edit mode
    setNewService(service);
    setMinPrice(service.min_price);
    setMaxPrice(service.max_price);
    setIsActiveInfo(service.isActive);
    setModal(true);
  };

  const handleDeleteService = async () => {
    if (selectedService !== null) {
      await deleteService(selectedService.id);

      // Remove the deleted user from the local state
      setServiceData((prevData) =>
        prevData.filter((barber) => barber.id !== selectedService.id)
      );

      toast.success("Barber deleted successfully", { autoClose: 2000 });
      setShowSpinner(true);
      setDeleteModal(false); // Close the modal
      setSelectedService(null); // Reset selected service ID
    }
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const cancelModal = () => {
    setMinPrice("");
    setMaxPrice("");
    setErrors({ minPrice: '', maxPrice: '' });
    setIsEditMode(false); // Enable edit mode
    toggleModal();
  }
  const handleAddButtonClick = () => {
    setNewService(null);
    setModal(true);
  };
  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal); // Toggle the delete modal visibility
  };

  const confirmService = (data: any) => {
    setSelectedService(data);
    toggleConfirmModal();
  }
  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  }

  const confirmAppointmentChange = async () => {
    try {
      if (selectedService) {
        handleActiveChange(
          selectedService.id,
          !selectedService?.isActive
        )
      }
    } catch (error: any) {
      setShowSpinner(false);
      // Capture the error message from the API response
      const errorMessage =
        error.response?.data?.message ||
        "Error updating service, please try again later";
      toast.error(errorMessage, { autoClose: 2000 });
      setShowSpinner(false);
    }
  };

  const validateMinPrice = (value: number | '') => {
    let error = '';
    if (value === '') {
      error = 'Min price is required.';
      // } else if (limits.minAllowed > 0 && value < limits.minAllowed) {
      //   error = `Min price cannot be less than ${limits.minAllowed}.`;
      // } else if (limits.maxAllowed > 0 && value > limits.maxAllowed) {
      //   error = `Min price cannot be greater than ${limits.maxAllowed}.`;
    } else if (maxPrice !== '' && value > maxPrice) {
      error = `Min price cannot be greater than Max price.`;
    }
    if (error === '') {
      validation.setFieldValue("min_price", value);
    }
    return error;
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() === "e") {
      e.preventDefault(); // Prevent "e" from being typed
    }
  };

  const handleKeySpaceDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const inputElement = event.target as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart ?? 0; // Fallback to 0 if null
    const currentValue = inputElement.value;

    // Prevent space at the start or multiple consecutive spaces
    if (
      key === " " &&
      (cursorPosition === 0 || currentValue[cursorPosition - 1] === " ")
    ) {
      event.preventDefault();
    }
  };

  const validateMaxPrice = (value: number | '') => {
    let error = '';
    if (value === '') {
      error = 'Max price is required.';
    } else if (minPrice !== '' && value < minPrice) {
      error = `Max price cannot be less than Min price.`;
    }
    if (error === '') {
      validation.setFieldValue("max_price", value);
    }
    return error;
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;

    // Ensure the minimum value is greater than 0
    if (value <= 0) {
      setErrors((prev) => ({
        ...prev,
        minPrice: 'Minimum price must be greater than 0',
      }));
      setMinPrice('');
      return;
    }

    setMinPrice(value);

    // If maxPrice is set, revalidate it against the new minPrice
    if (maxPrice !== '' && value <= maxPrice) {
      setErrors((prev) => ({
        ...prev,
        maxPrice: '', // Remove maxPrice error if valid
      }));
    }

    if (!isEditMode && value !== 0 && maxPrice === '') {
      // Set limits dynamically if max is not yet set
      setLimits({ minAllowed: value, maxAllowed: value * 10 });
    }

    setErrors((prev) => ({
      ...prev,
      minPrice: validateMinPrice(value),
    }));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;

    // Ensure maxPrice is greater than 0
    if (value <= 0) {
      setErrors((prev) => ({
        ...prev,
        maxPrice: 'Maximum price must be greater than 0',
      }));
      setMaxPrice('');
      return;
    }

    setMaxPrice(value);

    // If minPrice is set, revalidate it against the new maxPrice
    if (minPrice !== '' && value >= minPrice) {
      setErrors((prev) => ({
        ...prev,
        minPrice: '', // Remove minPrice error if valid
      }));
    }

    if (!isEditMode && value !== 0 && minPrice === '') {
      // Set limits dynamically if min is not yet set
      setLimits({ minAllowed: value / 10, maxAllowed: value });
    }

    setErrors((prev) => ({
      ...prev,
      maxPrice: validateMaxPrice(value),
    }));
  };

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <h5>Service Management</h5>
        </Col>
        <Col className="col-sm-auto ms-auto">
          <Button color="success" onClick={handleAddButtonClick}>
            <i className="ri-add-fill me-1 align-bottom"></i> Add Service
          </Button>
        </Col>
      </Row>
      {serviceData?.length ? (
        <TableContainer
          columns={columns}
          data={serviceData}
          isGlobalFilter={false}
          totalItems={selectedTotalItems ?? 0}
          customPageSize={50}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search..."
        />
      ) : showLoader ? (
        <Loader />
      ) : (
        <div>No Data Available</div> // Optional: Show alternative content if no data
      )}

      {/* Service Modal */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        centered
        backdrop="static" // Prevents closing on outside click
      >
        <ModalHeader
          className="modal-title"
          id="myModalLabel"
          toggle={() => {
            cancelModal();
          }}
        >
          {newService ? "Update Service" : "Add Service"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={validation.handleSubmit}>
            {/* Form Fields */}
            <Row>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Service Name
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter name"
                    value={validation.values.name}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    onKeyDown={handleKeySpaceDown}
                  />
                  {validation.touched.name && validation.errors.name && (
                    <div className="text-danger">{validation.errors.name}</div>
                  )}
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="description" className="form-label">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="description"
                    rows="3"
                    placeholder="Enter description"
                    value={validation.values.description}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                  {validation.touched.description &&
                    validation.errors.description && (
                      <div className="text-danger">
                        {validation.errors.description}
                      </div>
                    )}
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <Label htmlFor="min_price" className="form-label">
                    Minimum Price
                  </Label>

                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Input
                      type="number"
                      className="form-control"
                      id="min_price"
                      step="0.01" // Allows decimals
                      placeholder="Enter Minimum Price"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      onBlur={validation.handleBlur}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {errors.minPrice && <div className="text-danger">{errors.minPrice}</div>}
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <Label htmlFor="max_price" className="form-label">
                    Maximum Price
                  </Label>

                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Input
                      type="number"
                      className="form-control"
                      id="max_price"
                      step="0.01" // Allows decimals
                      placeholder="Enter Maximum Price"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      onBlur={validation.handleBlur}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  {errors.maxPrice && <div className="text-danger">{errors.maxPrice}</div>}
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <Label htmlFor="default_service_time" className="form-label">
                    Default Service Time
                  </Label>
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        const newValue = Math.max(
                          15,
                          validation.values.default_service_time - 15
                        );
                        validation.setFieldValue(
                          "default_service_time",
                          newValue
                        );
                      }}
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      className="form-control mx-2 text-center"
                      id="default_service_time"
                      value={validation.values.default_service_time}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        const newValue = Math.min(
                          100,
                          validation.values.default_service_time + 15
                        );
                        validation.setFieldValue(
                          "default_service_time",
                          newValue
                        );
                      }}
                    >
                      +
                    </button>
                  </div>
                  {validation.touched.default_service_time &&
                    validation.errors.default_service_time && (
                      <div className="text-danger">
                        {validation.errors.default_service_time}
                      </div>
                    )}
                </div>
              </Col>

              {/* <Col lg={12}>
                <div className="form-check form-switch mb-3">
                  <Input className="form-check-input" type="checkbox" role="switch" id="isActive"
                    checked={setIsActive} // Bind to state
                    onChange={handleActiveChange} // Handle change
                  />
                  <Label className="form-check-label" htmlFor="isActive">Is Active?</Label>
                </div>

              </Col> */}
            </Row>

            <Row>
              <Col lg={12}>
                <div className="hstack gap-2 justify-content-end">
                  <Button color="light" onClick={cancelModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="success"
                    disabled={showSpinner} // Disable button when loader is active
                  >
                    {showSpinner && (
                      <Spinner size="sm" className="me-2">
                        Loading...
                      </Spinner>
                    )}
                    Save
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteService}
        onCloseClick={toggleDeleteModal}
        title={
          selectedService !== null ? selectedService.name.toString() : undefined
        } // Convert to string or undefined
      />
      <AppointmentConfirmationModal
        isOpen={confirmModalOpen}
        toggle={toggleConfirmModal}
        onConfirm={confirmAppointmentChange}  // Pass the confirm function with appointmentId
        status={selectedService?.isActive ? 'false' : 'true'}
        isAppointment={false}
        isTransferBarber={false}
        isService={true}
        appointmentId={''}  // Pass appointmentId to modal
      />
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default ServiceTable;
