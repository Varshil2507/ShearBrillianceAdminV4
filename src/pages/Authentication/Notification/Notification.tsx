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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TableContainer from "Components/Common/TableContainer";
import Blog1 from "../../../assets/images/blog_default_img.jpg";
import * as Yup from "yup";
import { Formik, Form as FormikForm } from "formik";

import Loader from "Components/Common/Loader";
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";
import { formatUTCDate } from "Components/Common/DateUtil";
import {
  addNotification,
  fetchNotification,
  updateNotification,
} from "Services/Notification";

interface Notification {
  // createdAt: any;
  id: number;
  title: string;
  body: string;
  image_url: string; // This could be a URL to the image
}
const Notification: React.FC = () => {
  const [notificationData, setNotificationData] = useState<Notification[]>([]);
  const [modal, setModal] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<any | null>(null); // Allow selectedImage to be a File or null
  const [deleteModal, setDeleteModal] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);
  const [filteredData, setFilteredData] = useState<Notification[]>([]); // Filtered data
  const [selectedSearchText, selectedSearch] = useState<null>(null);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [error, setError] = useState("");

  const limit = 10; // Items per page

  //   "font",
  //   "size",
  //   "header",
  //   "bold",
  //   "italic",
  //   "underline",
  //   "strike",
  //   "color",
  //   "background",
  //   "script",
  //   "list",
  //   "indent",
  //   "align",
  //   "blockquote",
  //   "code-block",
  //   "link",
  //   "image",
  //   "video",
  // ];
  useEffect(() => {
    fetchNotificationList(1, null);
  }, []);

  const fetchNotificationList = async (page: any, search: any) => {
    try {
      const response: any = await fetchNotification(
        page === 0 ? 1 : page,
        limit,
        search ?? null
      );
      // setCurrentPage(response?.currentPage ? parseInt(response?.currentPage) : 1);
      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);
      // const totalLoadedAppointment = (totalLoadedAppointments ?? 0) + response.appointments?.length;
      // setTotalLoadedAppointments(totalLoadedAppointment);
      setNotificationData(response?.notifications);
      // setFilteredData(response.blogs);
      if (notificationData?.length === 0) {
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

  const columns = useMemo(
    () => [
      {
        header: "Blogs",
        accessorKey: "image_url",
        enableColumnFilter: false,
        cell: (cell: { getValue: () => string }) => (
          <img
            src={cell.getValue() ? cell.getValue() : Blog1}
            // src={Profile}
            alt="Profile"
            style={{ width: "50px", height: "50px" }}
          />
        ),

        // cell: (cell: { getValue: () => string }) => {
        //   const imageUrl = cell.getValue(); // Get the image URL from cell value
        //   // const defaultImage = Blog1; // Path to your default image
        //   <img
        //     src={cell.getValue() ? cell.getValue() : Blog1}
        //     src={Profile}
        //     alt="Blog"
        //     style={{ width: "50px", height: "50px" }}
        //   />
        //   // return (
        //   //   <img
        //   //     src={imageUrl || Blog1} // Use the default image if the URL is empty or invalid
        //   //     alt="Blog"
        //   //     style={{ width: "100px", height: "auto" }}
        //   //   />
        //   // );
        // },
      },

      {
        header: "Title",
        accessorKey: "title",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Notification } }) => (
          <span title={cell.row.original.title}>
            {cell.row.original.title?.length > 30
              ? cell.row.original.title?.substring(0, 30) + "..."
              : cell.row.original.title}
          </span>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Notification } }) => (
          <span
            title={cell.row.original.body}
            style={{
              display: "inline-block",
              maxWidth: "250px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              verticalAlign: "middle",
            }}
          >
            {cell.row.original.body}
          </span>
        ),
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: ({ row }: { row: { original: { createdAt: string } } }) => {
          const { createdAt } = row.original;
          // Return the formatted date to be displayed
          return formatUTCDate(createdAt);
        },
      },
      {
        header: "Actions",
        accessorKey: "actions",
        enableColumnFilter: false,
        cell: (cell: { row: { original: Notification } }) => (
          <div>
            <i
              className="ri-eye-line text-center"
              style={{
                cursor: "pointer",
                // marginRight: "12px",
                color: "grey", // Bootstrap primary blue
                fontSize: "20px",
                transition: "color 0.2s ease",
              }}
              onClick={() => handleEdit(cell.row.original)}
              title="View Notification"
            />

            {/* <i
              className="ri-delete-bin-fill"
              style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
              onClick={() => handleDelete(cell.row.original.id)}
            /> */}
          </div>
        ),
      },
    ],
    []
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleEdit = async (notification: Notification) => {
    setNewNotification(notification);
    const file = await convertImageUrlToFile(notification.image_url, "custom_image");
    // if (blog.image instanceof File) {
    setSelectedImage(file); // If it's a file, just set it directly
    // } else {
    // setSelectedImage(null); // If it's a string (URL or path), set it as null or handle differently
    // }

    setModal(true);
  };
  // const handleDelete = (id: number) => {
  //   setDeletingBlogId(id);
  //   setDeleteModal(true);
  // };

  // const confirmDelete = async () => {
  //   setShowSpinner(true);
  //   if (deletingBlogId) {
  //     try {
  //       await deleteBlog(deletingBlogId); // Call delete API

  //       showSuccessToast("Blog deleted successfully");

  //       setShowSpinner(false);
  //       fetchNotificationList(selectedCurrentPage ? selectedCurrentPage + 1 : 1, null);
  //       // setBlogData((prevData) =>
  //       //   prevData.filter((item) => item.id !== deletingBlogId)
  //       // );
  //       setDeletingBlogId(null);
  //       setDeleteModal(false);
  //     } catch (error) {
  //       setShowSpinner(false);
  //       console.error("Error deleting blog:", error);
  //     }
  //   }
  // };

  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal);
  };

  const handleAddButtonClick = () => {
    setNewNotification({
      id: 0,
      title: "",
      body: "",
      image_url: "",
    });
    setSelectedImage(null);
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
    setError(""); // Remove error if text is entered
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // 5 MB = 5 * 1024 * 1024 bytes

        if (file.size > maxSizeInBytes) {
          showErrorToast(`File size should not exceed ${maxSizeInMB} MB.`);
          event.target.value = ""; // Clear the file input
          setSelectedImage(null); // Clear selected image
        } else {
          setSelectedImage(file); // Save the file object
          // showErrorToast("");
        }
      } else {
        showErrorToast(
          "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."
        );
        event.target.value = ""; // Clear the file input
        setSelectedImage(null); // Clear selected image
      }
    } else {
      setSelectedImage(null); // Clear if no file selected
    }
  };

  const convertImageUrlToFile = async (imageUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const fileType = blob.type || 'image/jpeg'; // fallback MIME type
    return new File([blob], fileName, { type: fileType });
  };

  // Function to add a new blog post
  const handleAddNotification = async (values: Omit<Notification, "id">) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("body", values.body);
      if (selectedImage instanceof File) {
        formData.append("image", selectedImage);
      }

      const newNotificationData = await addNotification(formData);

      showSuccessToast("Notification send successfully");

      fetchNotificationList(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        null
      );
      setShowSpinner(false);

      setError("");

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
  const handleResendNotification = async (values: Omit<Notification, "id">) => {
    if (newNotification) {
      try {
        setShowSpinner(true);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("body", values.body);

        if (selectedImage instanceof File) {
          formData.append("image", selectedImage);
        } else if (typeof newNotification.image_url === "string") {
          formData.append("image_url", newNotification.image_url); // ✅ include existing image URL
        }

        await addNotification(formData);
        showSuccessToast("Notification resent successfully!");
        fetchNotificationList(
          selectedCurrentPage ? selectedCurrentPage + 1 : 1,
          null
        );
        toggleModal();
        setShowSpinner(false);
      } catch (error: any) {
        setShowSpinner(false);
        const apiMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong";
        showErrorToast(apiMessage);
      }
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
  });

  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    fetchNotificationList(total, selectedSearchText);
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      fetchNotificationList(1, search);
    } else {
      fetchNotificationList(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        search
      );
    }
    // Handle page change logic here
  };
  // const searchList = (searchTerm: string) => {

  //   const filtered = blogData.filter(

  //     function (blog) {
  //       return blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         blog.description.toLowerCase().includes(searchTerm.toLowerCase());
  //     }
  //   );
  //   setFilteredData(filtered);
  // };

  return (
    <React.Fragment>
      <Row className="g-2 mb-4">
        <Col sm={6}>
          <div className="d-flex justify-content-between mb-4">
            <h5>Notification Management</h5>
          </div>
        </Col>

        <Col sm={6} className="d-flex justify-content-end align-items-center">
          <Button color="success" onClick={handleAddButtonClick}>
            <i className="ri-add-fill me-1 align-bottom"></i> Add Notification
          </Button>
        </Col>
      </Row>

      {/* Search Bar Section */}
      {/* <Row className="mb-3">
    <Col sm={5}>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bx bx-search-alt"></i>
        </span>
     
     
        <input
          type="text"
          className="form-control"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
    </Col>
  </Row> */}
      {showLoader ? (
        <Loader /> // Display a loader while data is loading
      ) : (
        <TableContainer
          columns={columns} // Columns definition
          data={notificationData} // Pass the filtered data here
          isGlobalFilter={true} // Disable global filter, since you're handling the filter manually
          customPageSize={limit} // Custom page size, adjust as needed
          totalPages={selectedTotalPages ?? 0} // Total number of pages
          totalItems={selectedTotalItems ?? 0} // Total number of items
          currentPageIndex={selectedCurrentPage ?? 0} // Current page index
          searchText={handleSearchText}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search Notification..." // Adjusted search placeholder text
          onChangeIndex={handlePageChange} // Handle pagination page change
        />
      )}

      {/* Modal for adding/editing a blog */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        centered
        size="l"
        backdrop="static" // Prevents closing on outside click
      >
        <ModalHeader
          className="modal-title"
          id="myModalLabel"
          toggle={() => {
            toggleModal();
          }}
        >
          {newNotification && newNotification.id
            ? "Resend Notification"
            : "Send Notification"}
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={{
              title: newNotification?.title || "",
              body: newNotification?.body || "",
              image_url: selectedImage || "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              values.title = values.title.trim();

              // 🔔 Check if image is missing on send/resend
              if (!selectedImage && !newNotification?.image_url) {
                showErrorToast("Please upload an image before submitting.");
                return;
              }

              setShowSpinner(true);

              if (newNotification && newNotification.id) {
                handleResendNotification(values);
              } else {
                handleAddNotification(values);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              values,
              handleSubmit,
              errors,
              touched,
            }) => (
              <FormikForm onSubmit={handleSubmit}>
                <Row>
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
                          />
                        </div>
                        <div className="avatar-lg">
                          <div
                            className="avatar-title bg-light rounded-circle"
                            style={{
                              width: "100px",
                              height: "100px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={
                                selectedImage instanceof File
                                  ? URL.createObjectURL(selectedImage) // If selectedImage is a File, create a URL
                                  : newNotification?.image_url
                                    ? newNotification.image_url
                                    : Blog1 // If newBlog has an image, use it; else fallback to Blog1
                              }
                              alt="Notificaton"
                              className="avatar-md rounded-circle"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            {error && (
                              <div
                                className="text-danger mt-2 text-center"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="title" className="form-label">
                        Title
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        value={values.title}
                        invalid={touched.title && !!errors.title}
                      />
                      {touched.title && errors.title ? (
                        <div className="text-danger">{errors.title}</div>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <Label htmlFor="description" className="form-label">
                        Description
                      </Label>
                      <Input
                        id="body"
                        name="body"
                        type="textarea"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.body}
                        invalid={touched.body && !!errors.body}
                        style={{ height: "150px", width: "100%" }} // Adjust the height and width as needed
                      />
                      {touched.body && errors.body ? (
                        <div className="text-danger">{errors.body}</div>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <div className="modal-footer">
                  <Button color="secondary" onClick={toggleModal}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    className="btn btn-success"
                    disabled={showSpinner} // Disable button when loader is active
                  >
                    {showSpinner && (
                      <Spinner size="sm" className="me-2">
                        Loading...
                      </Spinner>
                    )}
                    Send
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </ModalBody>
      </Modal>

      {/* Delete confirmation modal */}
      {/* <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={confirmDelete}
        onCloseClick={toggleDeleteModal}
        title="Blog"
      /> */}
    </React.Fragment>
  );
};

export default Notification;
