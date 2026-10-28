// Exact dropdown options and division hierarchy imported from Android BiodataOptions.kt

export const RELIGIONS = [
  'Muslim',
  'Hinduism',
  'Christianity',
  'Buddhism',
  'Other'
] as const;

export const CREATED_BY = [
  'Self',
  'Parent',
  'Sibling',
  'Guardian',
  'Other'
] as const;

export const MARITAL_STATUSES = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Separated'
] as const;

// 48 inches (4'0'') to 77 inches (6'5'')
export const HEIGHTS = Array.from({ length: 77 - 48 + 1 }, (_, i) => {
  const inches = 48 + i;
  const ft = Math.floor(inches / 12);
  const remainderInches = inches % 12;
  return `${ft}'${remainderInches}''`;
});

export const COMPLEXIONS = [
  'Very Fair',
  'Fair',
  'Light Brown / Bright Shamla',
  'Brown / Shamla',
  'Deep Brown / Sham Borno'
] as const;

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
] as const;

export const EYE_COLOURS = [
  'Black',
  'Dark Brown',
  'Brown',
  'Hazel',
  'Green',
  'Blue',
  'Other'
] as const;

export const HAIR_COLOURS = [
  'Black',
  'Dark Brown',
  'Brown',
  'Gray',
  'Other'
] as const;

export const DISABILITIES = [
  'None',
  'Intellectual',
  'Physical Disability',
  'Visual Impairment',
  'Hearing Impairment',
  'Speech Impairment',
  'Other'
] as const;

export const EDUCATION_LEVELS = [
  'Primary',
  'Junior School',
  'SSC/Dakhil',
  'HSC/Alim',
  'Bachelor’s',
  'Master’s',
  'MBBS',
  'MPhil',
  'PhD',
  'Diploma',
  'Qawmi Madrasa',
  'Other',
  'Uneducated'
] as const;

export const IELTS_SCORES = [
  'None / N/A',
  '5.0',
  '5.5',
  '6.0',
  '6.5',
  '7.0',
  '7.5',
  '8.0',
  '8.5',
  '9.0'
] as const;

export const EMPLOYMENT_TYPES = [
  'Govt job',
  'Private job',
  'Overseas Employed',
  'Self Employed',
  'Unemployed'
] as const;

export const PROFESSIONS = [
  'Accountant', 'Actor', 'Adviser', 'App Developer', 'Architect', 'Army', 'Artisan',
  'Craftsperson', 'Artist', 'Autonomous', 'Bachelor', 'Baker', 'Banker', 'Barber',
  'Barrister', 'Beautician / Makeup Artist', 'Blacksmith', 'Blogger', 'Boatman, Launch Operator',
  'Brick Kiln Worker', 'Businessperson', 'Butcher', 'Call Center Agent', 'Carpenter',
  'Chef / Cook', 'Cleaner', 'CNG / Auto-rickshaw Driver', 'Cobbler / Shoe Repairer',
  'Construction Worker / Mason', 'Caregiver', 'Contractor', 'Cricketer', 'Dancer',
  'Data Scientist', 'Day Laborer', 'Deceased', 'Dentist', 'Staff in Foreign Mission',
  'Dependent on Diplomat', 'Digital Marketer', 'Doctor', 'Domestic Worker / House Maid',
  'Driver', 'Electrician', 'Engineer', 'Essayist', 'Farmer', 'Firefighter', 'Fisherman',
  'Flight Attendant', 'Footballer', 'Freelancer', 'Garment / RMG Worker, Sewing Machine Operator',
  'Factory Worker', 'Government Employee', 'Graphic Designer', 'Security Guard', 'Hawker, Street Vendor',
  'House Wife', 'Imam, Moulana, Religious Teacher', 'Religious Worker', 'Instrumentalist',
  'Insurance Agent', 'IT Support Assistant', 'Journalist', 'Judge / Justice', 'Jute Worker',
  'Labor', 'Lawyer', 'Librarian', 'Madrasah Teacher', 'Mechanic', 'Medical Assistant, Paramedic',
  'Medical Technologist', 'Member of Local Government', 'Merchant Marine Officer', 'Midwife',
  'Mobile Phone Servicing Technician', 'Movie Director', 'Network Engineer', 'NGO Worker',
  'Novelist', 'Nurse', 'Others', 'Painter', 'Pharmacist', 'Photographer', 'Physiotherapist',
  'Pilot', 'Playwright', 'Plumber / Pipe Fitter', 'Poet', 'Police, Ansar, BGB', 'Politician',
  'Porter', 'Postman', 'Potter', 'Private-Sector Employee', 'Private Service', 'Project Employee',
  'Public Speaker', 'Real Estate Agent', 'Researcher', 'Restaurant Worker, Waiter, Hotel Staff',
  'Retired (Government Service)', 'Retired (Private Service)', 'Runner', 'Salesman',
  'School Administrator', 'Scientist', 'Sculptor', 'Ship-breaking Worker', 'Shopkeeper',
  'Singer', 'Software Engineer', 'Steel Fixer / Rod Binder', 'Student', 'Sweeper', 'Swimmer',
  'Tailor', 'Teacher', 'Tea Garden Worker', 'Textile Worker / Weaver', 'Tour Guide',
  'Translator', 'Unemployed', 'Unknown', 'UX/UI Designer', 'Veterinarian', 'Video Editor',
  'Washerman', 'Web Developer', 'Welder', 'YouTuber'
] as const;

export const JOB_EMPLOYMENT_STATUSES = [
  'Permanent',
  'Contractual',
  'Part-time',
  'Owner',
  'Shareholder'
] as const;

export const MONTHLY_INCOMES = [
  'Prefer not to say',
  'Under ৳20,000',
  '৳20,000 - ৳30,000',
  '৳30,000 - ৳50,000',
  '৳50,000 - ৳1,00,000',
  '৳1,00,000 - ৳2,00,000',
  '৳2,00,000 - ৳5,00,000',
  '৳5,00,000+',
  'No Income'
] as const;

export const OVERSEAS_COUNTRIES = [
  'United Kingdom (UK)',
  'US (America)',
  'Canada',
  'Australia',
  'New Zealand',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Portugal',
  'Ireland',
  'Europe',
  'Saudi Arabia',
  'UAE (Dubai)',
  'Qatar',
  'Kuwait',
  'Oman',
  'Bahrain',
  'Malaysia',
  'Singapore',
  'Japan',
  'South Korea',
  'Other Country'
] as const;

export const VISA_STATUSES = [
  'Citizen',
  'Permanent Resident (PR)',
  'Work Permit / Visa',
  'Student Visa',
  'Dependent Visa',
  'Other'
] as const;

export const FAMILY_TYPES = [
  'Joint',
  'Nuclear',
  'Other'
] as const;

export const PARENTS_STATUSES = [
  'Both Alive',
  'Only Father Alive',
  'Only Mother Alive',
  'Neither Alive'
] as const;

export const FINANCIAL_CONDITIONS = [
  'Upper Class',
  'Upper Middle Class',
  'Middle Class',
  'Lower Middle Class',
  'Lower Class'
] as const;

export const MARRIAGE_TIMELINES = [
  'Immediately',
  'Within 1-3 months',
  'Within 6 months',
  'Within 1 year',
  'Within 2 years',
  'Flexible / Not Fixed'
] as const;

export interface DistrictData {
  name: string;
  upazilas: string[];
}

export interface DivisionData {
  name: string;
  districts: DistrictData[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: 'Dhaka',
    districts: [
      { name: 'Dhaka', upazilas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Savar', 'Keraniganj', 'Dhamrai'] },
      { name: 'Gazipur', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'] },
      { name: 'Narayanganj', upazilas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'] },
      { name: 'Tangail', upazilas: ['Tangail Sadar', 'Mirzapur', 'Madhupur', 'Ghatail', 'Kalihati', 'Sakhipur'] },
      { name: 'Faridpur', upazilas: ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Nagarkanda', 'Madhukhali'] },
      { name: 'Manikganj', upazilas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Shivalaya', 'Harirampur'] },
      { name: 'Munshiganj', upazilas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Tongibari', 'Lohajang'] },
      { name: 'Narsingdi', upazilas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Raipura', 'Belabo'] },
      { name: 'Gopalganj', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
      { name: 'Kishoreganj', upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Katiadi', 'Pakundia'] },
      { name: 'Madaripur', upazilas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir'] },
      { name: 'Rajbari', upazilas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi'] },
      { name: 'Shariatpur', upazilas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Bhedarganj', 'Damudya'] }
    ]
  },
  {
    name: 'Chattogram',
    districts: [
      { name: 'Chattogram', upazilas: ['Panchlaish', 'Kotwali', 'Double Mooring', 'Halishahar', 'Hathazari', 'Raozan', 'Fatikchhari', 'Patiya', 'Sitakunda', 'Mirsharai', 'Anwara', 'Boalkhali'] },
      { name: "Cox's Bazar", upazilas: ["Cox's Bazar Sadar", 'Ramu', 'Chakaria', 'Teknaf', 'Ukhia', 'Maheshkhali', 'Pekua'] },
      { name: 'Cumilla', upazilas: ['Cumilla Adarsha Sadar', 'Laksam', 'Debidwar', 'Burichang', 'Chandina', 'Muradnagar', 'Daudkandi', 'Chauddagram'] },
      { name: 'Noakhali', upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Senbagh', 'Companyganj', 'Hatiya'] },
      { name: 'Feni', upazilas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Parshuram', 'Fulgazi', 'Sonagazi'] },
      { name: 'Brahmanbaria', upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Sarail', 'Kasba', 'Nabinagar', 'Bancharampur', 'Akhaura'] },
      { name: 'Chandpur', upazilas: ['Chandpur Sadar', 'Hajiganj', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti', 'Faridganj'] },
      { name: 'Lakshmipur', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
      { name: 'Bandarban', upazilas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Lama', 'Ali Kadam'] },
      { name: 'Rangamati', upazilas: ['Rangamati Sadar', 'Kaptai', 'Baghaichhari', 'Barkal', 'Langadu'] },
      { name: 'Khagrachhari', upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga'] }
    ]
  },
  {
    name: 'Sylhet',
    districts: [
      { name: 'Sylhet', upazilas: ['Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Zakiganj', 'Kanaighat', 'Fenchuganj', 'Balaganj', 'Bishwanath', 'Companiganj'] },
      { name: 'Moulvibazar', upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Kamalganj', 'Barlekha', 'Rajnagar', 'Juri'] },
      { name: 'Habiganj', upazilas: ['Habiganj Sadar', 'Madhabpur', 'Chunarughat', 'Nabiganj', 'Bahubal', 'Baniachong'] },
      { name: 'Sunamganj', upazilas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Tahirpur', 'Dowarabazar'] }
    ]
  },
  {
    name: 'Rajshahi',
    districts: [
      { name: 'Rajshahi', upazilas: ['Boalia', 'Rajpara', 'Motihar', 'Paba', 'Godagari', 'Tanore', 'Bagmara', 'Durgapur', 'Charghat', 'Puthia'] },
      { name: 'Bogura', upazilas: ['Bogura Sadar', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Gabtali', 'Dhunat', 'Sariakandi'] },
      { name: 'Pabna', upazilas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Chatmohar', 'Bera', 'Sujanagar'] },
      { name: 'Sirajganj', upazilas: ['Sirajganj Sadar', 'Shahjadpur', 'Ullapara', 'Belkuchi', 'Kamarkhanda'] },
      { name: 'Naogaon', upazilas: ['Naogaon Sadar', 'Patnitala', 'Dhamoirhat', 'Manda', 'Mohadevpur'] },
      { name: 'Natore', upazilas: ['Natore Sadar', 'Baraigram', 'Singra', 'Bagatipara', 'Lalpur'] },
      { name: 'Chapai Nawabganj', upazilas: ['Chapai Nawabganj Sadar', 'Shibganj', 'Gomastapur', 'Nachole', 'Bholahat'] },
      { name: 'Joypurhat', upazilas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur'] }
    ]
  },
  {
    name: 'Khulna',
    districts: [
      { name: 'Khulna', upazilas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Dighalia', 'Dumuria', 'Rupsha', 'Paikgachha'] },
      { name: 'Jashore', upazilas: ['Jashore Sadar', 'Jhikargachha', 'Manirampur', 'Keshabpur', 'Bagherpara', 'Abhaynagar'] },
      { name: 'Kushtia', upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Mirpur', 'Bheramara', 'Daulatpur'] },
      { name: 'Bagerhat', upazilas: ['Bagerhat Sadar', 'Mongla', 'Fakirhat', 'Rampal', 'Morrelganj'] },
      { name: 'Satkhira', upazilas: ['Satkhira Sadar', 'Tala', 'Kaliganj', 'Shyamnagar', 'Kalaroa'] },
      { name: 'Chuadanga', upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
      { name: 'Jhenaidah', upazilas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Shailkupa', 'Maheshpur'] },
      { name: 'Magura', upazilas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'] },
      { name: 'Meherpur', upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
      { name: 'Narail', upazilas: ['Narail Sadar', 'Lohagara', 'Kalia'] }
    ]
  },
  {
    name: 'Barishal',
    districts: [
      { name: 'Barishal', upazilas: ['Barishal Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Muladi', 'Mehendiganj'] },
      { name: 'Bhola', upazilas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Lalmohan', 'Daulatkhan', 'Tazumuddin'] },
      { name: 'Patuakhali', upazilas: ['Patuakhali Sadar', 'Galachipa', 'Bauphal', 'Kalapara', 'Mirzaganj'] },
      { name: 'Pirojpur', upazilas: ['Pirojpur Sadar', 'Mathbaria', 'Bhandaria', 'Nazirpur', 'Nesarabad'] },
      { name: 'Barguna', upazilas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi', 'Bamna'] },
      { name: 'Jhalokati', upazilas: ['Jhalokati Sadar', 'Nalchity', 'Rajapur', 'Kathalia'] }
    ]
  },
  {
    name: 'Rangpur',
    districts: [
      { name: 'Rangpur', upazilas: ['Rangpur Sadar', 'Pirgachha', 'Badarganj', 'Mithapukur', 'Pirganj', 'Kaunia', 'Gangachhara'] },
      { name: 'Dinajpur', upazilas: ['Dinajpur Sadar', 'Birganj', 'Parbatipur', 'Fulbari', 'Birol', 'Biral'] },
      { name: 'Gaibandha', upazilas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sundarganj', 'Sadullapur'] },
      { name: 'Kurigram', upazilas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Ulipur', 'Chilmari'] },
      { name: 'Nilphamari', upazilas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Jaldhaka', 'Kishoreganj'] },
      { name: 'Lalmonirhat', upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Kaliganj', 'Hatibandha', 'Patgram'] },
      { name: 'Thakurgaon', upazilas: ['Thakurgaon Sadar', 'Pirganj', 'Ranisankail', 'Haripur', 'Baliadangi'] },
      { name: 'Panchagarh', upazilas: ['Panchagarh Sadar', 'Boda', 'Debiganj', 'Tetulia', 'Atwari'] }
    ]
  },
  {
    name: 'Mymensingh',
    districts: [
      { name: 'Mymensingh', upazilas: ['Mymensingh Sadar', 'Muktagachha', 'Fulbaria', 'Trishal', 'Bhaluka', 'Gafargaon', 'Ishwarganj', 'Nandail', 'Haluaghat'] },
      { name: 'Jamalpur', upazilas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Dewanganj', 'Islampur', 'Madarganj'] },
      { name: 'Netrokona', upazilas: ['Netrokona Sadar', 'Kendua', 'Mohanganj', 'Durgapur', 'Purbadhala', 'Kalmakanda'] },
      { name: 'Sherpur', upazilas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi'] }
    ]
  }
];

// Helper methods for cascading division -> district -> upazila
export function getDistrictsForDivision(divisionName?: string): string[] {
  if (!divisionName) return [];
  const division = BANGLADESH_DIVISIONS.find(
    d => d.name.toLowerCase() === divisionName.trim().toLowerCase()
  );
  return division ? division.districts.map(d => d.name) : [];
}

export function getUpazilasForDistrict(districtName?: string, divisionName?: string): string[] {
  if (!districtName) return [];
  const cleanDistrict = districtName.trim().toLowerCase();

  if (divisionName) {
    const division = BANGLADESH_DIVISIONS.find(
      d => d.name.toLowerCase() === divisionName.trim().toLowerCase()
    );
    if (division) {
      const dist = division.districts.find(d => d.name.toLowerCase() === cleanDistrict);
      if (dist) return dist.upazilas;
    }
  }

  for (const division of BANGLADESH_DIVISIONS) {
    const dist = division.districts.find(d => d.name.toLowerCase() === cleanDistrict);
    if (dist) return dist.upazilas;
  }
  return [];
}

export function getAllDistricts(): string[] {
  const districts: string[] = [];
  for (const div of BANGLADESH_DIVISIONS) {
    for (const dist of div.districts) {
      districts.push(dist.name);
    }
  }
  return districts.sort();
}
