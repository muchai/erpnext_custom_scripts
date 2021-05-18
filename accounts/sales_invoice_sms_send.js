
frappe.ui.form.on('Sales Invoice', {
    setup: function (frm) {
        frm.set_indicator_formatter('item_code',
            function (doc) {
                return (doc.docstatus == 1 || doc.qty <= doc.actual_qty) ? "green" : "orange"
            })
    },
    refresh: function (frm) {
        cur_frm.add_fetch('territory', 'tc_name', 'tc_name')
    },
    on_submit: function (frm) {
        send_sms(frm);
    }
});

//Send SMS
var send_sms = function (frm) {
    if (frm.doc.is_return === 0) {
        if (frm.doc.send_sms === 1 && frm.doc.mobile_contact_no) {
            var message = 'Dear, ' + frm.doc.customer + ', Invoice: ' + frm.doc.name + ', Grand Total: ' + formatter.format(frm.doc.grand_total) + ', created at: ' + frm.doc.company;
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
}

// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'Ksh',
});