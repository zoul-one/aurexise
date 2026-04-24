import frappe
from frappe.utils import *
from frappe import _

@frappe.whitelist()
def get_conversion_factor(from_uom, to_uom):
    """
        method to get conversion factor value using from uom and to uom
        output:
            return conversion factor value if exists else None
    """
    filters = {'from_uom': from_uom, 'to_uom': to_uom}
    return frappe.db.get_value('UOM Conversion Factor', filters, 'value')


@frappe.whitelist()
def get_party_link_if_exist(party_type, party):
    """
        function to check party link exist for party and throw a message if not exists
        args:
            party_type : "Customer" or "Supplier"
            party : name of customer/ supplier
        output:
            party link or message to the user if the party is not linked
    """
    query = """
        SELECT
            name
        FROM
            `tabParty Link`
        WHERE
            (primary_role = %(party_type)s AND primary_party = %(party)s ) OR (secondary_role = %(party_type)s AND secondary_party = %(party)s )
    """
    party_link = frappe.db.sql(query.format(), { 'party_type':party_type, 'party':party }, as_dict = 1)

    if not party_link:
        # message to the user if party link is not set
        frappe.throw( _("{0} doesn't have a common party account!".format(party)))
    else:
        return party_link[0].name




