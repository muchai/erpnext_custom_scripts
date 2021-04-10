//For parent doc
frappe.ui.form.on('Sales Order', {
    onload: function (frm) {
        cur_frm.set_query("company_payment_terms", function () {
            return {
                filters: [
                    ["Terms and Conditions", "applicable_section", "in", ["Payment Terms"]]
                ]
            };
        });
        cur_frm.set_query("tc_name", function () {
            return {
                filters: [
                    ["Terms and Conditions", "applicable_section", "in", ["Terms and Conditions"]]
                ]
            };
        });
        cur_frm.set_query("cancellation_policy", function () {
            return {
                filters: [
                    ["Terms and Conditions", "applicable_section", "in", ["Cancellation Policy"]]
                ]
            };
        });
        cur_frm.set_query("payment_options", function () {
            return {
                filters: [
                    ["Terms and Conditions", "applicable_section", "in", ["Payment Options"]]
                ]
            };
        });
        cur_frm.set_query("footer_link", function () {
            return {
                filters: [
                    ["Terms and Conditions", "applicable_section", "in", ["Footer"]]
                ]
            };
        });
        cur_frm.add_fetch('footer_link', 'terms', 'footer');
    },
    //Fetch fields from masters
    refresh: function (frm) {
        cur_frm.add_fetch('account_manager_email', 'full_name', 'account_manager_name');
        frm.set_df_property("account_manager_email", "read_only", frm.is_new() ? 0 : 1);
        frm.set_df_property("account_manager_name", "read_only", frm.is_new() ? 0 : 1);
        frm.set_df_property("account_manager_phone", "read_only", frm.is_new() ? 0 : 1);
        cur_frm.add_fetch('company_payment_terms', 'terms', 'payment_terms');
        cur_frm.add_fetch('cancellation_policy', 'terms', 'policy');
        cur_frm.add_fetch('payment_options', 'terms', 'pay_to');

    },
    //Calculate unpaid amount
    validate: function (frm) {
        frm.trigger("calculate_unpaid_amount");
    },
    final_invoice_amount: function (frm) {
        frm.trigger("calculate_unpaid_amount");
    },
    final_paid_amount: function (frm) {
        frm.trigger("calculate_unpaid_amount");
    },
    calculate_final_unpaid_amount: function (frm) {
        if (frm.doc.final_invoice_amount && frm.doc.final_paid_amount) {
            final_unpaid_amount = flt(frm.doc.final_invoice_amount - frm.doc.final_paid_amount);
            frm.set_value('final_unpaid_amount', final_unpaid_amount);
            frm.refresh_field("final_unpaid_amount");
        }
    }
});
//For Childdoctype
frappe.ui.form.on("Sales Order Item", {
    //Fetch reservation_option from item 
    item_code: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.db.get_value("Item", { "name": d.item_code }, "reservation_option", function (value) {
            d.reservation_option = value.reservation_option;
        });
    },
    end_date: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.end_date && row.start_date) { //End date validation on End date change
            if (row.end_date < row.start_date) {
                msgprint('End date is before Start date, please amend to continue');
                validated = false;
            }
        }
        if (row.days && !row.start_date) { //Start date Calculation on End date change
            frappe.model.set_value(cdt, cdn, 'start_date', frappe.datetime.add_days(row.end_date, -row.days));
            frm.fields_dict["start_date"].grid.grid_rows_by_docname[cdn].start_date.refresh();
        }
        if (row.end_date >= row.start_date) { //Days Calculation on End date change
            frappe.model.set_value(cdt, cdn, 'days', frappe.datetime.get_day_diff(row.end_date, row.start_date));
            frm.fields_dict["days"].grid.grid_rows_by_docname[cdn].days.refresh();
        }
    },
    start_date: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.end_date && row.start_date) {
            if (row.end_date < row.start_date) { //End date validation on Start date change
                msgprint('End date is before Start date, please amend to continue');
                validated = false;
            }
        }
        if (row.days) { //End date Calculation on Start date change
            frappe.model.set_value(cdt, cdn, 'end_date', frappe.datetime.add_days(row.start_date, row.days));
            frm.fields_dict["end_date"].grid.grid_rows_by_docname[cdn].end_date.refresh();
        }
        if (row.end_date >= row.start_date) { //Days Calculation on Start date change
            frappe.model.set_value(cdt, cdn, 'days', frappe.datetime.get_day_diff(row.end_date, row.start_date));
            frm.fields_dict["days"].grid.grid_rows_by_docname[cdn].days.refresh();
        }
    },
    days: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.end_date && row.start_date) {
            if (row.end_date < row.start_date) { //End date validation on days change
                msgprint('End date is before Start date, please amend to continue');
                validated = false;
            }
        }
        if (row.start_date) { //End date Calculation on Days change
            frappe.model.set_value(cdt, cdn, 'end_date', frappe.datetime.add_days(row.start_date, row.days));
            frm.fields_dict["end_date"].grid.grid_rows_by_docname[cdn].end_date.refresh();
        }
        if (row.end_date && !row.start_date) { //Start date Calculation on End date change
            frappe.model.set_value(cdt, cdn, 'start_date', frappe.datetime.add_days(row.end_date, -row.days));
            frm.fields_dict["start_date"].grid.grid_rows_by_docname[cdn].start_date.refresh();
        }
    },
    //For Quotation and Sales Order
    //Amount Calculation on qty Change
    qty: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.days && row.rate) {
            frappe.model.set_value(cdt, cdn, 'amount', row.days * row.qty * row.rate);
            frm.fields_dict["amount"].grid.grid_rows_by_docname[cdn].amount.refresh();
        }
    },
    //Amount Calculation on rate Change
    rate: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.days && row.qty) {
            frappe.model.set_value(cdt, cdn, 'amount', row.days * row.qty * row.rate);
            frm.fields_dict["amount"].grid.grid_rows_by_docname[cdn].amount.refresh();
        }
    }
});