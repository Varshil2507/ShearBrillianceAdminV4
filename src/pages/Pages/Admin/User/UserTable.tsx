import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalBody,
  Button,
  Row,
  Col,
  Form,
  Input,
  Label,
  ModalHeader,
  Spinner,
} from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import Profile from "../../../../assets/images/users/avatar-8.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteModal from "../../../../../src/Components/Common/DeleteModal";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "Services/UserService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "Components/Common/Loader";
import { fetchSalons } from "Services/SalonService";
import { fetchRoles } from "Services/RoleService";

// Define the User type based on your database structure
interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  address: string;
  mobile_number: string | undefined; // Allow undefined if that's the case in the imported type
  email: string;
  google_token: string;
  apple_token: string;
  password: string; // Add this line
  RoleId: string; // Adjust to match the expected type
  role: any; // Adjust to match the expected type
  created_at: string;
  salonId: number;
  profile_photo: string;
}

interface Salon {
  salon_id: number;
  salon_name: string;
  availability_status: string; // Field for availability status
  photos: number; // Field for default service time
  creappointment_countted_at: string;
  address: string; // Fixed typo here
  barbers?: object; // Add this line
}

interface Role {
  id: string;
  role_name: string;
  description: string;
  can_create_appointment: boolean;
  can_modify_appointment: boolean;
  can_cancel_appointment: boolean;
  can_view_customers: boolean;
  can_manage_staff: boolean;
  can_manage_services: boolean;
  can_access_reports: boolean;
  created_at: string;
  requiresSalonId: boolean;
}

const UserTable: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [roleData, setRoleData] = useState<Role[]>([]);
  const [salonData, setSalonData] = useState<Salon[]>([]);
  const [modal, setModal] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  const [passwordShow, setPasswordShow] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null); // State for the user to delete

  // const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedSalonId, setSelectedSalonId] = useState<number>();

  const [selectedRoleId, setSelectedRoleId] = useState<any>();
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [selectedSearchText, selectedSearch] = useState<null>(null);
  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(null);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userSelectedRole, setUserSelectedRole] = useState<any>(null);

  const limit = 10; // Items per page
  const userRole = localStorage.getItem("userRole");
  let storeRoleInfo: any;
  if (userRole) {
    storeRoleInfo = JSON.parse(userRole);
  }
  // Toggle modal visibility
  const toggleModal = () => setModal(!modal);

  // Toggle modal visibility
  const closeModal = () => {
    formik.resetForm();
    setSelectedImage([]);
    setIsEditing(false);
    toggleModal();
  };

  useEffect(() => {
    getUsers(1, null);

    const fetchSalonsList = async () => {
      try {
        const response: any = await fetchSalons(1, null, null);
        setSalonData(response?.salons);
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

    fetchSalonsList();

    const fetchRoleList = async () => {
      try {
        const response: any = await fetchRoles();
        const roles = response.filter(
          (role: any) =>
            role.role_name.toLowerCase() === "admin" ||
            role.role_name.toLowerCase() === "salon manager"
        );
        setRoleData(roles);
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

    fetchRoleList();
  }, []);

  const getUsers = async (page: any, search: any, role?: string) => {
    try {
      const response: any = await fetchUsers(
        null,
        "user",
        page === 0 ? 1 : page,
        limit,
        search ?? null,
        role ?? undefined // ✅ Use undefined instead of null
      );

      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);

      const users = response.users.map((usr: any) => ({
        ...usr,
        fullname: `${usr.firstname} ${usr.lastname}`,
      }));

      setUserData(users);

      if (users.length === 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setShowLoader(false);
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "An error occurred");
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };
  const handlePhoneChange = (e: any) => {
    // Remove non-digit characters and limit to 10 digits
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(cleaned);

    // Update the form state with the formatted phone number
    formik.setFieldValue("mobile_number", formattedPhone);
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove extra spaces at the start or in sequence
    const value = event.target.value.replace(/^\s+|\s{2,}/g, " ");
    formik.setFieldValue("username", value);
    setInputValue(value);
  };

  const preventSpaceKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };
  const emailValidationRegex =
    /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const userSchema = (isEdit = false) =>
    Yup.object().shape({
      username: Yup.string().required("Username is required"),
      firstname: Yup.string().required("First name is required"),
      lastname: Yup.string().required("Last name is required"),
      mobile_number: Yup.string()
        .required("Mobile number is required")
        .matches(
          /^(?:\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/,
          "Mobile number must be 10 digits"
        ),
      email: isEdit
        ? Yup.string()
        : Yup.string()
            .matches(emailValidationRegex, "Enter valid email!!")
            .email("Invalid email")
            .required("Email is required"),
      password: isEdit
        ? Yup.string()
        : Yup.string()
            .matches(
              passwordRegex,
              "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.!!"
            )
            .required("Password is required"),
      RoleId: Yup.string().required("Role ID is required"),
      salonId:
        selectedRole?.role_name !== "Salon Manager"
          ? Yup.number()
          : Yup.number().required("Salon ID is required"),
      // profile_photo: Yup.string().url("Invalid URL")
    });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: newUser?.id || null,
      username: newUser?.username ?? "",
      firstname: newUser?.firstname ?? "",
      lastname: newUser?.lastname ?? "",
      address: newUser?.address ?? "",
      email: newUser?.email ?? "",
      mobile_number: newUser?.mobile_number ?? "",
      password: newUser?.password ?? "",
      RoleId: newUser?.RoleId ?? "",
      salonId: newUser?.salonId,
      profile_photo: newUser?.profile_photo ?? Profile,
    },
    validationSchema: userSchema(newUser?.id ? true : false),
    onSubmit: (values) => {
      values.username.trim();
      values.firstname.trim();
      values.lastname.trim();
      values.email.trim();
      setShowSpinner(true);
      // Prepare FormData object
      if (values.id !== null) {
        handleUpdateUser(values.id, values);
      } else {
        handleAddUser(values);
      }
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedImage(file); // Save the file object directly
      } else {
        toast.error(
          "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."
        );
        e.target.value = ""; // Clear the file input
      }
      // formik.setFieldValue('profile_photo', file);
    }
  };

  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    getUsers(total, selectedSearchText, userSelectedRole);
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      getUsers(1, search, userSelectedRole);
    } else {
      getUsers(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        search,
        userSelectedRole
      );
    }
    // Handle page change logic here
  };

  // Add User (Create)
  // Add new user function
  const handleAddUser = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("RoleId", (values.RoleId ?? "").toString());
      formData.append("SalonId", (values.salonId ?? 0).toString());
      formData.append("profile_photo", selectedImage || Profile); // Append file or fallback
      formData.append("username", values.username);
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("address", values.address);
      formData.append("email", values.email);
      formData.append("mobile_number", values.mobile_number);
      formData.append("password", values.password);

      // Append all other fields
      // for (const key in values) {
      //   if (values[key] !== undefined) {
      //     formData.append(key, values[key]);
      //   }
      // }

      const tempUser = await createUser(formData);

      // let tempUser = response;
      tempUser.fullname = tempUser.firstname + " " + tempUser.lastname;
      toast.success("User added successfully", { autoClose: 2000 });
      // Add new user to the local state
      // const users = response.users.map((usr: any) => {
      //   usr.fullname = usr.firstname + " " + usr.lastname;
      //   return usr;
      // })
      getUsers(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        null,
        userSelectedRole
      );
      // setUserData((prevData) => [...prevData, tempUser]);
      setShowSpinner(false);
      // fetchUsers(null, 'user', 1, 100);
      toggleModal(); // Close the modal
      formik.resetForm(); // Reset form after successful submission
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

  const handleUpdateUser = async (id: number, updatedUserData: any) => {
    try {
      const formData = new FormData();

      formData.append(
        "RoleId",
        (updatedUserData.RoleId ?? updatedUserData.RoleId ?? "").toString()
      );
      formData.append(
        "SalonId",
        (updatedUserData.salonId ?? updatedUserData.salonId ?? 0).toString()
      );

      if (selectedImage) {
        formData.append("profile_photo", selectedImage); // If a new image is selected
      }
      formData.append("id", updatedUserData.id.toString());
      formData.append("username", updatedUserData.username);
      formData.append("firstname", updatedUserData.firstname);
      formData.append("lastname", updatedUserData.lastname);
      formData.append("address", updatedUserData.address);
      formData.append("email", updatedUserData.email);
      formData.append("mobile_number", updatedUserData.mobile_number);
      formData.append("password", updatedUserData.password);
      await updateUser(id, formData);

      toast.success("User updated successfully", { autoClose: 2000 });
      // const users = updatedUsers.users.map((usr: any) => {
      //   usr.fullname = usr.firstname + " " + usr.lastname;
      //   return usr;
      // })
      // // Make sure updatedUsers is of type User[]
      // setUserData(users); // Ensure this matches User[] type
      getUsers(
        selectedCurrentPage ? selectedCurrentPage + 1 : 1,
        null,
        userSelectedRole
      );
      setShowSpinner(false);
      toggleModal(); // Close the modal
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

  // Set user data for editing
  const handleEditUser = (user: User) => {
    setSelectedSalonId(user.salonId);
    setSelectedRoleId(user.RoleId);
    const selectedRoleData = roleData.find((role) => role.id === user.RoleId);
    if (
      selectedRoleData &&
      (user.role?.role_name !== "Barber" ||
        user.role?.role_name !== "Salon Owner")
    ) {
      selectedRoleData.requiresSalonId = true; // Assign value only if selectedRoleData is defined
    } else {
      // Handle case where selectedRoleData is undefined, if necessary
    }
    setSelectedRole(selectedRoleData || null);
    setSelectedImage(user.profile_photo ?? Profile); // Use user's profile image or default
    setNewUser(user); // Set the user to be updated
    setIsEditing(true); // Toggle edit mode
    toggleModal(); // Open the modal for editing
  };

  // Delete user function
  const handleDeleteUser = async () => {
    setShowSpinner(true);
    if (selectedUser !== null) {
      try {
        await deleteUser(selectedUser.id);

        // Remove the deleted user from the local state
        setUserData((prevData) =>
          prevData.filter((user) => user.id !== selectedUser.id)
        );
        getUsers(
          selectedCurrentPage ? selectedCurrentPage + 1 : 1,
          null,
          userSelectedRole
        );
        toast.success("User deleted successfully", { autoClose: 2000 });
        setShowSpinner(false);
        setDeleteModal(false); // Close the delete confirmation modal
        setSelectedUser(null); // Reset selected user ID
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
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Photo",
        accessorKey: "profile_photo",
        cell: (cell: { getValue: () => string }) => (
          <img
            src={cell.getValue() ? cell.getValue() : Profile}
            // src={Profile}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        ),
        enableColumnFilter: false,
      },
      // {
      //   header: "User",
      //   accessorKey: "username",
      //   enableColumnFilter: false,
      // },
      {
        header: "Full Name",
        accessorKey: "fullname",
        enableColumnFilter: false,
      },
      // {
      //   header: "Last Name",
      //   accessorKey: "lastname",
      //   enableColumnFilter: false,
      // },
      {
        header: "Address",
        accessorKey: "address",
        enableColumnFilter: false,
      },
      {
        header: "Mobile",
        accessorKey: "mobile_number",
        enableColumnFilter: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "Role",
        accessorKey: "role.role_name",
        enableColumnFilter: false,
      },
      // {
      //   header: "Salon",
      //   accessorKey: "salon.name", // Add SalonId column for "Salon Name"
      //   enableColumnFilter: false,
      // },
      {
        header: "Actions",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell: { getValue: () => number; row: { original: User } }) => (
          <div>
            <i
              className="ri-edit-2-fill"
              style={{
                cursor: "pointer",
                marginRight: "20px",
                color: "grey",
                fontSize: "20px",
              }}
              onClick={() => handleEditUser(cell.row.original)} // Pass the entire user object
            ></i>
            {/* <i
              className=" ri-delete-bin-fill"
              style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
              onClick={() => onClickDelete(cell.row.original)} // Pass the user ID
            ></i> */}
            {/* Delete Icon - Hide or Disable for Admin */}
            {userSelectedRole !== "Admin" ? (
              <i
                className="ri-delete-bin-fill"
                style={{ cursor: "pointer", color: "grey", fontSize: "20px" }}
                onClick={() => onClickDelete(cell.row.original)} // Pass the user object
              ></i>
            ) : (
              <i
                className="ri-delete-bin-fill"
                style={{
                  color: "lightgrey",
                  fontSize: "20px",
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              ></i>
            )}
          </div>
        ),
      },
    ],
    [userData]
  );

  const handleAddButtonClick = () => {
    setNewUser(null);
    setModal(true);
  };
  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal); // Toggle the delete modal visibility
  };

  const onClickDelete = (user: User) => {
    setSelectedUser(user); // Set the selected role ID for deletion
    setDeleteModal(true); // Open the delete modal
  };

  const handleSalonChange = (event: any) => {
    if (event.target.value) {
      const salonId = Number(event.target.value);
      formik.setFieldValue("salonId", salonId);
      // setSelectedSalonId(salonId);
      // // let selectedSalonData: Salon | null;
      // const selectedSalonData = salonData.find((salon) => salon.salon_id === salonId);
      // setSelectedSalon(selectedSalonData || null);
    }
    // Perform any additional logic here based on the selected option
  };

  const handleRoleChange = (event: any) => {
    if (event.target.value) {
      // const roleId = Number(event.target.value);
      const roleId = event.target.value;
      formik.setFieldValue("RoleId", roleId);
      setSelectedRoleId(roleId);
      // let selectedSalonData: Salon | null;
      const selectedRoleData = roleData.find((role) => role.id === roleId);
      if (selectedRoleData) {
        selectedRoleData.requiresSalonId = true; // Assign value only if selectedRoleData is defined
      } else {
        // Handle case where selectedRoleData is undefined, if necessary
      }
      setSelectedRole(selectedRoleData || null);

      // Check if SalonId should be required based on the selected role
      // Apply salonId validation logic based on selectedRole
      if (selectedRoleData?.requiresSalonId) {
        formik.setFieldTouched("salonId", true);
        if (!formik.values.salonId) {
          formik.setFieldError(
            "salonId",
            "Salon ID is required for this role."
          );
        }
      } else {
        // Clear validation error if salonId is not required
        formik.setFieldError("salonId", undefined);
      }
    } else {
      formik.setFieldValue("RoleId", null);
      setSelectedRoleId(null);
    }
    // Perform any additional logic here based on the selected option
  };

  return (
    <React.Fragment>
      <Row>
        {/* User Management Title */}
        <Col sm={4}>
          <div className="d-flex justify-content-between mb-4">
            <h5>User Management</h5>
          </div>
        </Col>

        {/* Add User Button */}
        <Col className="col-sm-auto ms-auto align-bottom">
          <div className="list-grid-nav hstack gap-3">
            <Button color="success" onClick={handleAddButtonClick}>
              <i className="ri-add-fill me-1 align-bottom"></i> Add User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filter Buttons BELOW Search Bar */}
      <Row className="mb-3">
        <Col sm={12} className="d-flex justify-content-center">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <Button
                color={userSelectedRole === null ? "primary" : "light"}
                onClick={() => {
                  setUserSelectedRole(null);
                  getUsers(1, selectedSearchText, undefined); // Fetch all users
                }}
              >
                <i className="ri-group-fill me-1"></i> All
              </Button>
            </li>

            <li className="nav-item">
              <Button
                color={userSelectedRole === "Admin" ? "primary" : "light"}
                onClick={() => {
                  setUserSelectedRole("Admin");
                  getUsers(1, selectedSearchText, "Admin"); // Fetch only Admins
                }}
              >
                <i className="ri-admin-fill me-1"></i> Admin
              </Button>
            </li>

            <li className="nav-item">
              <Button
                color={
                  userSelectedRole === "Salon Manager" ? "primary" : "light"
                }
                onClick={() => {
                  setUserSelectedRole("Salon Manager");
                  getUsers(1, selectedSearchText, "Salon Manager"); // Fetch only Salon Managers
                }}
              >
                <i className="ri-store-2-fill me-1"></i> Salon Manager
              </Button>
            </li>

            <li className="nav-item">
              <Button
                color={userSelectedRole === "Salon Owner" ? "primary" : "light"}
                onClick={() => {
                  setUserSelectedRole("Salon Owner");
                  getUsers(1, selectedSearchText, "Salon Owner");
                }}
              >
                <i className="ri-user-star-fill me-1"></i> Salon Owner
              </Button>
            </li>

            <li className="nav-item">
              <Button
                color={userSelectedRole === "Barber" ? "primary" : "light"}
                onClick={() => {
                  setUserSelectedRole("Barber");
                  getUsers(1, selectedSearchText, "Barber"); // Fetch only Barbers
                }}
              >
                <i className="ri-scissors-fill me-1"></i> Barber
              </Button>
            </li>
          </ul>
        </Col>
      </Row>
      {showLoader ? (
        <Loader />
      ) : (
        <TableContainer
          divClass="table-responsive table-card"
          columns={columns}
          data={userData}
          isGlobalFilter={true}
          customPageSize={limit}
          totalPages={selectedTotalPages ?? 0}
          searchText={handleSearchText}
          totalItems={selectedTotalItems ?? 0}
          currentPageIndex={selectedCurrentPage ?? 0}
          SearchPlaceholder="Search..."
          onChangeIndex={handlePageChange}
        />
      )}

      {/* Modal for adding/updating users */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        centered
        backdrop="static" // Prevents closing on outside click
      >
        <ModalHeader
          className="modal-title"
          id="myModalLabel"
          toggle={closeModal}
        >
          {isEditing ? "Update User" : "Add User"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={formik.handleSubmit}>
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
                              ? URL.createObjectURL(selectedImage)
                              : newUser?.profile_photo
                              ? newUser?.profile_photo
                              : Profile
                          }
                          alt="Profile"
                          className="img-fluid"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Username */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="username" className="form-label">
                    User Name
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="Enter User name"
                    value={formik.values.username}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.username && formik.errors.username
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.username && formik.errors.username && (
                    <div className="invalid-feedback">
                      {formik.errors.username}
                    </div>
                  )}
                </div>
              </Col>

              {/* First Name */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="firstname" className="form-label">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    placeholder="Enter First Name"
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    className={
                      formik.touched.firstname && formik.errors.firstname
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.firstname && formik.errors.firstname && (
                    <div className="invalid-feedback">
                      {formik.errors.firstname}
                    </div>
                  )}
                </div>
              </Col>

              {/* Last Name */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="lastname" className="form-label">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    placeholder="Enter Last Name"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={(e) => {
                      preventSpaceKey(e); // Prevent spaces
                      if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault(); // Block non-alphabetic characters
                      }
                    }}
                    className={
                      formik.touched.lastname && formik.errors.lastname
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.lastname && formik.errors.lastname && (
                    <div className="invalid-feedback">
                      {formik.errors.lastname}
                    </div>
                  )}
                </div>
              </Col>

              {/* Address */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="address" className="form-label">
                    Address
                  </Label>
                  <Input
                    type="text"
                    id="address"
                    placeholder="Enter Address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </Col>

              {/* Email */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="email" className="form-label">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onKeyDown={preventSpaceKey}
                    autoComplete="off"
                    disabled={newUser?.id ? true : false}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.email && formik.errors.email
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback">
                      {formik.errors.email}
                    </div>
                  )}
                </div>
              </Col>

              {/* Mobile Number */}
              <Col lg={6}>
                <div className="mb-3">
                  <Label htmlFor="mobile_number" className="form-label">
                    Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    id="mobile_number"
                    placeholder="Enter Mobile Number"
                    value={formik.values.mobile_number}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDown}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.mobile_number &&
                      formik.errors.mobile_number
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.mobile_number &&
                    formik.errors.mobile_number && (
                      <div className="invalid-feedback">
                        {formik.errors.mobile_number}
                      </div>
                    )}
                </div>
              </Col>

              {/* Password */}
              {!newUser?.id && (
                <Col lg={6}>
                  <div className="mb-3">
                    <Label htmlFor="password-input" className="form-label">
                      Password
                    </Label>
                    <div className="position-relative auth-pass-inputgroup mb-3">
                      <Input
                        type={passwordShow ? "text" : "password"}
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        id="password"
                        placeholder="Enter your password"
                        value={formik.values.password}
                        autoComplete="new-password"
                        onChange={formik.handleChange}
                        onKeyDown={preventSpaceKey}
                        onBlur={formik.handleBlur}
                      />
                      <button
                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                        type="button"
                        onClick={() => setPasswordShow(!passwordShow)}
                      >
                        <i className="ri-eye-fill align-middle"></i>
                      </button>
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              )}
              {/* Role ID */}
              {(storeRoleInfo.role_name === "Admin" ||
                storeRoleInfo.role_name === "Salon Manager") &&
                (!isEditing ||
                  (isEditing &&
                    selectedRole &&
                    selectedRole.role_name !== "Barber" &&
                    selectedRole.role_name !== "Salon Owner")) && (
                  <Col lg={6}>
                    <div className="mb-3">
                      <Label htmlFor="role" className="form-label">
                        Role
                      </Label>
                      <select
                        className="form-select"
                        value={formik.values.RoleId}
                        onChange={handleRoleChange}
                        required
                      >
                        <option value="">Select a role</option>
                        {roleData.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.RoleId && formik.errors.RoleId && (
                        <div className="invalid-feedback">
                          {formik.errors.RoleId}
                        </div>
                      )}
                    </div>
                  </Col>
                )}

              {/* Salon ID */}
              {selectedRole?.role_name === "Salon Manager" && (
                <Col lg={6}>
                  <div className="mb-3">
                    <Label htmlFor="salon" className="form-label">
                      Salon
                    </Label>
                    <select
                      className="form-select"
                      value={formik.values.salonId}
                      onChange={handleSalonChange}
                    >
                      <option value="">Select a salon</option>
                      {salonData?.length > 0 &&
                        salonData?.map((salon) => (
                          <option key={salon.salon_id} value={salon.salon_id}>
                            {salon.salon_name}
                          </option>
                        ))}
                    </select>
                    {formik.touched.salonId && formik.errors.salonId && (
                      <div className="invalid-feedback">
                        {formik.errors.salonId}
                      </div>
                    )}
                  </div>
                </Col>
              )}
            </Row>
            {/* Add/Update Buttons */}
            <div className="text-end">
              <Button color="light" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="success"
                className="ms-2"
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
          </Form>
        </ModalBody>
      </Modal>
      <DeleteModal
        show={deleteModal}
        showSpinner={showSpinner}
        onDeleteClick={handleDeleteUser}
        onCloseClick={toggleDeleteModal}
        title={
          selectedUser !== null ? selectedUser.username.toString() : undefined
        }
        // Convert to string or undefined
      />
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default UserTable;
