frappe.ui.form.on('Payment Entry', {
    refresh: function (frm) {
        get_supplier_details(frm);
    },
    party: function (frm) {
        get_supplier_details(frm);
    },
    validate: function (frm) {
        update_total_charges_deducted(frm);
    },
    on_submit: function (frm) {
        send_sms(frm);
    }
});

//Begin of Functions
//Get supplier details
var get_supplier_details = function (frm) {
    if ((frm.doc.party_type == 'Supplier') && (frm.doc.party)) {
        frappe.model.with_doc(frm.doc.party_type, frm.doc.party, function () {
            let party = frappe.model.get_doc(frm.doc.party_type, frm.doc.party);
            let twcfieldname = 'tax_withholding_category';
            let sendsmsfieldname = 'send_sms';
            let sendmobilecontactno = 'mobile_contact_no';
            if (!frm.doc.tax_withholding_category) {
                frm.set_value('tax_withholding_category', party[twcfieldname]);
            }
            if (!frm.doc.send_sms) {
                frm.set_value('send_sms', party[sendsmsfieldname]);
            }
            if (!frm.doc.mobile_contact_no) {
                frm.set_value('mobile_contact_no', party[sendmobilecontactno]);
            }

            refresh_field('tax_withholding_category');
            refresh_field('send_sms');
            refresh_field('mobile_contact_no');
        });
    }
};

//Get and update taxes_and_charges_deducted on references table
var update_total_charges_deducted = function (frm) {
    if (frm.doc.tax_withholding_category) {
        frappe.model.with_doc("Tax Withholding Category", frm.doc.tax_withholding_category, function () {
            let taxwithholdingcategory = frappe.model.get_doc("Tax Withholding Category", frm.doc.tax_withholding_category);
            $.each(taxwithholdingcategory.accounts, function (index, accountsrow) {
                if (frm.doc.company == accountsrow.company) {
                    let total_taxes_deducted = 0;
                    $.each(frm.doc.references, function (i, row) {
                        if (row.allocated_amount > 0) {
                            frappe.model.with_doc(row.reference_doctype, row.reference_name, function () {
                                let purchase_doc = frappe.model.get_doc(row.reference_doctype, row.reference_name);
                                if (purchase_doc) {
                                    let var_taxes_and_charges_added = purchase_doc['taxes_and_charges_added'];
                                    let var_taxes_and_charges_deducted = flt((accountsrow.tax_withholding_rate / accountsrow.vat_rate) * var_taxes_and_charges_added);
                                    row.taxes_and_charges_added = var_taxes_and_charges_added;
                                    row.taxes_and_charges_deducted = var_taxes_and_charges_deducted;
                                    frm.refresh_field("references");
                                    total_taxes_deducted += flt(row.taxes_and_charges_deducted);
                                }
                            });
                        }
                    });
                    //Update paid amount and Create deductions and losses
                    create_deductions_and_losses(frm, accountsrow, total_taxes_deducted);
                }
            });
        });
    }
};

//Update paid amount and Create deductions and losses
var create_deductions_and_losses = function (frm, accountsrow, total_taxes_deducted) {
    let new_paid_amount = 0;
    frm.doc.original_paid_amount = frm.doc.received_amount;
    frm.doc.total_taxes_and_charges_deducted = total_taxes_deducted;
    new_paid_amount = frm.doc.received_amount - frm.doc.total_taxes_and_charges_deducted;
    frm.doc.paid_amount = new_paid_amount;
    refresh_field('original_paid_amount');
    refresh_field('total_taxes_and_charges_deducted');
    refresh_field('paid_amount');

    frm.clear_table('deductions');

    let wht_amount = 0;
    if (frm.doc.total_taxes_and_charges_deducted > 0) {
        wht_amount = (frm.doc.total_taxes_and_charges_deducted * -1);
    } else {
        wht_amount = frm.doc.total_taxes_and_charges_deducted;
    }

    let row = frm.add_child('deductions', {
        account: accountsrow.account,
        cost_center: accountsrow.cost_center,
        amount: wht_amount
    });

    frm.refresh_field('deductions');
};

//Send SMS
var send_sms = function (frm) {
    if ((frm.doc.party_type == 'Supplier') && (frm.doc.party)) {
        if (frm.doc.send_sms === 1 && frm.doc.mobile_contact_no) {
            var message = 'Dear, ' + frm.doc.party + ', Payment ref: ' + frm.doc.name + ', has been processed, please pick your cheque at: ' + frm.doc.company;
            frappe.call({
                method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
                args: {
                    receiver_list: [frm.doc.mobile_contact_no],
                    msg: message,
                },
                callback: function (r) {
                    if (r.exc) {
                        msgprint(r.exc);
                        return;
                    }
                }
            });
        }
    }
};