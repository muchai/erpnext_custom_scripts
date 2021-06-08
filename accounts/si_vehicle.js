
frappe.ui.form.on('Sales Invoice', {
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
        cur_frm.set_query("delivery_note", function () {
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
        fill_vehicle_dn_details(frm);
    },
    sales_order: function (frm) {
        fill_vehicle_so_details(frm);
    },
    delivery_note: function (frm) {
        fill_vehicle_dn_details(frm);
    },
    setup: function (frm) {
        frm.set_indicator_formatter('item_code',
            function (doc) {
                return (doc.docstatus == 1 || doc.qty <= doc.actual_qty) ? "green" : "orange"
            })
    }
});

//Sales Order Vehicles
var fill_vehicle_so_details = function (frm) {
    if (frm.doc.sales_order) {
        frm.clear_table('sales_invoice_vehicle');
        frappe.model.with_doc('Sales_Order', frm.doc.sales_order, function () {
            let source_doc = frappe.model.get_doc('Sales Order', frm.doc.sales_order);
            $.each(source_doc.sales_order_vehicle, function (index, vehiclesrow) {
                const target_row = frm.add_child('sales_invoice_vehicle');
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
                frm.refresh_field('sales_invoice_vehicle');
            });
        });
    }
};

//Delivery Note Vehicles
var fill_vehicle_dn_details = function (frm) {
    if (frm.doc.delivery_note) {
        frm.clear_table('sales_invoice_vehicle');
        frappe.model.with_doc('Delivery Note', frm.doc.delivery_note, function () {
            let source_doc = frappe.model.get_doc('Delivery Note', frm.doc.delivery_note);
            $.each(source_doc.delivery_note_vehicle, function (index, vehiclesrow) {
                const target_row = frm.add_child('sales_invoice_vehicle');
                target_row.vehicle = vehiclesrow.vehicle;
                target_row.contract_tenure = vehiclesrow.contract_tenure;
                target_row.contract_expiry_date = vehiclesrow.contract_expiry_date;
                target_row.financing_institution = vehiclesrow.financing_institution;
                target_row.hosting_server = vehiclesrow.hosting_server;
                target_row.contact_mobile_no = vehiclesrow.contact_mobile_no;
                target_row.make = vehiclesrow.make;
                target_row.model = vehiclesrow.model;
                target_row.color = vehiclesrow.color;
                target_row.delivery_note = frm.doc.delivery_note,
                target_row.dnv_detail = vehiclesrow.name;
                frm.refresh_field('sales_invoice_vehicle');
            });
        });
    }
};

//Vehicle details
frappe.ui.form.on("Sales Invoice Vehicle", "contract_tenure", function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, 'contract_expiry_date', frappe.datetime.add_months(frm.posting_date, row.contract_tenure));
    frm.refresh_field("contract_expiry_date");
});