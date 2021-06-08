frappe.ui.form.on('Sales Invoice', {
    after_save: function (frm) {
        fill_vehicle_details(frm);
    }
});

//Fill vehicle details from source document
var fill_vehicle_details = function (frm) {

    frm.clear_table('sales_invoice_vehicle');

    unique_sales_orders = list_of_unique_source_docs(frm, 's_order');

    unique_delivery_notes = list_of_unique_source_docs(frm, 'd_note');

    if (unique_sales_orders.length > 0) {
        unique_sales_orders.forEach(function (sales_order) {
            frappe.model.with_doc('Sales Order', sales_order, function () {
                let source_doc = frappe.model.get_doc('Sales Order', sales_order);
                if (source_doc) {
                    $.each(source_doc.sales_order_vehicle, function (index, vehiclesrow) {
                        //Create vehicle details from source document
                        create_target_vehicle_details(frm, source_doc, vehiclesrow);
                    });
                }
            });
        });
    } else if (unique_delivery_notes.length > 0) {
        unique_delivery_notes.forEach(function (delivery_note) {
            frappe.model.with_doc('Delivery Note', delivery_note, function () {
                let source_doc = frappe.model.get_doc('Delivery Note', delivery_note);
                if (source_doc) {
                    $.each(source_doc.delivery_note_vehicle, function (index, vehiclesrow) {
                        //Create vehicle details from source document
                        create_target_vehicle_details(frm, source_doc, vehiclesrow);
                    });
                }
            });
        });
    }
    frm.refresh_field('sales_invoice_vehicle');
};

//Create vehicle details from source document
var create_target_vehicle_details = function (frm, source_doc, vehiclesrow) {
    let row = frm.add_child('sales_invoice_vehicle', {
        vehicle: vehiclesrow.vehicle,
        contract_tenure: vehiclesrow.contract_tenure,
        contract_expiry_date: vehiclesrow.contract_expiry_date,
        financing_institution: vehiclesrow.financing_institution,
        hosting_server: vehiclesrow.hosting_server,
        contact_mobile_no: vehiclesrow.contact_mobile_no,
        make: vehiclesrow.make,
        model: vehiclesrow.model,
        color: vehiclesrow.color,
        sales_order: source_doc,
        delivery_note: source_doc,
        sov_detail: vehiclesrow.name
    });
};

//List of unique Sales Orders/Delivery Notes
var list_of_unique_source_docs = function (frm, source_doctype) {
    if (frm.doc.items) {
        $.each(frm.doc.items, function (i, row) {
            let source_docs = [];
            if (source_doctype === 's_order') {
                source_docs.push(row.sales_order);
            } else {
                source_docs.push(row.delivery_note);
            }
        });
        let unique_source_docs = Array.from(new Set(source_docs));
        return unique_source_docs;
    }
};