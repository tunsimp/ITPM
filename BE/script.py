#!/usr/bin/env python3
"""
Lightweight Python script to login and retrieve grades from EduSoft
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import Dict, List, Optional


class EdusoftScraper:
    def __init__(self):
        self.base_url = "https://edusoftweb.hcmiu.edu.vn"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def get_viewstate(self, html: str) -> Dict[str, str]:
        """Extract VIEWSTATE and other form fields from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        
        viewstate = soup.find('input', {'name': '__VIEWSTATE'})
        viewstate_generator = soup.find('input', {'name': '__VIEWSTATEGENERATOR'})
        event_target = soup.find('input', {'name': '__EVENTTARGET'})
        event_argument = soup.find('input', {'name': '__EVENTARGUMENT'})
        
        return {
            '__VIEWSTATE': viewstate['value'] if viewstate else '',
            '__VIEWSTATEGENERATOR': viewstate_generator['value'] if viewstate_generator else '',
            '__EVENTTARGET': event_target['value'] if event_target else '',
            '__EVENTARGUMENT': event_argument['value'] if event_argument else ''
        }
    
    def login(self, username: str, password: str) -> bool:
        """Login to EduSoft portal"""
        try:
            # Step 1: Get the login page to retrieve VIEWSTATE
            print("🔄 Fetching login page...")
            response = self.session.get(f"{self.base_url}/default.aspx")
            response.raise_for_status()
            
            # Extract VIEWSTATE
            form_data = self.get_viewstate(response.text)
            
            # Step 2: Prepare login form data
            form_data.update({
                'ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$txtTaiKhoa': username,
                'ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$txtMatKhau': password,
                'ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$btnDangNhap': 'Đăng Nhập'
            })
            
            # Step 3: Submit login form
            print("🔐 Logging in...")
            login_response = self.session.post(
                f"{self.base_url}/default.aspx",
                data=form_data,
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': self.base_url,
                    'Referer': f"{self.base_url}/default.aspx"
                }
            )
            
            login_response.raise_for_status()
            
            # Check if login was successful
            if 'Chào bạn' in login_response.text or username.upper() in login_response.text:
                print("✅ Login successful!")
                return True
            else:
                print("❌ Login failed!")
                return False
                
        except Exception as e:
            print(f"❌ Error during login: {e}")
            return False
    
    def get_grades(self) -> Dict:
        """Retrieve grades page"""
        try:
            print("📊 Fetching grades page...")
            response = self.session.get(f"{self.base_url}/default.aspx?page=xemdiemthi")
            response.raise_for_status()
            
            return self.parse_grades(response.text)
            
        except Exception as e:
            print(f"❌ Error fetching grades: {e}")
            return {}
    
    def parse_grades(self, html: str) -> Dict:
        """Parse student info and grades from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        
        result = {
            'student_info': {},
            'grades': [],
            'last_updated': ''
        }
        
        # Extract student info
        info_fields = {
            'ma_sinh_vien': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblMaSinhVien',
            'ten_sinh_vien': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblTenSinhVien',
            'lop': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblLop',
            'nganh': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lbNganh',
            'khoa': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblKhoa',
            'phai': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblPhai',
            'noi_sinh': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblNoiSinh',
            'he_dao_tao': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblHeDaoTao',
            'khoa_hoc': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblKhoaHoc',
            'co_van_hoc_tap': 'ContentPlaceHolder1_ctl00_ucThongTinSV_lblCVHT'
        }
        
        for key, element_id in info_fields.items():
            element = soup.find('span', {'id': element_id})
            if element:
                result['student_info'][key] = element.text.strip()
        
        # Extract grades table
        grade_container = soup.find('div', {'id': 'ContentPlaceHolder1_ctl00_div1'})
        if grade_container:
            table = grade_container.find('table')
            if table:
                rows = table.find_all('tr')
                
                # Get headers
                headers = []
                if rows:
                    header_row = rows[0]
                    headers = [th.text.strip() for th in header_row.find_all(['th', 'td'])]
                
                # Get grade rows
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if cells:
                        grade = {}
                        for i, cell in enumerate(cells):
                            header = headers[i] if i < len(headers) else f'column_{i}'
                            grade[header] = cell.text.strip()
                        
                        if grade:
                            result['grades'].append(grade)
        
        # Extract last updated time
        last_updated_elem = soup.find('span', {'id': 'ContentPlaceHolder1_ctl00_lblNgayCapNhatDiem'})
        if last_updated_elem:
            result['last_updated'] = last_updated_elem.text.strip()
        
        return result
    
    def save_to_file(self, data: Dict, filename: str = 'grades.json'):
        """Save data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 Data saved to {filename}")
    
    def save_html(self, html: str, filename: str = 'grades.html'):
        """Save raw HTML to file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"💾 HTML saved to {filename}")


def main():
    """Main function"""
    print("=" * 60)
    print("EduSoft Grade Scraper")
    print("=" * 60)
    
    # Get credentials
    username = input("Enter username (e.g., ITITIU22177): ").strip()
    password = input("Enter password: ").strip()
    
    # Create scraper instance
    scraper = EdusoftScraper()
    
    # Login
    if not scraper.login(username, password):
        print("❌ Login failed. Please check your credentials.")
        return
    
    # Get grades
    grades_data = scraper.get_grades()
    
    if grades_data:
        # Display student info
        print("\n" + "=" * 60)
        print("📋 Student Information")
        print("=" * 60)
        for key, value in grades_data.get('student_info', {}).items():
            print(f"{key.replace('_', ' ').title()}: {value}")
        
        # Display grades
        print("\n" + "=" * 60)
        print("📊 Grades")
        print("=" * 60)
        
        if grades_data.get('grades'):
            for i, grade in enumerate(grades_data['grades'], 1):
                print(f"\n📚 Course {i}:")
                for key, value in grade.items():
                    print(f"  {key}: {value}")
        else:
            print("No grades found in the table.")
        
        # Display last updated
        if grades_data.get('last_updated'):
            print(f"\n⏰ {grades_data['last_updated']}")
        
        # Save to file
        scraper.save_to_file(grades_data)
        
        # Also save raw HTML
        response = scraper.session.get(f"{scraper.base_url}/default.aspx?page=xemdiemthi")
        scraper.save_html(response.text)
        
    else:
        print("❌ Failed to retrieve grades.")
    
    print("\n" + "=" * 60)
    print("✅ Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()


"""
USAGE:
------
1. Install required packages:
   pip install requests beautifulsoup4

2. Run the script:
   python edusoft_scraper.py

3. Enter your credentials when prompted

4. The script will:
   - Login to EduSoft
   - Retrieve your grades
   - Display the information
   - Save to grades.json and grades.html

NOTE:
-----
- The script handles ASP.NET ViewState automatically
- Sessions are maintained using requests.Session()
- All form data is properly encoded
- The script saves both JSON and raw HTML for reference
"""
