import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import defaultImage from "../../assets/images/blog_default_img.jpg";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export const NOTIFICATION_ENDPOINT = "/notification";

const Notification = () => {
  const [modal, setModal] = useState(false); // State to manage modal visibility
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [loader, setLoader] = useState<boolean>(false);
  const [title, setTitle] = useState(""); // Track title input
  const [description, setDescription] = useState(""); // Track description input
  const toggleModal = () => setModal(!modal); // Function to toggle the modal

  const handleAddButtonClick = () => {
    toggleModal(); // Show the modal on button click
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoader(true);

    const payload = {
      title,
      body: description,
      image: selectedImage
        ? URL.createObjectURL(selectedImage) // If an image is selected
        : defaultImage,
    };

    try {
      const response = await axios.post(NOTIFICATION_ENDPOINT, payload);
      toast.success("Send Notification Successfully", { autoClose: 2000 });
      setLoader(false);
    } catch (error: any) {
      setLoader(false);
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message;
        toast.error(apiMessage || "An error occurred");
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      toggleModal(); // Close the modal after submission
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedImage(file); // Save the file object directly
      } else {
        toast.error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.');
        event.target.value = ''; // Clear the file input
      }
    } else {
      setSelectedImage(defaultImage); // Clear the selected image if no file is selected
    }
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

  return (
    <React.Fragment>
      <Container fluid>
        <div className="page-content mt-lg-5">
          <Row className="g-2 mb-4">
            <Col sm={4}>
              <div className="d-flex justify-content-between mb-4">
                <h5>Send Notification All App Users</h5>
              </div>
            </Col>
            <Col className="col-sm-auto ms-auto align-botto">
              <div className="list-grid-nav hstack gap-3">
                <Button color="success" onClick={handleAddButtonClick}>
                  <i className="ri-add-fill me-1 align-bottom"></i> Send Notification
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Modal */}
        <Modal isOpen={modal} toggle={toggleModal} centered backdrop="static">
          <ModalHeader
            className="modal-title"
            id="myModalLabel"
            toggle={() => {
              toggleModal();
            }}
          >
            Send Notification
          </ModalHeader>
          <Form onSubmit={handleFormSubmit}>
            <ModalBody>
              <FormGroup>
                <div className="text-center mb-3">
                  <div className="position-relative d-inline-block">
                    <div className="position-absolute bottom-0 end-0">
                      <Label htmlFor="imageUpload" className="mb-0">
                        <div className="avatar-xs">
                          <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                            <i className="ri-image-fill"></i>
                          </div>
                        </div>
                      </Label>
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
                              : defaultImage
                          }
                          alt="Avatar"
                          className="avatar-md rounded-circle"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Input
                  type="file"
                  id="imageUpload"
                  name="image"
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="username">Title</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={title}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setTitle(e.target.value)} // Update title state
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  placeholder="Enter description"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)} // Update description state
                  required
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                className="btn btn-success"
                disabled={loader || !title.trim() || !description.trim()} // Disable when fields are empty
              >
                {loader && <Spinner size="sm" className="me-2">Loading...</Spinner>}
                Send
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </Container>

      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export default Notification;
