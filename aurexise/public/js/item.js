frappe.ui.form.on('Item', { 
    custom_is_ornament_item: function(frm) {
        if (frm.doc.custom_is_ornament_item) {
            // Apply filter: only purity UOMs
            frm.set_query('stock_uom', function() {
                return {
                    filters: {
                        custom_is_purity_uom: 1
                    }
                };
            });

        } else {
            // Remove filter (show all UOMs)
            frm.set_query('stock_uom', function() {
                return {};
            });
        }
    }
});