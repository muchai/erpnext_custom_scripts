
frappe.ui.form.on('Delivery Note', {
    onload: function (frm) {
        cur_frm.set_query("sales_order", function () {
            return {
                "filters": {
                    "docstatus": "1",
                    "company": frm.doc.company,
                    "customer": frm.doc.customer
                }
            };
        });
        cur_frm.set_query("sales_invoice", function () {
            return {
                "filters": {
                    "docstatus": "1",
                    "company": frm.doc.company,
                    "customer": frm.doc.customer
                }
            };
        });
    },
    onload_post_render: function (frm) {
        fill_vehicle_so_details(frm);
        fill_vehicle_si_details(frm);
    },
    sales_order: function (frm) {
        fill_vehicle_so_details(frm);
    },
    sales_invoice: function (frm) {
        fill_vehicle_si_details(frm);
    }
});

//Sales Order Vehicles
var fill_vehicle_so_details = function (frm) {
    if (frm.doc.sales_order) {
        frm.clear_table('delivery_note_vehicle');
        frappe.model.with_doc('Sales_Order', frm.doc.sales_order, function () {
            let source_doc = frappe.model.get_doc('Sales Order', frm.doc.sales_order);
            $.each(source_doc.sales_order_vehicle, function (index, vehiclesrow) {
                const target_row = frm.add_child('delivery_note_vehicle');
                target_row.vehicle = vehiclesrow.vehicle;
                target_row.contract_tenure = vehiclesrow.contract_tenure;
                target_row.contract_expiry_date = vehiclesrow.contract_expiry_date;
                target_row.financing_institution = vehiclesrow.financing_institution;
                target_row.hosting_server = vehiclesrow.hosting_server;
                target_row.contact_mobile_no = vehiclesrow.contact_mobile_no;
                target_row.make = vehiclesrow.make;
                target_row.model = vehiclesrow.model;
                target_row.color = vehiclesrow.color;
                target_row.sales_order = frm.doc.sales_order;
                target_row.sov_detail = vehiclesrow.name;
                frm.refresh_field('delivery_note_vehicle');
            });
        });
    }
};

//Sales Invoice Vehicles
var fill_vehicle_si_details = function (frm) {
    if (frm.doc.sales_invoice) {
        frm.clear_table('delivery_note_vehicle');
        frappe.model.with_doc('Sales Invoice', frm.doc.sales_invoice, function () {
            let source_doc = frappe.model.get_doc('Sales Invoice', frm.doc.sales_invoice);
            $.each(source_doc.sales_invoice_vehicle, function (index, vehiclesrow) {
                const target_row = frm.add_child('delivery_note_vehicle');
                target_row.vehicle = vehiclesrow.vehicle;
                target_row.contract_tenure = vehiclesrow.contract_tenure;
                target_row.contract_expiry_date = vehiclesrow.contract_expiry_date;
                target_row.financing_institution = vehiclesrow.financing_institution;
                target_row.hosting_server = vehiclesrow.hosting_server;
                target_row.contact_mobile_no = vehiclesrow.contact_mobile_no;
                target_row.make = vehiclesrow.make;
                target_row.model = vehiclesrow.model;
                target_row.color = vehiclesrow.color;
                target_row.sales_invoice = frm.doc.sales_invoice;
                target_row.siv_detail = vehiclesrow.name;
                frm.refresh_field('delivery_note_vehicle');
            });
        });
    }
};
//Vehicle details
frappe.ui.form.on("Delivery Note Vehicle", "contract_tenure", function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, 'contract_expiry_date', frappe.datetime.add_months(frm.posting_date, row.contract_tenure));
    frm.refresh_field("contract_expiry_date");
});