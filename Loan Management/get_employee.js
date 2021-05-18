//Get employee on loan application/loan, so as user permission on employee apply to both
frappe.ui.form.on('Loan Application', {
    applicant: function (frm) {
        get_employee(frm);
    }
});

//Begin of Functions
//Get employee
var get_employee = function (frm) {
    if ((frm.doc.applicant_type == 'Employee') && (frm.doc.applicant)) {
        frappe.model.with_doc(frm.doc.applicant_type, frm.doc.applicant, function () {
            let emp = frappe.model.get_doc(frm.doc.applicant_type, frm.doc.applicant);

            frm.set_value('employee', emp['name']);

            refresh_field('employee');
        });
    }
};