import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  Row,
  Col,
  Input,
  Label,
  ModalHeader,
  Spinner,
} from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import DeleteModal from "../../../../../src/Components/Common/DeleteModal";
import Profile1 from "../../../../assets/images/about.jpg";
import axios from "axios";

import {
  fetchSalons,
  addSalon,
  updateSalon,
  deleteSalon,
} from "../../../../Services/SalonService";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "Components/Common/Loader";
import { formatTime } from "Components/Common/DateUtil";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
// Define the Salon type based on your database structure
interface Salon {
  id: number;
  name: string;
  firstname: string; // Add this line
  lastname: string; // Add this line
  fullname: string;
  email: string; // Add this line
  password: string; // Add password field
  google_url: string;
  address: string;
  phone_number: string;
  open_time: string; // Using string for time format
  close_time: string; // Using string for time format
  photos: string;
  weekend_day: boolean; // Day of the week when the weekend starts (e.g., "Saturday")
  weekend_start?: string; // Timestamp for weekend start time (e.g., "2024-10-22T09:00:00Z")
  weekend_end?: string; // Timestamp for weekend end time (e.g., "2024-10-23T06:00:00Z")
  user: any;
  status: string;
  //created_at: string;
  // Service: string; // Description of services offered
  // Faq: object; // JSON object for FAQs
  // Pricing: object; // JSON object for pricing details
  // Status: string; // "open" or "close"
}

const SalonTable: React.FC = () => {
  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [modal, setModal] = useState(false);
  const [newSalon, setNewSalon] = useState<Salon | null>(null);
  const [selectedImages, setSelectedImages] = useState<
    (File | string)[] | File | string | null
  >(null);
  const [deleteModal, setDeleteModal] = useState(false); // State for delete modal visibility
  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);
  const [selectedSearchText, selectedSearch] = useState<null>(null);

  const [showLoader, setShowLoader] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing
  const [passwordShow, setPasswordShow] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const limit = 10; // Items per page

  //const toggleModal = () => setModal(!modal);

  useEffect(() => {
    fetchSalonsList(1, null);

  }, []);
  const fetchSalonsList = async (page: any, search: any) => {

    try {
      const response: any = await fetchSalons(page === 0 ? 1 : page, limit, search ?? null);
      const salonArray = response.salons.map((item: any) => item.salon);
      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);
      const salons = salonArray.map((salon: any) => {
        salon.fullname = salon.user.firstname + " " + salon.user.lastname;
        return salon;
      });
      setSalonData(salons);
      if (salonData?.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 500); // Hide loader after 5 seconds
        return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
      } else {
        setShowLoader(false); // Immediately hide loader if data is available
      }
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

  // const formatTime = (time: string) => {
  //   const [hour, minute] = time.split(":").map(Number); // Assuming 'time' is in 'HH:mm' format
  //   const date = new Date();
  //   date.setHours(hour, minute);

  //   return new Intl.DateTimeFormat("en-US", {
  //     hour: "numeric",
  //     minute: "numeric",
  //     hour12: true,
  //   }).format(date); // Format as 'hh:mm AM/PM'
  // };

  const columns = useMemo(
    () => [
      {
        header: "Photo",
        accessorKey: "photos",
        cell: (cell: { getValue: () => string }) => {
          const photos = cell.getValue();
          let photoArray;
          if (photos && photos.length > 0) {
            photoArray = JSON.parse(photos);
          }
          const firstPhoto =
            photoArray && photoArray.length > 0 ? photoArray[0] : Profile1;
          return (
            <img
              src={firstPhoto}
              alt="Profile"
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
          );
        },
        enableColumnFilter: false,
      },
      {
        header: "Salon Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell: { getValue: () => number; row: { original: Salon } }) => (
          cell.row.original.status === "open" ? (
            <span
              className="btn btn-success cursor-auto"
              style={{
                padding: "0px 5px",
              }}
            >
              Open
            </span>
          ) : (
            <span
              className="btn btn-danger cursor-auto"
              style={{
                padding: "0px 5px",
              }}
            >
              Close
            </span>
          )
        ),
      },
      {
        header: "Owner Name",
        accessorKey: "fullname",
        enableColumnFilter: false,
      },
      {
        header: "Address",
        accessorKey: "address",
        enableColumnFilter: false,
      },
      {
        header: "Phone",
        accessorKey: "phone_number",
        enableColumnFilter: false,
      },
      {
        header: "Working Hours",
        accessorFn: (row: Salon) => {
          if (row.open_time && row.close_time) {
            return `${formatTime(row.open_time)} - ${formatTime(
              row.close_time
            )}`;
          } else {
            return "Not Available"; // Fallback text
          }
        },
        enableColumnFilter: false,
      },
      {
        header: "Weekend Availability (sat-Sun)",
        accessorFn: (row: Salon) => {
          // Use open_time and close_time for all days
          if (row.weekend_start && row.weekend_end) {
            return `${formatTime(row.weekend_start)} - ${formatTime(
              row.weekend_end
            )}`;
          } else if (row.open_time && row.close_time) {
            return `${formatTime(row.open_time)} - ${formatTime(
              row.close_time
            )}`;
          } else {
            return "Not Available"; // Fallback text
          }
        },
        enableColumnFilter: false,
      },
      // {
      // header: "Date",
      // accessorKey: "created_at",
      // enableColumnFilter: false,
      // },
      // {
      //   header: "Google Map URL",
      //   accessorKey: "google_url", // Field from your data
      //   enableColumnFilter: false,
      // },

      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Salon } }) => (
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
            <i
              className=" ri-delete-bin-fill"
              style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
              onClick={() => onClickDelete(cell.row.original)}
            ></i>
          </div>
        ),
      },
    ],
    []
  );

  const handleEdit = (salon: any) => {

    if (salon.phone_number) {
      const phoneInfo = formatPhoneNumber(salon.phone_number);
      salon.phone_number = phoneInfo;
    }
    setNewSalon(salon); // Set the current salon data

    const photos = salon.photos;
    let photoArray;
    if (photos && photos.length > 0) {
      photoArray = JSON.parse(photos);
    }
    setSelectedImages(photoArray); // Set the selected image as an array
    setIsEditing(true); // Toggle edit mode
    toggleModal();
  };

  const onClickDelete = (salon: any) => {
    setSelectedSalon(salon); // Ensure this is correctly assigning the ID
    setDeleteModal(true);
  };

  const handleCloseModal = () => {
    setDeleteModal(false); // Close the modal
    setSelectedSalon(null); // Clear selected barber ID
    setShowSpinner(false);
  };

  const handleDeleteSalon = async () => {
    setShowSpinner(true);
    try {
      if (selectedSalon !== null) {
        await deleteSalon(selectedSalon.id);

        showSuccessToast("Salon deleted successfully");
        // setSalonData((prevSalons) =>
        //   prevSalons.filter((salon) => salon.id !== selectedSalonId)
        // );
        setDeleteModal(false); // Close the modal
        fetchSalonsList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
        setSelectedSalon(null);
        setShowSpinner(false);
      }
    } catch (error) {
      setShowSpinner(false);
      console.error("Error deleting salon:", error);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    formik.resetForm();
  };

  // Toggle modal visibility
  const closeModal = () => {
    setNewSalon(null);
    setSelectedImages([]);
    setIsEditing(false);
    setShowSpinner(false);
    toggleModal();
  }
  const handleAddButtonClick = () => {
    setNewSalon(null);
    setSelectedImages([]);
    setModal(true);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    // Convert FileList to an array and limit to 5 images
    const selectedFiles = Array.from(files).slice(0, 5);
    setSelectedImages(selectedFiles); // Store only up to 5 images
  };

  const handlePhoneChange = (e: any) => {
    // Remove non-digit characters and limit to 10 digits
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(cleaned);

    // Update the form state with the formatted phone number
    formik.setFieldValue("phone_number", formattedPhone);
  };

  const formatPhoneNumber = (value: string): string => {
    // Match groups for the USA phone number pattern
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    // If incomplete, return unformatted
    return value;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digit keys, backspace, delete, and navigation keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleStatusChange = (event: any) => {
    if (event.target.value) {
      formik.setFieldValue("status", event.target.value);
    }
  };

  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    fetchSalonsList(total, selectedSearchText);
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      fetchSalonsList(1, search);
    } else {
      fetchSalonsList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, search);
    }
    // Handle page change logic here
  };
  const handleAddSalon = async (values: any) => {

    const formData = new FormData();

    // Append all form data (same as before)
    formData.append("name", values.name);
    formData.append("firstname", values.firstname);
    formData.append("lastname", values.lastname);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("address", values.address);
    formData.append("phone_number", values.phone_number);
    formData.append("open_time", values.open_time);
    formData.append("close_time", values.close_time);
    formData.append("status", values.status);

    // Append selected images if available
    if (selectedImages) {
      const images = Array.isArray(selectedImages)
        ? selectedImages
        : [selectedImages];
      images.forEach((file) => formData.append("photos", file));
    }

    // Append additional fields
    formData.append("google_url", values.google_url);

    // Append weekend day and optional times
    formData.append("weekend_day", values.weekend_day?.toString() || "");
    if (values.weekend_day) {
      formData.append("weekend_start", values.weekend_start || "");
      formData.append("weekend_end", values.weekend_end || "");
    }

    try {
      // Call the API to add a salon
      const newSalon = await addSalon(formData);

      // Fetch and update the salon list
      // const updatedSalonList = await fetchSalons(1, limit, selectedSearchText);
      // const salons = updatedSalonList.salons.map((item: any) => ({
      //   ...item.salon,
      //   fullname: `${item.salon.user.firstname} ${item.salon.user.lastname}`,
      // }));

      // setSalonData(salons);
      fetchSalonsList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
      showSuccessToast("Salon added successfully!");
      setShowSpinner(false);
      formik.resetForm();
      toggleModal(); // Close the modal
    } catch (error: any) {
      let errorMessage = "Failed to add salon.";

      setShowSpinner(false);
      // Handle errors from the backend
      if (axios.isAxiosError(error) && error.response?.data) {
        const backendError = error.response.data;

        // If there are validation errors, handle them dynamically
        if (backendError.data) {
          Object.keys(backendError.data).forEach((field) => {
            const fieldError = backendError.data[field];
            if (fieldError) {
              // Display the field-specific error in a toast message
              showErrorToast(
                `${field.charAt(0).toUpperCase() + field.slice(1)
                }: ${fieldError}`,
                { autoClose: 3000 }
              );
            }
          });
        } else if (backendError.message) {
          // For other errors (non-validation related)
          showErrorToast(backendError.message);
        }
      }

      console.error("Error adding salon:", error); // Log detailed error for debugging
    }
  };

  const handleUpdateSalon = async (id: number, updatedSalonData: any) => {
    try {
      const formData = new FormData();
      formData.append("id", updatedSalonData.id.toString());
      formData.append("name", updatedSalonData.name);
      formData.append("firstname", updatedSalonData.firstname);
      formData.append("lastname", updatedSalonData.lastname);
      formData.append("email", updatedSalonData.email);
      formData.append("password", updatedSalonData.password);
      formData.append("address", updatedSalonData.address);
      formData.append("phone_number", updatedSalonData.phone_number);
      formData.append("open_time", updatedSalonData.open_time);
      formData.append("close_time", updatedSalonData.close_time);
      formData.append("weekend_day", updatedSalonData.weekend_day.toString());

      if (updatedSalonData.weekend_day) {
        formData.append("weekend_start", updatedSalonData.weekend_start || "");
        formData.append("weekend_end", updatedSalonData.weekend_end || "");
      }
      formData.append("status", updatedSalonData.status);
      formData.append("google_url", updatedSalonData.google_url);

      // Append profile photo if selected
      if (selectedImages) {
        if (Array.isArray(selectedImages)) {
          selectedImages.forEach((file) => formData.append("photos", file));
        } else {
          formData.append("photos", selectedImages);
        }
      }

      // Call the API to update the salon
      const response = await updateSalon(id, formData);
      // Fetch the updated salons list with search filter
      // const updatedSalons = await fetchSalons(1, limit, selectedSearchText); // Adjust fetchSalons to include the search filter
      // const salonArray = updatedSalons.salons.map((item: any) => item.salon);
      // const salons = salonArray.map((salon: any) => {
      //   salon.fullname = salon.user.firstname + " " + salon.user.lastname;
      //   return salon;
      // });
      // setSalonData(salons);
      fetchSalonsList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
      // Show success toast
      showSuccessToast("Salon updated successfully");

      setShowSpinner(false);
      // Close the modal
      formik.resetForm();

      toggleModal();
    } catch (error: any) {
      setShowSpinner(false);
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


  const statusOptions = ["open", "close"];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove extra spaces at the start or in sequence
    const value = event.target.value.replace(/^\s+|\s{2,}/g, " ");
    formik.setFieldValue("name", value);
  };

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  const emailValidationRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: newSalon?.id || null,
      name: newSalon?.name || "",
      firstname: newSalon?.user?.firstname || "",
      lastname: newSalon?.user?.lastname || "",
      email: newSalon?.user?.email || "",
      password: newSalon?.user?.password || "",
      address: newSalon?.address || "",
      phone_number: newSalon?.phone_number || "",
      open_time: newSalon?.open_time || "",
      close_time: newSalon?.close_time || "",
      weekend_day: newSalon?.weekend_day || false,
      weekend_start: newSalon?.weekend_start || "",
      weekend_end: newSalon?.weekend_end || "",
      google_url: newSalon?.google_url || "",
      status: newSalon?.status || "",

      // Service: newSalon?.Service || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Salon name is required"),
      firstname: Yup.string().required("First name is required"), // Add this line
      lastname: Yup.string().required("Last name is required"), // Add this line
      address: Yup.string().required("Address is required"),
      email: newSalon?.id ? Yup.string() : Yup.string().matches(emailValidationRegex, "Enter valid email!!")
        .email("Invalid email format")
        .required("Email is required"),
      password: newSalon?.id
        ? Yup.string()
        : Yup.string()
          .matches(passwordRegex, "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!")
          .required("Password is required"), // Add this line
      phone_number: Yup.string()
        .required("Phone number is required")
        .matches(
          /^(?:\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/,
          "Phone number must be 10 digits"
        ),
      open_time: Yup.string()
        .required("Opening time is required"),
      close_time: Yup.string().required("Closing time is required"),
      google_url: Yup.string()
        .test("is-valid-url", "Invalid URL", (value) =>
          /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(
            value || ""
          )
        )
        .required("URL is required"),
      // Service: Yup.string().required("Service description is required"),
    }),

    onSubmit: async (values) => {
      setShowSpinner(true);

      const openTime = values.open_time;
      const closeTime = values.close_time;

      values.name.trim();
      values.firstname.trim();
      values.lastname.trim();
      values.email.trim();
      // Check if open_time is less than close_time
      if (openTime >= closeTime) {
        showErrorToast("Open time must be earlier than close time.");
        setShowSpinner(false);
      } else {
        if (values.id) {
          await handleUpdateSalon(values.id, values);
        } else {
          await handleAddSalon(values);
        }

        toggleModal();
      }
    },
  });
  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={4}>
          <div className="d-flex justify-content-between mb-4">
            <h5>Salon Management</h5>
          </div>
        </Col>
        <Col className="col-sm-auto ms-auto align-botto">
          <div className="list-grid-nav hstack gap-3">
            <Button color="success" onClick={handleAddButtonClick}>
              <i className="ri-add-fill me- align-bottom"></i> Add Salon
            </Button>
          </div>
        </Col>
      </Row>
      {showLoader ? (
        <Loader />
      ) : (
        <TableContainer
          columns={columns}
          data={salonData}
          isGlobalFilter={true}
          customPageSize={limit}
          totalPages={selectedTotalPages ?? 0}
          searchText={handleSearchText}
          totalItems={selectedTotalItems ?? 0}
          currentPageIndex={selectedCurrentPage ?? 0}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search..."
          onChangeIndex={handlePageChange}
        />

      )}

      {/* Modal for adding/editing a salon */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        centered
        backdrop="static" // Prevents closing on outside click
        size="xl" // Prevents closing on outside click
      >
        <ModalHeader
          className="modal-title"
          id="myModalLabel"
          toggle={closeModal}
        >
          {isEditing ? "Update Salon" : "Add Salon"}
        </ModalHeader>
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <Row className="table-responsive">
              <Col lg={12}>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div className="position-absolute bottom-0 end-0">
                      <Label htmlFor="profile-image-input" className="mb-0">
                        <div className="avatar-xs">
                          <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                            <i className="ri-image-fill"></i>
                          </div>
                        </div>
                      </Label>
                      <Input
                        type="file"
                        className="form-control d-none"
                        id="profile-image-input"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple // Allow multiple image selection
                      />
                    </div>
                    <div className="avatar-lg">
                      <div className="avatar-title bg-light rounded-circle">
                        {/* Display selected images */}
                        {Array.isArray(selectedImages) &&
                          selectedImages.length > 0 ? (
                          selectedImages.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={
                                imageUrl instanceof File
                                  ? URL.createObjectURL(imageUrl)
                                  : imageUrl
                              }
                              alt={`Selected Image ${index}`}
                              className="img-fluid"
                              style={{
                                width: "100px",
                                height: "100px",
                                overflow: "hidden",
                                borderRadius: "50%",
                              }}
                            />
                          ))
                        ) : selectedImages instanceof File ? (
                          <img
                            src={URL.createObjectURL(selectedImages)}
                            alt="Selected Image"
                            className="img-fluid"
                            style={{
                              width: "100px",
                              height: "100px",
                              overflow: "hidden",
                              borderRadius: "50%",
                            }}
                          />
                        ) : selectedImages &&
                          typeof selectedImages === "string" ? (
                          <img
                            src={selectedImages}
                            alt="Selected Image"
                            className="img-fluid"
                            style={{
                              width: "100px",
                              height: "100px",
                              overflow: "hidden",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <img
                            src={Profile1}
                            alt="Selected Image"
                            className="img-fluid"
                            style={{
                              width: "100px",
                              height: "100px",
                              overflow: "hidden",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Salon Name */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Salon Name
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.name && formik.errors.name
                      ? "is-invalid"
                      : ""
                      }`}
                    id="name"
                    placeholder="Enter salon name"
                    value={formik.values.name}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={handleKeySpaceDown}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger">{formik.errors.name}</div>
                  )}
                </div>
              </Col>
              {/* First Name */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="firstname" className="form-label">
                    Owner First Name
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.firstname && formik.errors.firstname
                      ? "is-invalid"
                      : ""
                      }`}
                    id="firstname"
                    placeholder="Enter first name"
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.firstname && formik.errors.firstname && (
                    <div className="text-danger">
                      {typeof formik.errors.firstname === "string"
                        ? formik.errors.firstname
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              {/* Last Name */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="lastname" className="form-label">
                    Owner Last Name
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.lastname && formik.errors.lastname
                      ? "is-invalid"
                      : ""
                      }`}
                    id="lastname"
                    placeholder="Enter last name"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.lastname && formik.errors.lastname && (
                    <div className="text-danger">
                      {typeof formik.errors.lastname === "string"
                        ? formik.errors.lastname
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              {/* Address */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="address" className="form-label">
                    Address
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.address && formik.errors.address
                      ? "is-invalid"
                      : ""
                      }`}
                    id="address"
                    placeholder="Enter salon address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-danger">{formik.errors.address}</div>
                  )}
                </div>
              </Col>

              {/* Phone Number */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="phone_number" className="form-label">
                    Phone Number
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.phone_number && formik.errors.phone_number
                      ? "is-invalid"
                      : ""
                      }`}
                    id="phone_number"
                    placeholder="Enter salon phone number"
                    value={formik.values.phone_number}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDown}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.phone_number &&
                    formik.errors.phone_number && (
                      <div className="text-danger">
                        {formik.errors.phone_number}
                      </div>
                    )}
                </div>
              </Col>

              {/* Email */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="email" className="form-label">
                    Email
                  </Label>
                  <Input
                    type="email"
                    className={`form-control ${formik.touched.email && formik.errors.email
                      ? "is-invalid"
                      : ""
                      }`}
                    id="email"
                    placeholder="Enter email"
                    value={formik.values.email}
                    autoComplete="off"
                    disabled={newSalon?.id ? true : false}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={preventSpaceKey}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-danger">
                      {typeof formik.errors.email === "string"
                        ? formik.errors.email
                        : ""}
                    </div>
                  )}
                </div>
              </Col>

              {/* Password */}
              {!newSalon?.id && (
                <Col lg={4}>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="password-input">
                      Password
                    </Label>
                    <div className="position-relative auth-pass-inputgroup mb-3">
                      <Input

                        type={passwordShow ? "text" : "password"}
                        className={`form-control pe-5${formik.touched.password && formik.errors.password
                          ? "is-invalid"
                          : ""
                          }`}
                        id="password"
                        placeholder="Enter your password"
                        value={formik.values.password}
                        autoComplete="new-password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        onKeyDown={preventSpaceKey}
                      />
                      <button
                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                        type="button"
                        onClick={() => setPasswordShow(!passwordShow)}
                      >
                        <i className="ri-eye-fill align-middle"></i>
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-danger">
                        {typeof formik.errors.password === "string"
                          ? formik.errors.password
                          : ""}
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {/* Opening Time */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="open_time" className="form-label">
                    Opening Time
                  </Label>
                  <Input
                    type="time"
                    className={`form-control ${formik.touched.open_time && formik.errors.open_time
                      ? "is-invalid"
                      : ""
                      }`}
                    id="open_time"
                    value={formik.values.open_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.open_time && formik.errors.open_time && (
                    <div className="text-danger">{formik.errors.open_time}</div>
                  )}
                </div>
              </Col>

              {/* Closing Time */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="close_time" className="form-label">
                    Closing Time
                  </Label>
                  <Input
                    type="time"
                    className={`form-control ${formik.touched.close_time && formik.errors.close_time
                      ? "is-invalid"
                      : ""
                      }`}
                    id="close_time"
                    value={formik.values.close_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.close_time && formik.errors.close_time && (
                    <div className="text-danger">
                      {formik.errors.close_time}
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="weekendCloseTime" className="form-label">
                    Status
                  </Label>
                  <select
                    className="form-select"
                    value={formik.values.status}
                    onChange={handleStatusChange}
                    required
                  >
                    <option value="">Select a status</option>
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-danger">{formik.errors.status}</div>
                  )}
                </div>
              </Col>

              {/* Google Map URL */}
              <Col lg={4}>
                <div className="mb-3">
                  <Label htmlFor="google_url" className="form-label">
                    Google Map URL
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.google_url && formik.errors.google_url
                      ? "is-invalid"
                      : ""
                      }`}
                    id="google_url"
                    placeholder="Enter Google Map URL"
                    value={formik.values.google_url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.google_url && formik.errors.google_url && (
                    <div className="text-danger">
                      {formik.errors.google_url}
                    </div>
                  )}
                </div>
              </Col>

              {/* Weekend Days Checkbox */}
              <Col lg={12}>
                <div className="mb-3 form-check">
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="weekend_day"
                    checked={formik.values.weekend_day}
                    onChange={formik.handleChange}
                  />
                  <Label htmlFor="weekend_day" className="form-check-label">
                    Weekend Days (Sat-Sun)
                  </Label>
                </div>
              </Col>

              {formik.values.weekend_day && (
                <>
                  {/* Weekend Opening Time */}
                  <Col lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="weekendOpenTime" className="form-label">
                        Weekend Opening Time
                      </Label>
                      <Input
                        type="time"
                        className={`form-control ${formik.touched.weekend_start &&
                          formik.errors.weekend_start
                          ? "is-invalid"
                          : ""
                          }`}
                        id="weekend_start"
                        value={formik.values.weekend_start}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.weekend_start &&
                        formik.errors.weekend_start && (
                          <div className="text-danger">
                            {formik.errors.weekend_start}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* Weekend Closing Time */}
                  <Col lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="weekendCloseTime" className="form-label">
                        Weekend Closing Time
                      </Label>
                      <Input
                        type="time"
                        className={`form-control ${formik.touched.weekend_end &&
                          formik.errors.weekend_end
                          ? "is-invalid"
                          : ""
                          }`}
                        id="weekend_end"
                        value={formik.values.weekend_end}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.weekend_end &&
                        formik.errors.weekend_end && (
                          <div className="text-danger">
                            {formik.errors.weekend_end}
                          </div>
                        )}
                    </div>
                  </Col>
                </>
              )}

              {/* Service Description */}
              {/* <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="Service" className="form-label">
                    Service
                  </Label>
                  <Input
                    type="text"
                    className={`form-control ${formik.touched.Service && formik.errors.Service
                        ? "is-invalid"
                        : ""
                      }`}
                    id="Service"
                    placeholder="Enter Service Description"
                    value={formik.values.Service}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.Service && formik.errors.Service && (
                    <div className="text-danger">{formik.errors.Service}</div>
                  )}
                </div>
              </Col> */}

              {/* Buttons */}
              <Col lg={12} className="hstack gap-2 justify-content-end">
                <Button className="btn btn-light" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="btn btn-success"
                  disabled={
                    showSpinner
                  } // Disable button when loader is active
                >
                  {showSpinner && (
                    <Spinner
                      size="sm"
                      className="me-2"
                    >
                      Loading...
                    </Spinner>
                  )}
                  Save
                </Button>
              </Col>
            </Row>
          </form>
        </ModalBody>
      </Modal>
      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteSalon}
        onCloseClick={handleCloseModal}
        subTitle="the salon"
        title={selectedSalon != null ? String(selectedSalon.name) : undefined} // Convert to string if not undefined
      />
    </React.Fragment>
  );
};

export default SalonTable;
