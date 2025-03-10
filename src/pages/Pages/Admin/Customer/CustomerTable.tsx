import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalBody,
  Row,
  Col,
  ModalHeader,
  Spinner,
} from "reactstrap";
import TableContainer from "Components/Common/TableContainer";
import Profile from "../../../../assets/images/users/avatar-8.jpg";
import DeleteModal from "../../../../../src/Components/Common/DeleteModal";
import {
  fetchUsers,
  fetchUserById,
} from "Services/UserService";
import Loader from "Components/Common/Loader";
import { HaircutDetail } from "Services/type";
import CustomerAppointmentList from "./CustomerAppointmentList";
import { deleteCustomer } from "Services/CustomerService";
import { toast, ToastContainer } from "react-toastify";


// Define the User type based on your database structure
interface Customer {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  address: string;
  mobile_number: string | undefined; // Allow undefined if that's the case in the imported type
  email: string;
  google_token: string;
  apple_token: string;
  password: string; // Add this line
  RoleId: string;// Adjust to match the expected type
  created_at: string;
  SalonId: number;
  profile_photo: string;
  salon: object | null; // Add this line
  role: object | null; // Add this line
}

export const USERS_ENDPOINT = "/users";
export const SALON_ENDPOINT = "/salon/admin";
export const ROLE_ENDPOINT = '/roles'

const CustomerTable: React.FC = () => {
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [customerDataTemp, setCustomerTempData] = useState<Customer[]>([]);
  const [modal, setModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null); // State for the customer to delete
  const [errors, setErrors] = useState<any>({});

  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedSearchText, selectedSearch] = useState<null>(null);
  const [selectedCurrentPage, setCurrentPage] = useState<number | null>(0);
  const [selectedTotalItems, setTotalItems] = useState<number | null>(0);
  const [selectedTotalPages, setTotalPages] = useState<number | null>(0);
  const [card, setCard] = useState<any>();
  const [selectedCutomerDetails, setSelectedCutomerDetails] = useState<any>();
  const limit = 10; // Items per page

  // Toggle modal visibility
  const toggleModal = () => setModal(!modal);

  useEffect(() => {

    getCustomers(1, null);

  }, []);

  // Search functionality
  const searchList = (searchTerm: string) => {
    const customers = customerDataTemp.filter(
      (customer) =>
        customer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCustomerData(customers);
  };

  // const fetchHaircutDetailList = async () => {
  //   try {
  //     const response: any = await fetchHaircutDetails();
  //     setHaircutDetails(response);
  //   } catch (error) {
  //     console.error("Error fetching barbers:", error);
  //   }
  // };

  // fetchHaircutDetailList();

  const getCustomers = async (page: any, search: any) => {
    try {
      const response: any = await fetchUsers(null, 'customer', page === 0 ? 1 : page, limit, search ?? null);
      const users = response.users.map((usr: any) => {
        usr.fullname = usr.firstname + " " + usr.lastname;
        return usr;
      })
      setTotalItems(response?.totalItems);
      setTotalPages(response?.totalPages);
      setCustomerData(users);
      setCustomerTempData(users);
      if (customerData?.length === 0) {
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

  const handlePageChange = (pageIndex: number) => {
    const total = pageIndex + 1;
    setCurrentPage(pageIndex);
    setShowLoader(true);
    getCustomers(total, selectedSearchText);
    console.log('Current Page Index:', pageIndex);
    // Handle page change logic here
  };

  const handleSearchText = (search: any) => {
    selectedSearch(search);
    if (search) {
      getCustomers(1, search);
    } else {
      getCustomers(selectedCurrentPage ? selectedCurrentPage + 1 : 1, search);
    }
    // Handle page change logic here
  };
  // Delete customer function
  const handleDeleteUser = async () => {
    if (selectedCustomer !== null) {
      try {
        await deleteCustomer(selectedCustomer.id);

        // Remove the deleted user from the local state
        setCustomerData((prevData) =>
          prevData.filter((customer) => customer.id !== selectedCustomer.id)
        );

        setDeleteModal(false); // Close the delete confirmation modal
        setSelectedCustomer(null); // Reset selected user ID
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };
  const [loadingRow, setLoadingRow] = useState<number | null>(null); // Track which row is loading

  useEffect(() => {
    console.log("loadingRow updated:", loadingRow);
  }, [loadingRow]);
  const columns = useMemo(
    () => [
      {
        header: "Photo",
        accessorKey: "profile_photo",
        cell: (cell: { getValue: () => string }) => {
          return (
            <img
              src={cell.getValue() ? cell.getValue() : Profile}
              // src={Profile}
              alt="Profile"
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
          )
        },
        enableColumnFilter: false,
      },
      // {
      //   header: "User Name",
      //   accessorKey: "username",
      //   enableColumnFilter: false,
      // },
      {
        header: "Full Name",
        accessorKey: "fullname",
        enableColumnFilter: false,
      },
      // {
      //   header: "Address",
      //   accessorKey: "address",
      //   enableColumnFilter: false,
      // },
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
        header: "Details",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell: { row: { original: any } }) => {
          const row = cell.row.original;
          return (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => handleDetailsClick(row)}
                disabled={loadingRow === row.id} // Disable button if it's loading
              >
                {loadingRow === row.id ? (
                  <>
                    <Spinner size="sm" />
                  </>
                ) : (
                  "Details"
                )}
              </button>
            </div>
          );
        },
      },

    ],
    [customerData, loadingRow]
  );
  // const columns1 = useMemo(
  //   () => [
  //     {
  //       header: "Style",
  //       accessorKey: "haircut_style",
  //       enableColumnFilter: false,
  //     },
  //     {
  //       header: "Barber notes",
  //       accessorKey: "barber_notes", // Add SalonId column for "Salon Name"
  //       enableColumnFilter: false,
  //     },
  //     {
  //       header: "Product used",
  //       accessorKey: "product_used",
  //       enableColumnFilter: false,
  //     },
  //     {
  //       header: "Customer notes",
  //       accessorKey: "customer_notes",
  //       enableColumnFilter: false,
  //     },
  //   ],
  //   [haircutDetailData]
  // );

  const [modall, setModall] = useState<boolean>(false);
  const [images, setImages] = useState<any>([]);
  const handleOpen = () => {
    setModall(!modall);
    // setCardHead(null);
  };

  const toggle = () => {
    if (modal) {
      setModal(false);
      setImages([]);
      setCard(null);
    } else {
      setModal(true);
      // setAssignTag([]);
    }
  };

  const handleDetailsClick = async (row: any) => {
    console.log("Setting loadingRow to:", row.id);
    setLoadingRow(row.id); // Set the loading row

    try {
      // Simulate an API call or data processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Processing complete for row:", row.id);

      // Call your card edit function
      handleCardEdit(row);
    } catch (error) {
      console.error("Error handling details click:", error);
    }
  };

  const handleCardEdit = async (arg: any) => {
    try {
      const userDetails = await fetchUserById(arg.id);
      setLoadingRow(null); // Reset the loading state
      setSelectedCutomerDetails(userDetails.user);
      setModal(true);
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

    // let card = arg;
    // setCard({
    //   profile_photo: card.profile_photo,
    //   fullname: card.fullname,
    //   mobile_number: card.mobile_number,
    //   email: card.email,
    //   role_name: card.role.role_name,

    // });
    // // setKanbanTasksCards
    // //     (line.id);
    // //     setIsEdit(true);

    // toggle();
  };



  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal); // Toggle the delete modal visibility
  };

  const onClickDelete = (customer: Customer) => {
    setSelectedCustomer(customer); // Set the selected role ID for deletion
    setDeleteModal(true); // Open the delete modal
  };

  return (
    <React.Fragment>
      <Row className="g-2 mb-2">
        <Col sm={4}>
          <div className="d-flex justify-content-between mb-2">
            <h5>Customer Management</h5>
          </div>
        </Col>
      </Row>
      {showLoader ? (
        <Loader />
      ) : (
        <TableContainer
          columns={columns}
          data={customerData}
          isGlobalFilter={true}
          customPageSize={limit}
          totalPages={selectedTotalPages ?? 0}
          totalItems={selectedTotalItems ?? 0}
          searchText={handleSearchText}
          currentPageIndex={selectedCurrentPage ?? 0}
          divClass="table-responsive table-card"
          SearchPlaceholder="Search..."
          onChangeIndex={handlePageChange}
        />
      )}

      <Modal
        id="modalForm"
        isOpen={modal}
        toggle={toggle}
        centered={true}
        backdrop="static"
        size="lg" // Prevents closing on outside click
      >
        <ModalHeader toggle={toggle}>Customer Details</ModalHeader>
        <ModalBody>
          {/* <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          > */}


          <div className="form-group mb-3">
            <Row>
              <Col lg={2}>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
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
                              : selectedCutomerDetails?.profile_photo
                                ? selectedCutomerDetails?.profile_photo
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
              <Col lg={8}>
                <div className="d-block">
                  <div className="flex-grow-2 py-2 border-bottom">
                    <b>Full Name: </b>
                    <span>{selectedCutomerDetails?.firstname} {selectedCutomerDetails?.lastname}</span>
                  </div>
                  <div className="flex-grow-2 py-2 border-bottom">
                    <b>Email: </b>
                    <span>{selectedCutomerDetails?.email}</span>
                  </div>
                  <div className="flex-grow-2 py-2 border-bottom">
                    <b>Mobile: </b>
                    <span>{selectedCutomerDetails?.mobile_number ?? 'No data'}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Row className="g-6">
            <Col sm={4}>
              <div className="d-flex justify-content-between">
                <h5>Appointments({selectedCutomerDetails?.appointments?.length})</h5>
              </div>
            </Col>
          </Row>
          <div className="d-block">
            <CustomerAppointmentList appointments={selectedCutomerDetails?.appointments}></CustomerAppointmentList>
          </div>

          {/* {haircutDetailData?.length ? (
            <TableContainer
              columns={columns1}
              data={haircutDetailData}
              customPageSize={limit}
              // totalPages={selectedTotalPages ?? 0}
              // totalItems={selectedTotalItems ?? 0}
              isGlobalFilter={true}
              // currentPageIndex={selectedCurrentPage ?? 0}
              searchText={handleSearchText}
              // onChangeIndex={handlePageChange}
              SearchPlaceholder="Search..."
            />
          ) : (
            <div>No Haircut Data Available</div>
          )} */}

        </ModalBody>
      </Modal>
      {/* Modal for adding/updating customers */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteUser}
        onCloseClick={toggleDeleteModal}
        title={
          selectedCustomer !== null ? selectedCustomer.name.toString() : undefined
        }
      // Convert to string or undefined
      />
      
      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default CustomerTable;
