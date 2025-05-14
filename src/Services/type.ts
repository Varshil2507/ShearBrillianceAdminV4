export interface Barber {
  id: number;
  // name: string;
  firstname: string; // Add this line
  lastname: string; // Add this line
  mobile_number: string; // Add this line
  email: string;
  password: string; // Add password field
  // Add this line
  address: string; // Add this line
  availability_status: string;
  //created_at: string;
  profile_photo: string;
  start_time:string;
  end_time:string;
  cutting_since?: string;
  organization_join_date?: string;
  SalonId: number;
 // salon: object | null;
}


export interface Blog {
  id: number;
  title: string;
  description: string;
  photo: string;
}

export interface Notification {
  id: number;
  createdAt: string;
  title: string;
  body: string;
  image_url: string;
}


export interface Role {
  id: number;
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
}

export interface Service {
  id: number;
  name: string;
  price:number;
  estimate_wait_time: string;
  isActive: boolean;
  created_at: string;
  updatedAt: string;
}

export interface HaircutDetail {
  id: number;
  appointment_id: string;
  UserId: string;
  customer_notes: string;
  haircut_style: string;
  pruduct_used: string;
  barber_notes: string;
  created_at: string;
}

// src/Services/type.ts
export interface User {
  id: number;                          // Required
  username: string;                    // Required
  firstname: string;                   // Required
  lastname: string;                    // Required
  address: string;                     // Required
  mobile_number?: string;              // Optional
  email: string;                       // Required
  google_token?: string;               // Optional
  apple_token?: string;                // Optional
  password?: string;                    // Required
  RoleId: string;                      // Required
  created_at: string;                  // Required
  SalonId: number;                     // Required
  profile_photo?: string;              // Optional
}

// src/Services/type.ts
export interface Customer {
  id: number;                          // Required
  username: string;                    // Required
  firstname: string;                   // Required
  lastname: string;                    // Required
  address: string;                     // Required
  mobile_number?: string;              // Optional
  email: string;                       // Required
  google_token?: string;               // Optional
  apple_token?: string;                // Optional
  password?: string;                    // Required
  RoleId: string;                      // Required
  created_at: string;                  // Required
  SalonId: number;                     // Required
  profile_photo?: string;              // Optional
}

export interface HaircutDetail {
  id: number;
  appointment_id: string;
  UserId: string;
  customer_notes: string;
  haircut_style: string;
  pruduct_used: string;
  barber_notes: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string; // Required field
  firstname: string; // Required field
  lastname: string; // Required field
  email: string; // Required field
  address: string; // Required field
  created_at: string; // Required field
  photo?: string; // Optional field
  mobile_number?: string; // Optional field
  google_token?: string; // Optional field
  apple_token?: string; // Optional field
  password?: string; // Optional field
  RoleId: string; // Required field
  SalonId: number; // Required field
  profile_photo?: string; // Optional field
  // Add any other required properties here
}

export interface Salon {
  id: number;
  name: string;
  firstname:string;
  lastname:string;
  fullname:string;
  email:string;
  password:string;
  address: string;
  phone_number: string;
  open_time: string;
  close_time: string;
  weekend_day: boolean;
  weekend_start: string; // Use Date type if needed
  weekend_end: string; // Use Date type if needed
  photos: string; // URL for the photo
  // Service: string; // Description of services offered
  //Faq: Record<string, string>; // FAQs in key-value pairs
  //Pricing: Record<string, string>; // Pricing details
  google_url: string; // URL to Google listing
  user: any;
  // Status: string; // "open" or "close"
  //created_at: string; // Created date
}

export interface Appointments {
  id: number;
  user_id: number;
  barber_id: number; // Required field
  salon_id: number; // Required field
  number_of_people: number; // Required field
  name: string; // Required field
  mobile_number: string; // Required field
  // Add any other required properties here
}

export interface LoginData {
  email: string; // Assuming you're using email for login
  password: string;
}

export interface LoginResponse {
  token: string; // Adjust based on your API response structure
  user: any; // Define the user structure as needed
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  address: string;
  mobile_number: string;
  email: string;
  password: string;
  role_name: string;
  profile_photo: string;
}

export interface ForgetPasswordError {
  error: string;
}