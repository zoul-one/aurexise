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

            { label: 'Item', fieldname: 'item', fieldtype: 'Link', options: 'Item', reqd: 1,
                onchange: function() {
                    let item_code = d.get_value('item');
                    if (item_code) {
                        frappe.db.get_value('Item', item_code, 'item_name')
                            .then(r => {
                                if (r.message) {
                                    d.set_value('product_name', r.message.item_name);
                                }
                            });
                    }
                }
            },
            { label: 'Product Name', fieldname: 'product_name', fieldtype: 'Data' },
            { 
                label: 'Item Purity', fieldname: 'item_purity', fieldtype: 'Link', options: 'Purity' , reqd: 1,
                    onchange: function () {
                        let purity = d.get_value('item_purity');

                        if (purity) {

                            frappe.db.get_value(
                                'Purity',
                                purity,
                                'purity_percentage'
                            ).then(r => {

                                d.set_value(
                                    'purity_percentage',
                                    r.message.purity_percentage
                                );
                            });
                        }
                    }
            },
            { label: 'Purity %', fieldname: 'purity_percentage', fieldtype: 'Float'},

            { fieldtype: 'Column Break' },

            { label: 'No of Items', fieldname: 'no_of_items', fieldtype: 'Float', reqd: 1},
            { label: 'Gross Weight', fieldname: 'gross_weight', fieldtype: 'Float' , reqd: 1},
            { label: 'Have Stone', fieldname: 'have_stone', fieldtype: 'Check' },
            { label: 'Stone Weight', fieldname: 'stone_weight', fieldtype: 'Float', depends_on: 'eval:doc.have_stone' },
            { label: 'Net Weight', fieldname: 'net_weight', fieldtype: 'Float', read_only: 1 },

            { fieldtype: 'Column Break' },

            { label: 'Stone (ct)', fieldname: 'stone_ct', fieldtype: 'Float', depends_on: 'eval:doc.have_stone'},
            { label: 'Stone Charge (Total)', fieldname: 'stone_charge_total', fieldtype: 'Currency', depends_on: 'eval:doc.have_stone' },
            { label: 'Have Multiple Stone', fieldname: 'have_multiple_stone', fieldtype: 'Check', depends_on: 'eval:doc.have_stone' },
            { label: 'Weight in 100 Purity', fieldname: 'weight_in_100_purity', fieldtype: 'Float', read_only: 1 },
            { fieldtype: 'Section Break' },

            { label: 'Making In Touch', fieldname: 'making_in_touch', fieldtype: 'Check' ,             
            onchange: function() {
                if (d.get_value('making_in_touch')) {
                    d.set_value('making_in_charge', 0);
                }
            }},
            { label: 'Making In Charge', fieldname: 'making_in_charge', fieldtype: 'Check' ,             
            onchange: function() {
                if (d.get_value('making_in_charge')) {
                    d.set_value('making_in_touch', 0);
                }
            }},
            { label: 'Purchase Touch', fieldname: 'touch', fieldtype: 'Float', depends_on: 'eval:doc.making_in_touch' },
            { label: 'Default MC Type', fieldname: 'default_mc_type', fieldtype: 'Select',  options: ['Fixed', 'Percentage'], depends_on: 'eval:doc.making_in_charge'},
            { label: 'Default MC Charge %', fieldname: 'default_mc_charge_percentage', fieldtype: 'Float',depends_on: 'eval:doc.default_mc_type == "Percentage"' },
            { label: 'Default MC Amount', fieldname: 'default_mc_amount', fieldtype: 'Currency',depends_on: 'eval:doc.default_mc_type == "Fixed"' },
            { label: 'Board Rate', fieldname: 'board_rate', fieldtype: 'Currency' },
            { label: 'Making Per Gram', fieldname: 'making_per_gram', fieldtype: 'Currency' ,depends_on: 'eval:doc.making_in_charge'},
            { label: 'Total Making', fieldname: 'total_making', fieldtype: 'Currency' },
            { label: 'Diamond Rate Total (ct)', fieldname: 'diamond_rate_total', fieldtype: 'Currency' },
            { label: 'Metal Value', fieldname: 'metal_value', fieldtype: 'Currency' },
        
            { fieldtype: 'Column Break' },

            { label: 'Piece Rate', fieldname: 'piece_rate', fieldtype: 'Currency' },
            { label: 'Certification Charge', fieldname: 'certification_charge', fieldtype: 'Currency' },
            { label: 'Tax Amount', fieldname: 'tax_amount', fieldtype: 'Currency' },
            { label: 'Total Amount', fieldname: 'total_amount', fieldtype: 'Currency' },
            { label: 'Grand Total Amount', fieldname: 'grand_total', fieldtype: 'Currency' }

        ],

        primary_action_label: 'Add',
        primary_action(values) {

            let row = frm.add_child('details');

            Object.assign(row, values);

            frm.refresh_field('details');
            frm.save().then(() => {
                frappe.msgprint(__('Product Added Successfully'));
                d.hide();
            });
        }
    });

    // AUTO CALCULATIONS

    function calculate_net() {
        let gross = d.get_value('gross_weight') || 0;
        let stone = d.get_value('stone_weight') || 0;
        d.set_value('net_weight', gross - stone);
    }
    function calculate_metal_value() {
        let board_rate = d.get_value('board_rate') || 0;
        let net_weight = d.get_value('net_weight') || 0;

        let metal_value = board_rate * net_weight;
        d.set_value('metal_value', metal_value);
    }

    function calculate_total_amount() {
        let metal_value = d.get_value('metal_value') || 0;
        let total_making = d.get_value('total_making') || 0;
        let stone_charge_total = d.get_value('stone_charge_total') || 0;

        // Total Amount
        let total_amount = metal_value + total_making + stone_charge_total;
        d.set_value('total_amount', total_amount);
    }
    function calculate_grand_total() {
        let total_amount = d.get_value('total_amount') || 0;
        let tax_amount = d.get_value('tax_amount') || 0;

        // Total Amount
        let grand_total = total_amount + tax_amount
        d.set_value('grand_total', grand_total);
    }
    function calculate_weight_in_100_purity() {
        let net_weight = d.get_value('net_weight') || 0;
        let purity = d.get_value('purity_percentage') || 0;

        // Total Amount
        let weight_in_100_purity = net_weight * purity / 100
        d.set_value('weight_in_100_purity', weight_in_100_purity);
    }

    d.fields_dict.gross_weight.df.onchange = calculate_net;
    d.fields_dict.stone_weight.df.onchange = calculate_net;
    d.fields_dict.board_rate.df.onchange = calculate_metal_value;
    d.fields_dict.net_weight.df.onchange = calculate_metal_value;
    d.fields_dict.total_making.df.onchange = calculate_total_amount;
    d.fields_dict.stone_charge_total.df.onchange = calculate_total_amount;
    d.fields_dict.metal_value.df.onchange = calculate_total_amount;
    d.fields_dict.total_amount.df.onchange = calculate_grand_total;
    d.fields_dict.tax_amount.df.onchange = calculate_grand_total;
    d.fields_dict.purity_percentage.df.onchange = calculate_weight_in_100_purity;
    d.fields_dict.net_weight.df.onchange = calculate_weight_in_100_purity;

    d.show();
}

