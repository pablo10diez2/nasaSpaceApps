def datacenter_spec_esquema(datacenter_spec) -> dict:
    if datacenter_spec is None:
        return None

    return {
        "ID": str(datacenter_spec["_id"]) if "_id" in datacenter_spec else None,
        "Name": datacenter_spec.get("Name"),
        "Below_Amount": datacenter_spec.get("Below_Amount"),
        "Above_Amount": datacenter_spec.get("Above_Amount"),
        "Minimize": datacenter_spec.get("Minimize"),
        "Maximize": datacenter_spec.get("Maximize"),
        "Unconstrained": datacenter_spec.get("Unconstrained"),
        "Unit": datacenter_spec.get("Unit"),
        "Amount": datacenter_spec.get("Amount")
    }

def datacenter_specs_esquema(datacenter_specs) -> list:
    return [datacenter_spec_esquema(spec) for spec in datacenter_specs]
