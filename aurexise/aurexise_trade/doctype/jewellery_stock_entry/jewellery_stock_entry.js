// Copyright (c) 2026, Zoul Technologies Private Limited and contributors
// For license information, please see license.txt

frappe.ui.form.on("Jewellery Stock Entry", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button('Add Product', function() {
                open_item_dialog(frm);
            });
        }
    }
});


function open_item_dialog(frm) {
    let d = new frappe.ui.Dialog({
        title: 'Add Product',
        size: 'extra-large',
        fields: [

            { fieldtype: 'Section Break' },

            { label: 'Category', fieldname: 'item', fieldtype: 'Link', options: 'Item' },
            { label: 'Product Name', fieldname: 'product', fieldtype: 'Data' },
            { label: 'Purchase Touch', fieldname: 'touch', fieldtype: 'Float' },
            { label: 'Item Purity', fieldname: 'item_purity', fieldtype: 'Float' },

            { fieldtype: 'Column Break' },

            { label: 'Quantity', fieldname: 'quantity', fieldtype: 'Float', default: 1 },
            { label: 'Gross Weight', fieldname: 'gross_weight', fieldtype: 'Float' },
            { label: 'Stone Weight', fieldname: 'stone_weight', fieldtype: 'Float' },
            { label: 'Net Weight', fieldname: 'net_weight', fieldtype: 'Float', read_only: 1 },

            { fieldtype: 'Column Break' },

            { label: 'Stone (ct)', fieldname: 'stone_ct', fieldtype: 'Float' },
            { label: 'Making %', fieldname: 'making_percent', fieldtype: 'Float' },
            { label: 'Stone Charge (Total)', fieldname: 'stone_charge_total', fieldtype: 'Currency' },
            { label: 'Total Making', fieldname: 'total_making', fieldtype: 'Currency' },
            { label: 'Making In Touch', fieldname: 'making_in_touch', fieldtype: 'Check' },
            { label: 'Have Multiple Stone', fieldname: 'have_multiple_stone', fieldtype: 'Check' },

            { fieldtype: 'Section Break' },

            { label: 'Metal Rate', fieldname: 'metal_rate', fieldtype: 'Currency' },
            { label: 'Making Per Gram', fieldname: 'making_per_gram', fieldtype: 'Currency' },
            { label: 'Diamond Rate Total (ct)', fieldname: 'diamond_rate_total', fieldtype: 'Currency' },
            { label: 'Metal Value', fieldname: 'metal_value', fieldtype: 'Currency' },
            { label: 'Tax Amount', fieldname: 'tax_amount', fieldtype: 'Currency' },

            { fieldtype: 'Column Break' },

            { label: 'Piece Rate', fieldname: 'piece_rate', fieldtype: 'Currency' },
            { label: 'Certification Charge', fieldname: 'certification_charge', fieldtype: 'Currency' },
            { label: 'Total Amount', fieldname: 'total_amount', fieldtype: 'Currency' },
            { label: 'Grand Total Amount', fieldname: 'grand_total', fieldtype: 'Currency' }

        ],

        primary_action_label: 'Add',
        primary_action(values) {

            let row = frm.add_child('details');

            Object.assign(row, values);

            frm.refresh_field('details');
            frm.dirty();

            d.hide();
        }
    });

    // AUTO CALCULATIONS

    function calculate_net() {
        let gross = d.get_value('gross_weight') || 0;
        let stone = d.get_value('stone_weight') || 0;
        d.set_value('net_weight', gross + stone);
    }

    d.fields_dict.gross_weight.df.onchange = calculate_net;
    d.fields_dict.stone_weight.df.onchange = calculate_net;

    d.show();
}

