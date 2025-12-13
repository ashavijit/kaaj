from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from utils.id_generator import lender_id, policy_id

class Lender(Base):
    __tablename__ = "lenders"
    
    id = Column(String, primary_key=True, default=lender_id)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    policies = relationship("LenderPolicy", back_populates="lender", cascade="all, delete-orphan")

class LenderPolicy(Base):
    __tablename__ = "lender_policies"
    
    id = Column(String, primary_key=True, default=policy_id)
    lender_id = Column(String, ForeignKey("lenders.id"), nullable=False)
    program_name = Column(String, nullable=False)
    
    fico_min = Column(Integer, nullable=True)
    fico_max = Column(Integer, nullable=True)
    paynet_min = Column(Integer, nullable=True)
    
    min_years_in_business = Column(Integer, nullable=True)
    min_annual_revenue = Column(Float, nullable=True)
    
    min_amount = Column(Float, nullable=True)
    max_amount = Column(Float, nullable=True)
    min_term = Column(Integer, nullable=True)
    max_term = Column(Integer, nullable=True)
    
    max_equipment_age = Column(Integer, nullable=True)
    allowed_equipment_types = Column(JSON, nullable=True)
    
    allowed_states = Column(JSON, nullable=True)
    excluded_states = Column(JSON, nullable=True)
    
    excluded_industries = Column(JSON, nullable=True)
    
    no_bankruptcy = Column(Boolean, default=True)
    no_open_tax_liens = Column(Boolean, default=True)
    
    lender = relationship("Lender", back_populates="policies")
