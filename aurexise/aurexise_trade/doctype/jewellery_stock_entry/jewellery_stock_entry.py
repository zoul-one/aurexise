# Copyright (c) 2026, Zoul Technologies Private Limited and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class JewelleryStockEntry(Document):

    def on_submit(self):

        # Create Purchase Receipt
        pr = frappe.new_doc("Purchase Receipt")

        # Parent Mapping
        pr.supplier = self.supplier
        pr.posting_date = self.purchase_invoice_date
        pr.company = frappe.defaults.get_global_default("company")
        pr.set_warehouse = "Stores - ZG"

        # Loop through child table
        for d in self.details:

            item = pr.append("items", {})

            item.item_code = d.item
            item.qty = d.weight_in_100_purity
            item.custom_purity = d.item_purity
            item.custom_gross_weight = d.gross_weight
            item.custom_net_weight = d.net_weight
            item.custom_stone_weight = d.stone_weight
            item.custom_metal_value = d.metal_value
            item.custom_total_making = d.total_making
            item.custom_have_multiple_stone = d.have_multiple_stone
            item.custom_metal_rate = d.board_rate
            item.custom_stone_rate = d.stone_charge_total
            item.custom_diamonds_rate = d.diamond_rate_total
            item.custom_no_of_items = d.no_of_items
            item.rate = d.board_rate or 0
            item.warehouse = "Stores - ZG"

        pr.insert(ignore_permissions=True)
        pr.save()

        #self.db_set("purchase_receipt", pr.name)
