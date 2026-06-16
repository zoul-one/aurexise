# Copyright (c) 2026, Zoul Technologies Private Limited and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import random
import string

class Ornaments(Document):

    def after_insert(self):
        self.create_item()

    def create_item(self):
        # Generate random item code
        item_code = self.generate_random_code()

        # Create Item document
        item = frappe.get_doc({
            "doctype": "Item",
            "item_code": item_code,
            "item_name": self.ornament_name,
            "item_group": "All Item Groups",
            "stock_uom": self.default_uom,
            "is_stock_item": 1,
            "custom_is_ornament_item": 1,
            "description": f"Ornament: {self.ornament_name}",
        })

        # Insert item ignoring permissions if needed
        item.insert(ignore_permissions=True)

        # Link back to Ornament
        self.db_set("item", item.name)

    def generate_random_code(self, length=8):
        return 'ORN-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))