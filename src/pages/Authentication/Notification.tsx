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
import { showErrorToast, showSuccessToast } from "slices/layouts/toastService";

export const NOTIFICATION_ENDPOINT = "/notification";

const Notification = () => {
  const [modal, setModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [loader, setLoader] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      // Reset form when closing
      setTitle("");
      setDescription("");
      setSelectedImage(null);
    }
  };

  const handleAddButtonClick = () => {
    toggleModal();
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoader(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("body", description.trim());
    formData.append("image", selectedImage || defaultImage); // Use selected image or default

    try {
      const response = await axios.post(NOTIFICATION_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showSuccessToast("Notification sent successfully");
      toggleModal();
    } catch (error: any) {
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message;
        showErrorToast(apiMessage || "An error occurred");
      } else {
        showErrorToast(error.message || "Something went wrong");
      }
    } finally {
      setLoader(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedImage(file); // Save the file object directly
      } else {
        showErrorToast(
          "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."
        );
        event.target.value = ""; // Clear the file input
      }
    } else {
      setSelectedImage(null); // Reset to null if no file is selected
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const inputElement = event.target as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart ?? 0;
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
          <div className="d-flex align-items-start justify-content-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white rounded-3xl shadow-lg max-w-lg text-center border border-gray-200 px-4 py-2">
              <div className="text-5xl mb-3">🔔</div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
                Stay Updated with <span className="text-blue-600">Important Alerts!</span>
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We have something exciting for you! Whether it’s <strong>exclusive deals</strong>,
                important updates, or <strong>special announcements</strong>, we ensure you never miss out.
              </p>
              <div className="bg-blue-50 p-5 rounded-xl text-left shadow-sm">
                <h3 className="text-xl font-semibold text-blue-700 d-flex align-items-center gap-2">
                  ✨ Why Notifications?
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="d-flex align-items-start gap-2">
                    ✅ <span className="text-gray-700">Get real-time updates on offers & features</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    ✅ <span className="text-gray-700">Stay informed about system improvements & alerts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Modal isOpen={modal} toggle={toggleModal} centered backdrop="static">
          <ModalHeader className="modal-title" id="myModalLabel" toggle={toggleModal}>
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
                <Label for="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter title"
                  value={title}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setTitle(e.target.value)}
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
                  onChange={(e) => setDescription(e.target.value)}
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
                disabled={loader || !title.trim() || !description.trim()}
              >
                {loader && <Spinner size="sm" className="me-2">Loading...</Spinner>}
                Send
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </Container>
    </React.Fragment>
  );
};

export default Notification;