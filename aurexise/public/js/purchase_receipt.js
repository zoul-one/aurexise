frappe.ui.form.on('Purchase Receipt', {
    refresh(frm) {

        frm.add_custom_button('Split and Create Items', function () {

            if (!frm.doc.items || frm.doc.items.length === 0) {
                frappe.msgprint('No items found');
                return;
            }

            let table_data = [];

            // Create rows based on custom_no_of_items
            frm.doc.items.forEach((item) => {

                let no_of_items = cint(item.custom_no_of_items || 0);

                if (no_of_items <= 0) {
                    frappe.throw(
                        `Please set Custom No Of Items for Item ${item.item_code}`
                    );
                }

                for (let i = 0; i < no_of_items; i++) {

                    table_data.push({
                        purchase_receipt_item: item.name,
                        item_code: item.item_code,
                        purity: item.custom_item_purity,
                        purity_percentage: item.custom_purity_percentage,

                        item_name: item.item_name,
                        weight: 0,
                        stone_weight: 0
                    });

                }

            });

            let d = new frappe.ui.Dialog({
                title: 'Split and Create Jewellery Receipt Items',
                size: 'extra-large',

                fields: [
                    {
                        fieldname: 'items',
                        fieldtype: 'Table',
                        label: 'Items',

                        cannot_add_rows: true,
                        cannot_delete_rows: true,
                        in_place_edit: true,

                        fields: [

                            {
                                fieldtype: 'Data',
                                fieldname: 'item_name',
                                label: 'Name',
                                in_list_view: 1,
                                reqd: 1
                            },

                            {
                                fieldtype: 'Float',
                                fieldname: 'weight',
                                label: 'Weight',
                                in_list_view: 1,
                                reqd: 1
                            },

                            {
                                fieldtype: 'Float',
                                fieldname: 'stone_weight',
                                label: 'Stone Weight',
                                in_list_view: 1
                            }

                        ],

                        data: table_data
                    }
                ],

                primary_action_label: 'Create Items',

                primary_action(values) {

                    let rows = values.items || [];

                    // Group Validation
                    let item_wise_totals = {};

                    rows.forEach(row => {

                        let key = row.purchase_receipt_item;

                        if (!item_wise_totals[key]) {
                            item_wise_totals[key] = {
                                weight: 0,
                                stone_weight: 0
                            };
                        }

                        item_wise_totals[key].weight += flt(row.weight);
                        item_wise_totals[key].stone_weight += flt(row.stone_weight);

                    });

                    // Validate each PR Item
                    frm.doc.items.forEach(item => {

                        let totals = item_wise_totals[item.name] || {
                            weight: 0,
                            stone_weight: 0
                        };

                        if (totals.weight !== flt(item.qty)) {

                            frappe.throw(
                                `Weight mismatch for Item ${item.item_code}. Total should be ${item.qty}`
                            );
                        }

                        if (
                            totals.stone_weight !==
                            flt(item.custom_stone_weight || 0)
                        ) {

                            frappe.throw(
                                `Stone Weight mismatch for Item ${item.item_code}. Total should be ${item.custom_stone_weight || 0}`
                            );
                        }

                    });

                    frappe.confirm(
                        `This will create ${rows.length} Jewellery Receipt Items. Continue?`,

                        function () {

                            let promises = [];

                            rows.forEach((row) => {

                                let source_item = frm.doc.items.find(
                                    i => i.name === row.purchase_receipt_item
                                );

                                console.log(source_item.item_code)

                                let doc = {
                                    doctype: 'Jewellery Receipt Items',

                                    item: source_item.item_code,
                                    item_name: source_item.item_name,

                                    purity: source_item.custom_purity,
                                    purity_percentage: source_item.custom_purity_percentage,

                                    weight: row.weight,
                                    stone_weight: row.stone_weight,

                                    have_stone:
                                        row.stone_weight > 0 ? 1 : 0
                                };

                                promises.push(
                                    frappe.call({
                                        method: 'frappe.client.insert',
                                        args: {
                                            doc: doc
                                        }
                                    })
                                );

                            });

                            Promise.all(promises).then(() => {

                                frappe.msgprint({
                                    title: 'Success',
                                    message: `${rows.length} Jewellery Receipt Items created successfully`,
                                    indicator: 'green'
                                });

                                d.hide();

                                frm.reload_doc();

                            });

                        }
                    );
                }
            });

            d.show();
        });
    }
});