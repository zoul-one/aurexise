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

        # Warehouse (change this)
        # pr.set_warehouse = "Stores - Your Company"

        # Loop through child table
        for d in self.details:

            item = pr.append("items", {})

            item.item_code = d.item or d.product_name
            item.qty = d.quantity or 1

            item.custom_gross_weight = d.gross_weight
            item.custom_net_weight = d.net_weight
            item.custom_stone_weight = d.stone_weight

            # Rate
            item.rate = d.total_amound or 0
            item.amount = item.qty * item.rate

        pr.insert(ignore_permissions=True)
        pr.submit()

        #self.db_set("purchase_receipt", pr.name)
