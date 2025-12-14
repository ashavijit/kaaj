import fitz
import re
from typing import Optional, List, Dict, Any
from pathlib import Path


class PDFParser:
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text = self._extract_text()
        self.text_lower = self.text.lower()
    
    def _extract_text(self) -> str:
        doc = fitz.open(self.pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    
    def extract_lender_name(self) -> str:
        filename = Path(self.pdf_path).stem
        name_map = {
            "112025 Rates - STANDARD": "Falcon Equipment Finance",
            "2025 Program Guidelines UPDATED": "Citizens Bank",
            "Advantage++Broker+2025": "Advantage+ Financing",
            "Apex EF Broker Guidelines_082725": "Apex Commercial Capital",
            "EF Credit Box 4.14.2025": "Stearns Bank"
        }
        return name_map.get(filename, filename)
    
    def extract_fico_scores(self) -> Dict[str, Optional[int]]:
        result = {"min": None, "tiers": {}}
        
        tier_patterns = [
            r'Tier\s*(\d)\s*\n?\s*FICO\s*\n?\s*(\d{3})',
            r'FICO.*?Tier\s*(\d).*?(\d{3})',
        ]
        
        for pattern in tier_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_num, score = match
                result["tiers"][f"Tier {tier_num}"] = int(score)
        
        rate_patterns = [
            r'([ABC])\s*Rate\s*Guidelines.*?(\d{3})\+?\s*FICO',
            r'([ABC])\s*Credit.*?(\d{3})\+?\s*FICO',
        ]
        
        for pattern in rate_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_name, score = match
                result["tiers"][f"{tier_name} Rate"] = int(score)
        
        simple_patterns = [
            r'minimum\s*FICO\s*(?:score|requirement)?[:\s]*(\d{3})',
            r'FICO\s*(?:score)?[:\s]*(\d{3})\+',
            r'(\d{3})\+?\s*FICO',
            r'FICO\s*v\d[:\s]*(\d{3})',
        ]
        
        for pattern in simple_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                score = int(match.group(1))
                if 500 <= score <= 850:
                    if result["min"] is None or score < result["min"]:
                        result["min"] = score
                    break
        
        if result["min"] is None and result["tiers"]:
            result["min"] = min(result["tiers"].values())
        
        return result
    
    def extract_paynet_scores(self) -> Dict[str, Optional[int]]:
        result = {"min": None, "tiers": {}}
        
        tier_patterns = [
            r'Tier\s*(\d)\s*\n?\s*Paynet\s*\n?\s*(\d{3})',
            r'Paynet.*?Tier\s*(\d).*?(\d{3})',
        ]
        
        for pattern in tier_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_num, score = match
                result["tiers"][f"Tier {tier_num}"] = int(score)
        
        rate_patterns = [
            r'([ABC])\s*Rate\s*Guidelines.*?(\d{3})\+?\s*PayNet',
            r'([ABC])\s*Credit.*?(\d{3})\+?\s*PayNet',
        ]
        
        for pattern in rate_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_name, score = match
                result["tiers"][f"{tier_name} Rate"] = int(score)
        
        simple_patterns = [
            r'minimum\s*PayNet\s*(?:requirement)?[:\s]*(\d{3})',
            r'PayNet\s*(?:Masterscore)?[:\s]*(\d{3})\+?',
            r'(\d{3})\+?\s*PayNet',
        ]
        
        for pattern in simple_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                score = int(match.group(1))
                if 500 <= score <= 850:
                    if result["min"] is None or score < result["min"]:
                        result["min"] = score
                    break
        
        if result["min"] is None and result["tiers"]:
            result["min"] = min(result["tiers"].values())
        
        return result
    
    def extract_loan_amounts(self) -> Dict[str, Optional[float]]:
        result = {"min": None, "max": None}
        
        def parse_amount(val: str) -> float:
            val = val.replace(",", "").replace(" ", "")
            if val.upper().endswith("K"):
                return float(val[:-1]) * 1000
            if val.upper().endswith("M") or val.upper().endswith("MM"):
                val = val.rstrip("M").rstrip("m")
                return float(val) * 1000000
            return float(val)
        
        range_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:K)?)\s*[-–to]+\s*\$(\d{1,3}(?:,\d{3})*(?:K|M|MM)?)',
            r'Net\s*Financed\s*\$(\d{1,3}(?:,\d{3})*)\s*to\s*\$(\d{1,3}(?:,\d{3})*)',
        ]
        
        amounts_found = []
        for pattern in range_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE)
            for match in matches:
                try:
                    min_amt = parse_amount(match[0])
                    max_amt = parse_amount(match[1])
                    amounts_found.append((min_amt, max_amt))
                except:
                    pass
        
        single_patterns = [
            (r'minimum.*?\$(\d{1,3}(?:,\d{3})*(?:K)?)', 'min'),
            (r'maximum.*?\$(\d{1,3}(?:,\d{3})*(?:K|M)?)', 'max'),
            (r'up\s*to\s*\$(\d{1,3}(?:,\d{3})*(?:K|M)?)', 'max'),
            (r'≤\s*\$(\d{1,3}(?:,\d{3})*)', 'max'),
            (r'\$(\d{1,3}(?:,\d{3})*)\s*loan\s*minimum', 'min'),
        ]
        
        for pattern, amount_type in single_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                try:
                    amount = parse_amount(match.group(1))
                    if amount_type == 'min' and (result["min"] is None or amount < result["min"]):
                        result["min"] = amount
                    elif amount_type == 'max' and (result["max"] is None or amount > result["max"]):
                        result["max"] = amount
                except:
                    pass
        
        if amounts_found:
            all_mins = [a[0] for a in amounts_found]
            all_maxs = [a[1] for a in amounts_found]
            if result["min"] is None:
                result["min"] = min(all_mins)
            if result["max"] is None:
                result["max"] = max(all_maxs)
        
        return result
    
    def extract_years_in_business(self) -> Dict[str, Any]:
        result = {"min": None, "tiers": {}}
        
        tier_patterns = [
            r'Tier\s*(\d)\s*\n?\s*TIB\s*\n?\s*(\d+)',
        ]
        
        for pattern in tier_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_num, years = match
                result["tiers"][f"Tier {tier_num}"] = int(years)
        
        rate_patterns = [
            r'([ABC])\s*Rate\s*Guidelines.*?(\d+)\s*years?\s*(?:time\s*)?in\s*business',
        ]
        
        for pattern in rate_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                tier_name, years = match
                result["tiers"][f"{tier_name} Rate"] = int(years)
        
        simple_patterns = [
            r'(\d+)\+?\s*years?\s*(?:time\s*)?in\s*business',
            r'time\s*in\s*business[:\s]*(\d+)',
            r'TIB[:\s]*(\d+)',
            r'minimum\s*(?:industry\s*)?experience.*?(\d+)\s*years?',
            r'must\s*(?:be\s*)?(?:have\s*)?(?:been\s*)?in\s*business.*?(\d+)\s*years?',
        ]
        
        for pattern in simple_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                years = int(match.group(1))
                if years < 100:
                    if result["min"] is None or years < result["min"]:
                        result["min"] = years
                    break
        
        if result["min"] is None and result["tiers"]:
            tiers_clean = {k: v for k, v in result["tiers"].items() if v < 100}
            if tiers_clean:
                result["min"] = min(tiers_clean.values())
        
        return result
    
    def extract_excluded_industries(self) -> List[str]:
        excluded = set()
        
        industry_patterns = {
            "gambling": ["gambling", "gaming", "casino"],
            "cannabis": ["cannabis", "marijuana", "cbd"],
            "adult entertainment": ["adult entertainment", "adult"],
            "firearms": ["firearms", "weapons", "guns"],
            "tobacco": ["tobacco"],
            "oil & gas": ["oil & gas", "petroleum", "oil/gas"],
            "trucking": ["trucking"],
            "restaurants": ["restaurants"],
            "real estate": ["real estate"],
            "money services": ["msb", "money service"],
            "hazmat": ["hazmat", "hazardous"],
            "nail salons": ["nail salon"],
            "tanning": ["tanning"],
            "tattoo": ["tattoo", "piercing"],
            "beauty salons": ["beauty", "salon"],
            "car wash": ["car wash"],
            "non-profit": ["non-profit", "churches"],
            "logging": ["logging"],
            "payday lending": ["payday"],
            "pawn shops": ["pawn"],
        }
        
        restriction_section = ""
        restriction_patterns = [
            r'(?:excluded|restricted|not\s*(?:accepted|allowed|desired))[:\s]*(.*?)(?:\n\n|\Z)',
            r'industries?\s*(?:we\s*)?(?:do\s*not|don\'t)\s*(?:finance|fund)[:\s]*(.*?)(?:\n\n|\Z)',
            r'Restrictions\s*(.*?)(?:\n\n|\Z)',
            r'Excluded\s*Industry.*?List(.*?)(?:\n\n|\Z)',
        ]
        
        for pattern in restriction_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE | re.DOTALL)
            if match:
                restriction_section += " " + match.group(1)
        
        text_to_check = (self.text_lower + " " + restriction_section.lower())
        
        for industry, keywords in industry_patterns.items():
            for keyword in keywords:
                if keyword in text_to_check:
                    context_patterns = [
                        rf'(?:not|no|excluded?|restrict|prohibit|avoid).*?{keyword}',
                        rf'{keyword}.*?(?:not|excluded?|restrict|prohibit)',
                        rf'•\s*{keyword}',
                    ]
                    for ctx_pattern in context_patterns:
                        if re.search(ctx_pattern, text_to_check):
                            excluded.add(industry.title())
                            break
        
        return list(excluded)
    
    def extract_excluded_states(self) -> List[str]:
        excluded = set()
        
        patterns = [
            r'(?:does\s*not|do\s*not|doesn\'t)\s*lend\s*in[:\s]*(.*?)(?:\n|$)',
            r'excluded?\s*states?[:\s]*(.*?)(?:\n|$)',
            r'not\s*available\s*in[:\s]*(.*?)(?:\n|$)',
            r'Apex\s*does\s*not\s*lend\s*in[:\s]*(.*?)(?:\n|$)',
        ]
        
        state_abbrevs = [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                section = match.group(1).upper()
                for state in state_abbrevs:
                    if re.search(rf'\b{state}\b', section):
                        excluded.add(state)
        
        text_upper = self.text.upper()
        inline_pattern = r'(?:not|no|excluded?|avoid|does\s*not\s*lend).*?([A-Z]{2}(?:\s*,\s*[A-Z]{2})*)'
        match = re.search(inline_pattern, text_upper)
        if match:
            potential_states = re.findall(r'\b([A-Z]{2})\b', match.group(1))
            for state in potential_states:
                if state in state_abbrevs:
                    excluded.add(state)
        
        return list(excluded)
    
    def extract_equipment_types(self) -> Dict[str, List[str]]:
        result = {"allowed": [], "excluded": []}
        
        equipment_categories = [
            "construction", "trucking", "transportation", "medical",
            "manufacturing", "restaurant", "office", "technology",
            "agricultural", "farm", "printing", "material handling",
            "titled", "trailers", "trucks", "machine tools",
            "woodworking", "logging", "janitorial", "copy machines",
            "audio/visual", "automotive", "lawn", "turf", "reefer",
            "electric vehicles", "boats", "aircraft", "atm", "kiosks",
            "furniture", "signage", "copiers"
        ]
        
        for category in equipment_categories:
            if category in self.text_lower:
                exclusion_patterns = [
                    rf'(?:not|no|excluded?|avoid).*?{category}',
                    rf'•\s*{category}',
                ]
                is_excluded = False
                for pattern in exclusion_patterns:
                    if re.search(pattern, self.text_lower):
                        is_excluded = True
                        break
                
                if is_excluded:
                    result["excluded"].append(category.title())
                else:
                    result["allowed"].append(category.title())
        
        return result
    
    def extract_rates(self) -> Dict[str, Any]:
        result = {"rates": [], "rate_adjustments": []}
        
        rate_patterns = [
            r'([A-E])\s*(?:Rate|Credit)?\s*\n?.*?(\d+\.\d+)%',
            r'(\d+\.\d+)%\s*[-–]\s*([A-E])\s*(?:Rate|Credit)',
        ]
        
        for pattern in rate_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE)
            for match in matches:
                if len(match) == 2:
                    tier, rate = match if match[0].isalpha() else (match[1], match[0])
                    result["rates"].append({"tier": tier.upper(), "rate": float(rate)})
        
        adjustment_patterns = [
            r'([\+\-]\s*\d+\.\d+%)\s*(?:for\s*)?(.*?)(?:\n|$)',
        ]
        
        for pattern in adjustment_patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE)
            for match in matches:
                adjustment, reason = match
                result["rate_adjustments"].append({
                    "adjustment": adjustment.strip(),
                    "reason": reason.strip()
                })
        
        return result
    
    def extract_term_limits(self) -> Dict[str, Optional[int]]:
        result = {"min_months": None, "max_months": None}
        
        patterns = [
            r'(\d+)[-–](\d+)\s*months?',
            r'(\d+)\s*months?\s*(?:maximum|max)',
            r'(?:maximum|max)\s*(?:loan\s*)?term.*?(\d+)\s*months?',
            r'term[:\s]*(\d+)\s*months?',
        ]
        
        terms_found = []
        for pattern in patterns:
            matches = re.findall(pattern, self.text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    terms_found.extend([int(m) for m in match if m])
                else:
                    terms_found.append(int(match))
        
        if terms_found:
            terms_found = [t for t in terms_found if 6 <= t <= 120]
            if terms_found:
                result["min_months"] = min(terms_found)
                result["max_months"] = max(terms_found)
        
        return result
    
    def extract_equipment_age(self) -> Optional[int]:
        patterns = [
            r'equipment\s*over\s*(\d+)\s*years?\s*old',
            r'(\d+)\s*years?\s*(?:and\s*)?(?:newer|old|maximum\s*age)',
            r'(?:max|maximum)\s*(?:collateral\s*)?age.*?(\d+)\s*years?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                age = int(match.group(1))
                if age <= 30:
                    return age
        
        return None
    
    def extract_revenue_requirements(self) -> Optional[float]:
        patterns = [
            r'annual\s*sales?\s*(?:must\s*be\s*)?(?:at\s*least\s*)?\$(\d+(?:,\d{3})*(?:M|MM|K)?)',
            r'minimum\s*(?:annual\s*)?revenue[:\s]*\$(\d+(?:,\d{3})*(?:M|MM|K)?)',
        ]
        
        def parse_amount(val: str) -> float:
            val = val.replace(",", "")
            if val.upper().endswith("MM"):
                return float(val[:-2]) * 1000000
            if val.upper().endswith("M"):
                return float(val[:-1]) * 1000000
            if val.upper().endswith("K"):
                return float(val[:-1]) * 1000
            return float(val)
        
        for pattern in patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                try:
                    return parse_amount(match.group(1))
                except:
                    pass
        
        return None
    
    def extract_programs(self) -> List[Dict[str, Any]]:
        programs = []
        
        fico_data = self.extract_fico_scores()
        paynet_data = self.extract_paynet_scores()
        tib_data = self.extract_years_in_business()
        
        if fico_data["tiers"] or paynet_data["tiers"]:
            all_tiers = set(fico_data["tiers"].keys()) | set(paynet_data["tiers"].keys()) | set(tib_data.get("tiers", {}).keys())
            
            for tier_name in all_tiers:
                program = {
                    "name": tier_name,
                    "fico_min": fico_data["tiers"].get(tier_name),
                    "paynet_min": paynet_data["tiers"].get(tier_name),
                    "min_years_in_business": tib_data.get("tiers", {}).get(tier_name),
                }
                programs.append(program)
        
        if not programs or fico_data["min"] or paynet_data["min"]:
            programs.insert(0, {
                "name": "Standard Program",
                "fico_min": fico_data["min"],
                "paynet_min": paynet_data["min"],
                "min_years_in_business": tib_data["min"],
            })
        
        return programs
    
    def extract_policy_data(self) -> Dict[str, Any]:
        fico_data = self.extract_fico_scores()
        paynet_data = self.extract_paynet_scores()
        loan_amounts = self.extract_loan_amounts()
        tib_data = self.extract_years_in_business()
        equipment_data = self.extract_equipment_types()
        term_limits = self.extract_term_limits()
        rates = self.extract_rates()
        
        return {
            "lender_name": self.extract_lender_name(),
            "programs": self.extract_programs(),
            "fico_min": fico_data["min"],
            "fico_tiers": fico_data["tiers"],
            "paynet_min": paynet_data["min"],
            "paynet_tiers": paynet_data["tiers"],
            "min_amount": loan_amounts["min"],
            "max_amount": loan_amounts["max"],
            "min_years_in_business": tib_data["min"],
            "tib_tiers": tib_data.get("tiers", {}),
            "excluded_industries": self.extract_excluded_industries(),
            "allowed_equipment_types": equipment_data["allowed"],
            "excluded_equipment_types": equipment_data["excluded"],
            "excluded_states": self.extract_excluded_states(),
            "min_term_months": term_limits["min_months"],
            "max_term_months": term_limits["max_months"],
            "max_equipment_age_years": self.extract_equipment_age(),
            "min_annual_revenue": self.extract_revenue_requirements(),
            "rates": rates["rates"],
            "rate_adjustments": rates["rate_adjustments"],
        }


def parse_pdf(pdf_path: str) -> Dict[str, Any]:
    parser = PDFParser(pdf_path)
    return parser.extract_policy_data()


def parse_all_pdfs(directory: str) -> List[Dict[str, Any]]:
    results = []
    path = Path(directory)
    for pdf_file in path.glob("*.pdf"):
        try:
            data = parse_pdf(str(pdf_file))
            results.append(data)
        except Exception as e:
            results.append({"file": str(pdf_file), "error": str(e)})
    return results
