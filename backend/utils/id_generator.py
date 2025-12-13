import uuid
from datetime import datetime

def generate_id(prefix: str) -> str:
    short_uuid = uuid.uuid4().hex[:8]
    return f"{prefix}_{short_uuid}"

def app_id() -> str:
    return generate_id("app")

def borrower_id() -> str:
    return generate_id("bor")

def guarantor_id() -> str:
    return generate_id("gua")

def lender_id() -> str:
    return generate_id("ldr")

def policy_id() -> str:
    return generate_id("pol")

def match_id() -> str:
    return generate_id("mtc")
