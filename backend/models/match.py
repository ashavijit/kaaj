from sqlalchemy import Column, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from utils.id_generator import match_id

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id = Column(String, primary_key=True, default=match_id)
    application_id = Column(String, ForeignKey("loan_applications.id"), nullable=False)
    lender_id = Column(String, ForeignKey("lenders.id"), nullable=False)
    policy_id = Column(String, ForeignKey("lender_policies.id"), nullable=False)
    lender_name = Column(String, nullable=True)
    
    eligible = Column(Boolean, nullable=False)
    fit_score = Column(Float, default=0)
    matched_program = Column(String, nullable=True)
    
    criteria_met = Column(JSON, nullable=True)
    criteria_failed = Column(JSON, nullable=True)
    rejection_reasons = Column(JSON, nullable=True)
    
    application = relationship("LoanApplication", back_populates="matches")

