frappe.ui.form.on('Ornaments', {
    refresh(frm) {
        frm.fields_dict.rename_item.$input
            .removeClass('btn-default')
            .addClass('btn-primary');

        set_status_indicator(frm);
    },
    active(frm){
        set_status_indicator(frm);
    },
    rename_item: function(frm) {
        if (!frm.doc.item) {
            frappe.msgprint("No Item linked");
            return;
        }

        open_rename_dialog(frm);
    }
});

function open_rename_dialog(frm) {
    let d = new frappe.ui.Dialog({
        title: 'Rename Item',
        fields: [
            {
                label: 'Current Item Code',
                fieldname: 'current_code',
                fieldtype: 'Data',
                default: frm.doc.item,
                read_only: 1
            },
            {
                label: 'New Item Code',
                fieldname: 'new_code',
                fieldtype: 'Data',
                reqd: 1
            }
        ],
        primary_action_label: 'Rename',
        primary_action(values) {

            if (values.new_code === frm.doc.item) {
                frappe.msgprint("New name is same as current");
                return;
            }

            values.new_code = values.new_code.toUpperCase();

            frappe.confirm(
                `Are you sure you want to rename item to <b>${values.new_code}</b>?`,
                () => {
                    frappe.call({
                        method: 'frappe.client.rename_doc',
                        args: {
                            doctype: 'Item',
                            old_name: frm.doc.item,
                            new_name: values.new_code,
                            merge: false
                        },
                        callback: function(r) {
                            if (!r.exc) {
                                frappe.msgprint("Item renamed successfully");

                                frm.set_value('item', values.new_code);
                                frm.save();

                                d.hide();
                            }
                        }
                    });
                }
            );
        }
    });

    d.show();
}

function set_status_indicator(frm) {
    if (frm.doc.active) {
        frm.page.set_indicator('Active', 'green');
    } else {
        frm.page.set_indicator('Inactive', 'red');
    }
}