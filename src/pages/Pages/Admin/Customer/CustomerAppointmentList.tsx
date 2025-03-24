import React, { useMemo } from "react";
import { Status } from "../Appointments/AppointmentListCol";
import TableContainer from "Components/Common/TableContainerReactTable";
import { formatDate } from "Components/Common/DateUtil";

const CustomerAppointmentList = ({ appointments }: any) => {

  // const formatDate = (dateString: any) => {
  //   if (!dateString) return ""; // Return an empty string if dateString is invalid
  //   const date = new Date(dateString);
  //   // Get the user's current timezone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const options: Intl.DateTimeFormatOptions = {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric',
  //     timeZone: userTimeZone, // Automatically adapts to the user's location
  //   };

  //   // Get formatted date
  //   const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA ensures YYYY-MM-DD format

  //   // Replace slashes with dashes to ensure YYYY-MM-DD format
  //   return formattedDate.replace(/\//g, '-');
  // };

  const columns = useMemo(
    () => [
      {
        header: "Full Name",
        accessorKey: "name",
        cell: (cell: any) => {
          return cell.getValue() ? cell.getValue() : "Unknown"; // Fallback if the barber is not found
        },
        enableColumnFilter: false,
      },
      {
        header: "Barber Name",
        accessorKey: "Barber.name",
        cell: (cell: any) => {
          return cell.getValue() ? cell.getValue() : "Unknown"; // Fallback if the barber is not found
        },
        enableColumnFilter: false,
      },
      {
        header: "Salon Name",
        accessorKey: "salon.name",
        enableColumnFilter: false,
      },
      {
        header: "Date",
        accessorKey: "check_in_time", // Primary key to bind data
        cell: (cell: { row: { original: any } }) => {
          return formatDate(cell.row.original.appointment_date || cell.row.original.check_in_time);
        },
        enableColumnFilter: false,
      },
      // {
      //   header: "Number Of People",
      //   accessorKey: "number_of_people",
      //   cell: (cell: any) => {
      //     return <NumberOfPeople {...cell} />;
      //   },
      //   enableColumnFilter: false,
      // },
      {
        header: "Status",
        accessorKey: "status",
        cell: (cell: any) => {
          return <Status {...cell} />;
        },
        enableColumnFilter: false,
      },

      // {
      //   header: "Queue Position",
      //   accessorKey: "queue_position",
      //   cell: (cell: any) => {
      //     return <Position {...cell} />;
      //   },
      //   enableColumnFilter: false,
      // },
      //  {
      //   header: "Details",
      //   accessorKey: "id",
      //   enableColumnFilter: false,

      //   cell: (cell: { getValue: () => number; row: { original: any } }) => (
      //     <div>
      //       <button
      //         type="button"
      //         className="btn btn-sm btn-light"
      //         onClick={() => handleDetails(cell.row.original)}
      //       >
      //         Details
      //       </button>
      //     </div>
      //   ),
      // },
    ],
    [appointments]
  );
  return (
    <React.Fragment>
      <TableContainer
        columns={columns}
        data={appointments || []}
        isGlobalFilter={true}
        customPageSize={100}
        divClass="table-responsive table-card mb-3"
        tableClass="align-middle table-nowrap mb-0"
        theadClass="table-light text-muted"
        SearchPlaceholder="Search by barber, salon or name"
      />

    </React.Fragment>
  );
};

export default CustomerAppointmentList;
