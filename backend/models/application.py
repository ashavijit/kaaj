from sqlalchemy import Column, String, Float, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship
from database import Base
from utils.id_generator import app_id, borrower_id, guarantor_id
import enum

class ApplicationStatus(enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDERWRITING = "underwriting"
    COMPLETED = "completed"

class Borrower(Base):
    __tablename__ = "borrowers"
    
    id = Column(String, primary_key=True, default=borrower_id)
    business_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    state = Column(String(2), nullable=False)
    years_in_business = Column(Integer, nullable=False)
    annual_revenue = Column(Float, nullable=False)
    paynet_score = Column(Integer, nullable=True)
    
    guarantors = relationship("Guarantor", back_populates="borrower", cascade="all, delete-orphan")
    applications = relationship("LoanApplication", back_populates="borrower", cascade="all, delete-orphan")

class Guarantor(Base):
    __tablename__ = "guarantors"
    
    id = Column(String, primary_key=True, default=guarantor_id)
    borrower_id = Column(String, ForeignKey("borrowers.id"), nullable=False)
    name = Column(String, nullable=False)
    fico_score = Column(Integer, nullable=False)
    has_bankruptcy = Column(Integer, default=0)
    has_open_tax_liens = Column(Integer, default=0)
    
    borrower = relationship("Borrower", back_populates="guarantors")

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(String, primary_key=True, default=app_id)
    borrower_id = Column(String, ForeignKey("borrowers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    term_months = Column(Integer, nullable=False)
    equipment_type = Column(String, nullable=False)
    equipment_age_years = Column(Integer, default=0)
    equipment_description = Column(String, nullable=True)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    
    borrower = relationship("Borrower", back_populates="applications")
    matches = relationship("MatchResult", back_populates="application", cascade="all, delete-orphan")
