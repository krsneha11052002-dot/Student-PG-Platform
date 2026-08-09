import React, { createContext, useContext, useState, useEffect } from 'react';

// Complete Delhi Colleges Database
export const DELHI_COLLEGES = [
  // IITs
  { id: 'iit_delhi', name: 'IIT Delhi', shortName: 'IITD', area: 'Hauz Khas', zone: 'South Delhi', type: 'IIT', color: '#1d4ed8', emoji: '🔬', nearbyAreas: ['Hauz Khas', 'Green Park', 'Safdarjung', 'Lajpat Nagar', 'Yusuf Sarai'] },

  // University of Delhi
  { id: 'du_north', name: 'Delhi University (North Campus)', shortName: 'DU North', area: 'North Campus', zone: 'North Delhi', type: 'Central University', color: '#7c3aed', emoji: '🏛️', nearbyAreas: ['Kamla Nagar', 'GTB Nagar', 'Mukherjee Nagar', 'Civil Lines', 'Vijay Nagar'] },
  { id: 'du_south', name: 'Delhi University (South Campus)', shortName: 'DU South', area: 'Dhaula Kuan', zone: 'South Delhi', type: 'Central University', color: '#7c3aed', emoji: '🏛️', nearbyAreas: ['Dhaula Kuan', 'Vasant Kunj', 'RK Puram', 'Munirka', 'Safdarjung Enclave'] },
  { id: 'sgtb_khalsa', name: "SGTB Khalsa College", shortName: 'SGTB', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#d97706', emoji: '📚', nearbyAreas: ['Kamla Nagar', 'Vijay Nagar', 'Hudson Line', 'GTB Nagar'] },
  { id: 'miranda_house', name: 'Miranda House', shortName: 'Miranda', area: 'North Campus', zone: 'North Delhi', type: 'DU College (Girls)', color: '#db2777', emoji: '🌸', nearbyAreas: ['Kamla Nagar', 'GTB Nagar', 'Civil Lines', 'Mukherjee Nagar'] },
  { id: 'hindu_college', name: 'Hindu College', shortName: 'Hindu', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#059669', emoji: '📖', nearbyAreas: ['Kamla Nagar', 'Vijay Nagar', 'GTB Nagar'] },
  { id: 'hansraj', name: 'Hansraj College', shortName: 'Hansraj', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#0891b2', emoji: '⭐', nearbyAreas: ['Kamla Nagar', 'Mukherjee Nagar', 'GTB Nagar'] },
  { id: 'srcc', name: "SRCC (Shri Ram College of Commerce)", shortName: 'SRCC', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#0369a1', emoji: '💼', nearbyAreas: ['Kamla Nagar', 'Civil Lines', 'GTB Nagar', 'Mukherjee Nagar'] },
  { id: 'lsr', name: "Lady Shri Ram College (LSR)", shortName: 'LSR', area: 'Lajpat Nagar', zone: 'South Delhi', type: 'DU College (Girls)', color: '#e11d48', emoji: '🎓', nearbyAreas: ['Lajpat Nagar', 'Kalkaji', 'Govindpuri', 'Greater Kailash'] },
  { id: 'stephens', name: "St. Stephen's College", shortName: "St. Stephen's", area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#1e3a5f', emoji: '🎖️', nearbyAreas: ['Kamla Nagar', 'Civil Lines', 'GTB Nagar'] },
  { id: 'kirori_mal', name: 'Kirori Mal College', shortName: 'KMC', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#166534', emoji: '🌿', nearbyAreas: ['GTB Nagar', 'Vijay Nagar', 'Mukherjee Nagar'] },
  { id: 'ramjas', name: 'Ramjas College', shortName: 'Ramjas', area: 'North Campus', zone: 'North Delhi', type: 'DU College', color: '#7e22ce', emoji: '📝', nearbyAreas: ['Kamla Nagar', 'GTB Nagar', 'Civil Lines'] },
  { id: 'ip_college', name: "IP College for Women", shortName: 'IP College', area: 'North Campus', zone: 'North Delhi', type: 'DU College (Girls)', color: '#be185d', emoji: '🌺', nearbyAreas: ['Civil Lines', 'Kashmere Gate', 'Kamla Nagar'] },

  // Engineering Colleges
  { id: 'nsit', name: 'NSIT (Netaji Subhas University of Technology)', shortName: 'NSIT', area: 'Dwarka', zone: 'West Delhi', type: 'Engineering', color: '#b45309', emoji: '⚙️', nearbyAreas: ['Dwarka', 'Uttam Nagar', 'Palam', 'Dwarka Sector 10-12'] },
  { id: 'dtu', name: 'DTU (Delhi Technological University)', shortName: 'DTU', area: 'Rohini', zone: 'North Delhi', type: 'Engineering', color: '#dc2626', emoji: '🛠️', nearbyAreas: ['Rohini', 'Shahbad Dairy', 'Bawana', 'Pitampura', 'Rohini Sectors'] },
  { id: 'igdtu', name: 'IGDTUW (Indira Gandhi Delhi Technical University for Women)', shortName: 'IGDTUW', area: 'Kashmere Gate', zone: 'Central Delhi', type: 'Engineering (Women)', color: '#9d174d', emoji: '🔧', nearbyAreas: ['Kashmere Gate', 'Civil Lines', 'Shastri Park', 'Timarpur'] },

  // JNU & Others
  { id: 'jnu', name: 'JNU (Jawaharlal Nehru University)', shortName: 'JNU', area: 'Munirka', zone: 'South Delhi', type: 'Central University', color: '#065f46', emoji: '🌎', nearbyAreas: ['Munirka', 'Vasant Kunj', 'RK Puram', 'Safdarjung Enclave', 'Pushp Vihar'] },
  { id: 'jamia', name: 'Jamia Millia Islamia', shortName: 'Jamia', area: 'Jamia Nagar', zone: 'South Delhi', type: 'Central University', color: '#713f12', emoji: '🕌', nearbyAreas: ['Jamia Nagar', 'Shaheen Bagh', 'Okhla', 'Taimur Nagar', 'Batla House'] },
  { id: 'aiims', name: 'AIIMS Delhi', shortName: 'AIIMS', area: 'Ansari Nagar', zone: 'South Delhi', type: 'Medical Institute', color: '#0f766e', emoji: '🏥', nearbyAreas: ['Ansari Nagar', 'Green Park', 'INA', 'Lajpat Nagar', 'Safdarjung'] },
  { id: 'du_law', name: 'Campus Law Centre (DU)', shortName: 'CLC DU', area: 'North Campus', zone: 'North Delhi', type: 'Law College', color: '#3730a3', emoji: '⚖️', nearbyAreas: ['Kamla Nagar', 'Civil Lines', 'GTB Nagar'] },

  // Private Universities
  { id: 'amity', name: 'Amity University Noida', shortName: 'Amity', area: 'Sector 125, Noida', zone: 'NCR (Noida)', type: 'Private University', color: '#c2410c', emoji: '🏫', nearbyAreas: ['Sector 125', 'Sector 62', 'Sec 137 Noida', 'Greater Noida'] },
  { id: 'gl_bajaj', name: 'GL Bajaj Institute of Technology', shortName: 'GL Bajaj', area: 'Greater Noida', zone: 'NCR (Greater Noida)', type: 'Private Engineering', color: '#92400e', emoji: '🔩', nearbyAreas: ['Greater Noida', 'Knowledge Park', 'Pari Chowk'] },
  { id: 'bennett', name: 'Bennett University', shortName: 'Bennett', area: 'Greater Noida', zone: 'NCR (Greater Noida)', type: 'Private University', color: '#1e40af', emoji: '🎯', nearbyAreas: ['Greater Noida', 'Tech Zone', 'Surajpur'] },
  { id: 'sharda', name: 'Sharda University', shortName: 'Sharda', area: 'Greater Noida', zone: 'NCR (Greater Noida)', type: 'Private University', color: '#9333ea', emoji: '📐', nearbyAreas: ['Knowledge Park II', 'Greater Noida', 'Alpha'] },
  { id: 'ip_university', name: 'Guru Gobind Singh IP University (GGSIPU)', shortName: 'GGSIPU', area: 'Dwarka', zone: 'West Delhi', type: 'State University', color: '#dc2626', emoji: '🎓', nearbyAreas: ['Dwarka', 'Sector 14-16 Dwarka', 'Janakpuri'] },

  // Other popular
  { id: 'other', name: 'Other College (Not Listed)', shortName: 'Other', area: 'Custom Location', zone: 'Custom', type: 'Other', color: '#64748b', emoji: '🏫', nearbyAreas: [] }
];

const CollegeContext = createContext();

export const CollegeProvider = ({ children }) => {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [hasChosen, setHasChosen] = useState(false);

  // Persist selected college
  useEffect(() => {
    const saved = localStorage.getItem('staysmart_college');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedCollege(parsed);
        setHasChosen(true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const chooseCollege = (college) => {
    setSelectedCollege(college);
    setHasChosen(true);
    localStorage.setItem('staysmart_college', JSON.stringify(college));
  };

  const changeCollege = () => {
    setHasChosen(false);
    setSelectedCollege(null);
    localStorage.removeItem('staysmart_college');
  };

  return (
    <CollegeContext.Provider value={{ selectedCollege, hasChosen, chooseCollege, changeCollege }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => useContext(CollegeContext);
