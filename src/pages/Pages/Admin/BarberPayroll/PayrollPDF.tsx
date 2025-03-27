import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatHours } from "Components/Common/DateUtil";

// Define styles
const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 10, backgroundColor: "#f9f9f9" },
    title: { fontSize: 14, fontWeight: "bold", marginBottom: 5, textAlign: "center" },
    subtitle: { fontSize: 10, marginBottom: 10, textAlign: "center" },
    detailtitle: { fontSize: 10, fontWeight: "bold", marginBottom: 10 },
    section: { marginBottom: 8, padding: 10, borderBottom: "1px solid #ccc" },
    table: { width: "100%", marginVertical: 5 },
    row: { flexDirection: "row", borderBottom: "1px solid black" },
    headerCell: {
        flex: 1,
        fontWeight: "bold",
        padding: 5,
        backgroundColor: "#405189",
        color: "white",
        textAlign: "center",
        fontSize: 9, // Make sure font size is applied
    },
    cell: {
        flex: 1, padding: 5, textAlign: "center",
        fontSize: 8, // Reduce font size
    },
    subSection: { marginLeft: 10, borderLeft: "2px solid gray", paddingLeft: 10 },
});

const PayrollPDF = ({
    payrollData,
    selectedSalonInfo,
    selectedStartDate,
    selectedEndDate,
}: {
    payrollData: any[];
    selectedSalonInfo: any;
    selectedStartDate: string;
    selectedEndDate: string;
}) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Payroll Report</Text>
            <Text style={styles.subtitle}>
                Salon: {selectedSalonInfo?.name || "N/A"} | Date: {selectedStartDate || "N/A"} - {selectedEndDate || "N/A"}
            </Text>
            {payrollData.map((employee) => (
                <View key={employee.id} style={styles.section}>
                    <Text style={styles.detailtitle}>{employee.name} - Total: ${employee.grandTotal}</Text>
                    <View style={styles.table}>
                        <View style={styles.row}>
                            {['Total Hours', 'Working Hours', 'Appointments', 'Services', 'Tips', 'Tax', 'Total (with Tax)', 'Total (without Tax)'].map((header) => (
                                <Text key={header} style={styles.headerCell}>{header}</Text>
                            ))}
                        </View>
                        <View style={styles.row}>
                            {[employee.totalHours, employee.workingHours, employee.appointments, `$${employee.servicesAmount}`, `$${employee.tips}`, `$${employee.tax}`, `$${employee.grandTotal}`, `$${employee.grandTotalWithoutTax}`].map((value, index) => (
                                <Text key={index} style={styles.cell}>{value}</Text>
                            ))}
                        </View>
                    </View>
                    {employee?.details && employee?.details?.length > 0 && (
                        <View style={styles.subSection}>
                            {employee.details.map((detail: any, index: any) => (
                                <View key={index} style={styles.section}>
                                    <Text style={styles.detailtitle}>{detail.Date} - {detail.Day}</Text>
                                    <View style={styles.table}>
                                        <View style={styles.row}>
                                            {['Total Hours', 'Working Hours', 'Appointments', 'Services', 'Tips', 'Tax', 'Total (with Tax)', 'Total (without Tax)'].map((header) => (
                                                <Text key={header} style={styles.headerCell}>{header}</Text>
                                            ))}
                                        </View>
                                        <View style={styles.row}>
                                            {[detail.TotalHours, detail.WorkingHours, detail.Appointments, `$${detail.ServicesAmount}`, `$${detail.Tips}`, `$${detail.Tax}`, `$${detail.GrandTotal}`, `$${detail.GrandTotalWithoutTax}`].map((value, idx) => (
                                                <Text key={idx} style={styles.cell}>{value}</Text>
                                            ))}
                                        </View>
                                    </View>
                                    {detail.CompletedAppointments.length > 0 && (
                                        <View style={styles.subSection}>
                                            <Text style={styles.detailtitle}>Completed Appointments</Text>
                                            <View style={styles.table}>
                                                <View style={styles.row}>
                                                    {['Duration', 'Amount', 'Payment Mode', 'Tips', 'Tax', 'Grand Total'].map((header) => (
                                                        <Text key={header} style={styles.headerCell}>{header}</Text>
                                                    ))}
                                                </View>
                                                {detail.CompletedAppointments.map((appointment: any, idx: any) => (
                                                    <View key={idx} style={styles.row}>
                                                        {[appointment.WorkingHours, `$${appointment.ServicesAmount}`, `${appointment.PaymentMode === "Pay_Online" ? "Pay Online" : "Pay at Salon"}`, `$${appointment.Tips}`, `$${appointment.Tax}`, `$${appointment.GrandTotal}`].map((value, i) => (
                                                            <Text key={i} style={styles.cell}>{value}</Text>
                                                        ))}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </Page>
    </Document>
);

export default PayrollPDF;