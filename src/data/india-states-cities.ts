export interface IndianCityCoord {
  lat: number;
  lng: number;
}

export const INDIAN_STATES: readonly string[] = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const INDIAN_STATE_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada',
    'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Eluru',
    'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur',
    'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Srikakulam'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Namsai', 'Roing', 'Ziro', 'Tawang',
    'Bomdila', 'Tezu', 'Aalo', 'Changlang'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur',
    'Bongaigaon', 'Diphu', 'Dhubri', 'North Lakhimpur', 'Sivasagar', 'Goalpara', 'Karimganj'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif',
    'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Bettiah',
    'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Buxar'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Raigarh',
    'Ambikapur', 'Durg', 'Dhamtari', 'Mahasamund', 'Kanker', 'Kawardha', 'Champa'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim',
    'Curchorem', 'Cuncolim', 'Valpoi', 'Pernem', 'Sanquelim', 'Canacona'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
    'Gandhinagar', 'Anand', 'Navsari', 'Surendranagar', 'Morbi', 'Bharuch', 'Mehsana',
    'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Godhra', 'Patan'
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar',
    'Karnal', 'Sonipat', 'Panchkula', 'Sirsa', 'Bhiwani', 'Bahadurgarh', 'Jind',
    'Thanesar', 'Kaithal', 'Rewari', 'Palwal'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Baddi', 'Nahan', 'Paonta Sahib',
    'Sundarnagar', 'Chamba', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Manali'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro',
    'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda', 'Chaibasa', 'Dumka'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi',
    'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar',
    'Hosapete', 'Hassan', 'Gadag', 'Udupi', 'Chitradurga', 'Kolar', 'Mandya'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur',
    'Alappuzha', 'Palakkad', 'Malappuram', 'Kottayam', 'Kasaragod', 'Thalassery',
    'Ponnani', 'Vatakara', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Neyyattinkara'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind',
    'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik', 'Kalyan-Dombivli',
    'Vasai-Virar', 'Chhatrapati Sambhaji Nagar', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar',
    'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Ulhasnagar', 'Sangli',
    'Malegaon', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani'
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Kakching', 'Ukhrul', 'Churachandpur', 'Bishnupur', 'Senapati'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar', 'Baghmara', 'Resubelpara'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Saiha'
  ],
  'Nagaland': [
    'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore',
    'Bhadrak', 'Baripada', 'Jharsuguda', 'Bargarh', 'Jeypore', 'Rayagada', 'Angul'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur',
    'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar',
    'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Beawar', 'Hanumangarh', 'Tonk',
    'Kishangarh', 'Jhunjhunu', 'Baran', 'Chittorgarh', 'Dholpur', 'Sawai Madhopur'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet',
    'Sivakasi', 'Karur', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Cuddalore', 'Kumbakonam'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam',
    'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet'
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai', 'Teliamura'
  ],
  'Uttar Pradesh': [
    'Mau', 'Lucknow', 'Varanasi', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Prayagraj',
    'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Greater Noida',
    'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Ayodhya', 'Budaun', 'Rampur',
    'Shahjahanpur', 'Farrukhabad', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal',
    'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar',
    'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Azamgarh',
    'Ballia', 'Ghazipur', 'Deoria', 'Basti', 'Sultanpur', 'Gonda'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
    'Nainital', 'Mussoorie', 'Pithoragarh', 'Almora', 'Kotdwar', 'Ramnagar'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda',
    'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Haldia', 'Raiganj',
    'Krishnanagar', 'Nabadwip', 'Midnapore', 'Jalpaiguri', 'Balurghat', 'Darjeeling'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Diglipur', 'Mayabunder', 'Rangat', 'Car Nicobar'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa'
  ],
  'Delhi': [
    'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara',
    'Dwarka', 'Rohini', 'Saket', 'Connaught Place', 'Vasant Kunj', 'Janakpuri'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Sopore', 'Udhampur',
    'Rajouri', 'Poonch', 'Kupwara', 'Pulwama', 'Samba'
  ],
  'Ladakh': [
    'Leh', 'Kargil'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Andrott', 'Minicoy', 'Amini'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
  ],
};

// Instant fallback coordinates for prominent cities
export const KNOWN_CITY_COORDINATES: Record<string, IndianCityCoord> = {
  'mau,uttar pradesh': { lat: 25.9419, lng: 83.5607 },
  'lucknow,uttar pradesh': { lat: 26.8467, lng: 80.9462 },
  'varanasi,uttar pradesh': { lat: 25.3176, lng: 82.9739 },
  'kanpur,uttar pradesh': { lat: 26.4499, lng: 80.3319 },
  'noida,uttar pradesh': { lat: 28.5355, lng: 77.3910 },
  'greater noida,uttar pradesh': { lat: 28.4744, lng: 77.5040 },
  'ghaziabad,uttar pradesh': { lat: 28.6692, lng: 77.4538 },
  'agra,uttar pradesh': { lat: 27.1767, lng: 78.0081 },
  'prayagraj,uttar pradesh': { lat: 25.4358, lng: 81.8463 },
  'gorakhpur,uttar pradesh': { lat: 26.7606, lng: 83.3732 },
  'ayodhya,uttar pradesh': { lat: 26.7922, lng: 82.1998 },
  'bareilly,uttar pradesh': { lat: 28.3670, lng: 79.4304 },
  'meerut,uttar pradesh': { lat: 28.9845, lng: 77.7064 },
  'jhansi,uttar pradesh': { lat: 25.4484, lng: 78.5685 },
  'aligarh,uttar pradesh': { lat: 27.8974, lng: 78.0880 },
  'new delhi,delhi': { lat: 28.6139, lng: 77.2090 },
  'delhi,delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai,maharashtra': { lat: 19.0760, lng: 72.8777 },
  'pune,maharashtra': { lat: 18.5204, lng: 73.8567 },
  'nagpur,maharashtra': { lat: 21.1458, lng: 79.0882 },
  'thane,maharashtra': { lat: 19.2183, lng: 72.9781 },
  'navi mumbai,maharashtra': { lat: 19.0330, lng: 73.0297 },
  'bengaluru,karnataka': { lat: 12.9716, lng: 77.5946 },
  'mysuru,karnataka': { lat: 12.2958, lng: 76.6394 },
  'kolkata,west bengal': { lat: 22.5726, lng: 88.3639 },
  'howrah,west bengal': { lat: 22.5958, lng: 88.2636 },
  'chennai,tamil nadu': { lat: 13.0827, lng: 80.2707 },
  'coimbatore,tamil nadu': { lat: 11.0168, lng: 76.9558 },
  'hyderabad,telangana': { lat: 17.3850, lng: 78.4867 },
  'warangal,telangana': { lat: 17.9689, lng: 79.5941 },
  'ahmedabad,gujarat': { lat: 23.0225, lng: 72.5714 },
  'surat,gujarat': { lat: 21.1702, lng: 72.8311 },
  'vadodara,gujarat': { lat: 22.3072, lng: 73.1812 },
  'jaipur,rajasthan': { lat: 26.9124, lng: 75.7873 },
  'jodhpur,rajasthan': { lat: 26.2389, lng: 73.0243 },
  'patna,bihar': { lat: 25.5941, lng: 85.1376 },
  'gaya,bihar': { lat: 24.7914, lng: 85.0002 },
  'bhopal,madhya pradesh': { lat: 23.2599, lng: 77.4126 },
  'indore,madhya pradesh': { lat: 22.7196, lng: 75.8577 },
  'chandigarh,chandigarh': { lat: 30.7333, lng: 76.7794 },
  'panaji,goa': { lat: 15.4909, lng: 73.8278 },
  'ponda,goa': { lat: 15.4026, lng: 74.0152 },
  'margao,goa': { lat: 15.2832, lng: 73.9862 },
  'shimla,himachal pradesh': { lat: 31.1048, lng: 77.1734 },
  'dehradun,uttarakhand': { lat: 30.3165, lng: 78.0322 },
  'haridwar,uttarakhand': { lat: 29.9457, lng: 78.1642 },
  'ranchi,jharkhand': { lat: 23.3441, lng: 85.3096 },
  'thiruvananthapuram,kerala': { lat: 8.5241, lng: 76.9366 },
  'kochi,kerala': { lat: 9.9312, lng: 76.2673 },
  'bhubaneswar,odisha': { lat: 20.2961, lng: 85.8245 },
  'ludhiana,punjab': { lat: 30.9010, lng: 75.8573 },
  'amritsar,punjab': { lat: 31.6340, lng: 74.8723 },
  'gurugram,haryana': { lat: 28.4595, lng: 77.0266 },
  'faridabad,haryana': { lat: 28.4089, lng: 77.3178 },
  'guwahati,assam': { lat: 26.1445, lng: 91.7362 },
  'raipur,chhattisgarh': { lat: 21.2514, lng: 81.6296 },
  'srinagar,jammu and kashmir': { lat: 34.0837, lng: 74.7973 },
  'jammu,jammu and kashmir': { lat: 32.7266, lng: 74.8570 },
};

/**
 * Normalizes user state input against the official 36 Indian States and UTs.
 * Returns the official name if valid, or null if not a recognized Indian state.
 */
export function normalizeIndianState(input: string): string | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
  for (const state of INDIAN_STATES) {
    const canonical = state.toLowerCase().replace(/&/g, 'and');
    if (canonical === clean) return state;
  }
  // Common aliases
  if (clean === 'nct of delhi' || clean === 'new delhi' || clean === 'delhi ncr') return 'Delhi';
  if (clean === 'j&k' || clean === 'jammu & kashmir') return 'Jammu and Kashmir';
  if (clean === 'dnh and dd' || clean === 'daman and diu') return 'Dadra and Nagar Haveli and Daman and Diu';
  if (clean === 'up') return 'Uttar Pradesh';
  if (clean === 'mp') return 'Madhya Pradesh';
  if (clean === 'ap') return 'Andhra Pradesh';
  if (clean === 'wb') return 'West Bengal';
  if (clean === 'tn') return 'Tamil Nadu';
  if (clean === 'mh') return 'Maharashtra';
  if (clean === 'uk' || clean === 'uttaranchal') return 'Uttarakhand';
  if (clean === 'orissa') return 'Odisha';
  if (clean === 'pondicherry') return 'Puducherry';

  return null;
}

/**
 * Check if the provided name is a valid Indian State / UT.
 */
export function isIndianState(input: string): boolean {
  return normalizeIndianState(input) !== null;
}

/**
 * Get list of known cities for a state.
 */
export function getCitiesForState(stateName: string): string[] {
  const normalized = normalizeIndianState(stateName);
  if (!normalized) return [];
  return INDIAN_STATE_CITIES[normalized] || [];
}

/**
 * Get pre-mapped coordinates for an Indian city if available.
 */
export function getKnownCoordinates(cityName: string, stateName: string): IndianCityCoord | null {
  const cityKey = `${cityName.trim().toLowerCase()},${stateName.trim().toLowerCase()}`;
  return KNOWN_CITY_COORDINATES[cityKey] || null;
}

