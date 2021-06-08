
frappe.ui.form.on('Sales Order', {
    onload: function (frm) {
        cur_frm.set_query("quotation", function () {
            return {
                "filters": {
                    "docstatus": "1",
                    "company": frm.doc.company,
                    "party_name": frm.doc.customer
                }
            };
        });
    },
    onload_post_render: function (frm) {
        fill_vehicle_details(frm);
    },
    quotation: function (frm) {
        fill_vehicle_details(frm);
    },
    setup: function (frm) {
        frm.set_indicator_formatter('item_code',
            function (doc) {
                return (doc.docstatus == 1 || doc.qty <= doc.actual_qty) ? "green" : "orange"
            })
    },
	validate: function (frm) {
		// calculate total discount for each line item
		var total_discount = 0;
		var total_minimum_rate = 0;
		$.each(frm.doc.items, function (i, d) {
			// calculate total discount            
			total_discount += flt(d.discount_amount);
			// calculate total minimum_rate
			total_minimum_rate += flt(d.price_list_minimum_rate);
		});
		frm.doc.line_discount_total = total_discount;
		frm.doc.minimum_rate_line_total = total_minimum_rate;
	}
});

//Quotation Vehicles
var fill_vehicle_details = function (frm) {
    if (frm.doc.quotation) {
        frm.clear_table('sales_order_vehicle');
        frappe.model.with_doc('Quotation', frm.doc.quotation, function () {
            let source_doc = frappe.model.get_doc('Quotation', frm.doc.quotation);
            $.each(source_doc.quotation_vehicle, function (index, vehiclesrow) {
                const target_row = frm.add_child('sales_order_vehicle');
                target_row.vehicle = vehiclesrow.vehicle;
                target_row.contract_tenure = vehiclesrow.contract_tenure;
                target_row.contract_expiry_date = vehiclesrow.contract_expiry_date;
                target_row.financing_institution = vehiclesrow.financing_institution;
                target_row.hosting_server = vehiclesrow.hosting_server;
                target_row.contact_mobile_no = vehiclesrow.contact_mobile_no;
                target_row.make = vehiclesrow.make;
                target_row.model = vehiclesrow.model;
                target_row.color = vehiclesrow.color;
                target_row.quotation = frm.doc.quotation;
                target_row.qv_detail = vehiclesrow.name;
                frm.refresh_field('sales_order_vehicle');
            });
        });
    }
};

//Update Contract Expiry Date
frappe.ui.form.on("Sales Order Vehicle", "contract_tenure", function (frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, 'contract_expiry_date', frappe.datetime.add_months(frm.transaction_date, row.contract_tenure));
    frm.refresh_field("contract_expiry_date");
});