export interface University {
  id: string;
  name: string;
  country: string;
  state_province?: string;
  city: string;
  web_pages: string[];
  domains: string[];
  world_rank?: number;
  country_rank?: number;
  type: "Public" | "Private";
  est_year?: number;
  acceptance_rate?: string;
  avg_tuition_usd?: string;
  top_majors: string[];
  flag: string;
  description?: string;
  admission_requirements?: {
    gpa?: string;
    tests?: string[];
    language?: string[];
    documents?: string[];
  };
}

export const POPULAR_COUNTRIES = [
  { name: "All Countries", code: "ALL", flag: "🌐" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "Singapore", code: "SG", flag: "🇸🇬" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { name: "China", code: "CN", flag: "🇨🇳" }
];

export const COMPREHENSIVE_UNIVERSITIES: University[] = [
  // INDIA
  {
    id: "iitb",
    name: "Indian Institute of Technology Bombay (IITB)",
    country: "India",
    state_province: "Maharashtra",
    city: "Mumbai",
    web_pages: ["https://www.iitb.ac.in"],
    domains: ["iitb.ac.in"],
    world_rank: 118,
    country_rank: 1,
    type: "Public",
    est_year: 1958,
    acceptance_rate: "0.5%",
    avg_tuition_usd: "$3,000 / yr",
    top_majors: ["Computer Science & Engineering", "Electrical Engineering", "Mechanical Engineering", "Aerospace", "Data Science"],
    flag: "🇮🇳",
    description: "Premier autonomous engineering and research institution renowned globally for engineering rigor, tech entrepreneurship, and world-class faculty.",
    admission_requirements: {
      gpa: "8.5+ / 10",
      tests: ["JEE Advanced (UG)", "GATE (PG)", "CEED (Design)"],
      language: ["English Proficiency"],
      documents: ["Class 12 Transcripts", "JEE Rank Card", "Category Certificate (if applicable)", "SOP for PG"]
    }
  },
  {
    id: "iitd",
    name: "Indian Institute of Technology Delhi (IITD)",
    country: "India",
    state_province: "Delhi",
    city: "New Delhi",
    web_pages: ["https://www.iitd.ac.in"],
    domains: ["iitd.ac.in"],
    world_rank: 150,
    country_rank: 2,
    type: "Public",
    est_year: 1961,
    acceptance_rate: "0.6%",
    avg_tuition_usd: "$3,000 / yr",
    top_majors: ["Computer Science", "Artificial Intelligence", "Biotechnology", "Chemical Engineering", "Textile Tech"],
    flag: "🇮🇳",
    description: "Located in the capital city, IIT Delhi excels in deep-tech incubation, AI research, robotics, and industrial collaboration.",
    admission_requirements: {
      gpa: "8.5+ / 10",
      tests: ["JEE Advanced", "GATE"],
      language: ["English"],
      documents: ["JEE Scorecard", "Class 10/12 Transcripts", "Passport Photo", "Recommendation Letters"]
    }
  },
  {
    id: "iitm",
    name: "Indian Institute of Technology Madras (IITM)",
    country: "India",
    state_province: "Tamil Nadu",
    city: "Chennai",
    web_pages: ["https://www.iitm.ac.in"],
    domains: ["iitm.ac.in"],
    world_rank: 227,
    country_rank: 3,
    type: "Public",
    est_year: 1959,
    acceptance_rate: "0.5%",
    avg_tuition_usd: "$2,800 / yr",
    top_majors: ["Ocean Engineering", "Data Science & Applications", "Electrical Engineering", "Nanotechnology", "Computer Science"],
    flag: "🇮🇳",
    description: "Ranked #1 in NIRF India consistently for years. Boasts India's first university-based research park with massive startup output.",
    admission_requirements: {
      gpa: "8.0+ / 10",
      tests: ["JEE Advanced", "GATE", "BS Data Science Entrance"],
      language: ["English"],
      documents: ["JEE Rank Certificate", "Transcripts", "Govt ID"]
    }
  },
  {
    id: "iisc",
    name: "Indian Institute of Science Bangalore (IISc)",
    country: "India",
    state_province: "Karnataka",
    city: "Bengaluru",
    web_pages: ["https://iisc.ac.in"],
    domains: ["iisc.ac.in"],
    world_rank: 211,
    country_rank: 4,
    type: "Public",
    est_year: 1909,
    acceptance_rate: "1.0%",
    avg_tuition_usd: "$1,500 / yr",
    top_majors: ["Physics", "Aerospace Engineering", "Molecular Biophysics", "Computer Science", "Quantum Computing"],
    flag: "🇮🇳",
    description: "India's highest-ranked pure science and postgraduate research institution, established with support from Jamsetji Tata.",
    admission_requirements: {
      gpa: "9.0+ / 10",
      tests: ["JEE Advanced", "KVPY", "GATE", "NET JRF"],
      language: ["English"],
      documents: ["Research Proposal", "GATE Scorecard", "Transcripts", "Letters of Recommendation"]
    }
  },
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science, Pilani (BITS)",
    country: "India",
    state_province: "Rajasthan",
    city: "Pilani",
    web_pages: ["https://www.bits-pilani.ac.in"],
    domains: ["bits-pilani.ac.in"],
    world_rank: 800,
    country_rank: 8,
    type: "Private",
    est_year: 1964,
    acceptance_rate: "2.5%",
    avg_tuition_usd: "$6,500 / yr",
    top_majors: ["Computer Science", "Electronics & Instrumentation", "Mechanical Engineering", "Pharmacy", "Economics"],
    flag: "🇮🇳",
    description: "Deemed university known for 'No Attendance' policy, meritocracy, dual degree options, and high startup founders index.",
    admission_requirements: {
      gpa: "75%+ in Physics, Chem, Math",
      tests: ["BITSAT Entrance Exam"],
      language: ["English"],
      documents: ["Class 12 Marksheet", "BITSAT Score Card", "ID Proof"]
    }
  },
  {
    id: "du",
    name: "University of Delhi (DU)",
    country: "India",
    state_province: "Delhi",
    city: "New Delhi",
    web_pages: ["https://www.du.ac.in"],
    domains: ["du.ac.in"],
    world_rank: 500,
    country_rank: 9,
    type: "Public",
    est_year: 1922,
    acceptance_rate: "3.0%",
    avg_tuition_usd: "$500 / yr",
    top_majors: ["Commerce (B.Com Hons)", "Economics", "Political Science", "Physics", "English Literature"],
    flag: "🇮🇳",
    description: "Premier central university housing prestigious colleges like St. Stephen's, SRCC, Hindu, and Lady Shri Ram.",
    admission_requirements: {
      gpa: "85%+",
      tests: ["CUET UG / CUET PG"],
      language: ["English / Hindi"],
      documents: ["CUET Scorecard", "Class 12 Certificates", "Category Certificates"]
    }
  },

  // UNITED STATES
  {
    id: "mit",
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    state_province: "Massachusetts",
    city: "Cambridge",
    web_pages: ["https://www.mit.edu"],
    domains: ["mit.edu"],
    world_rank: 1,
    country_rank: 1,
    type: "Private",
    est_year: 1861,
    acceptance_rate: "3.9%",
    avg_tuition_usd: "$60,156 / yr",
    top_majors: ["Computer Science & AI", "Mechanical Engineering", "Physics", "Mathematics", "Economics & Brain Science"],
    flag: "🇺🇸",
    description: "Global #1 ranked university famous for rigorous engineering, scientific breakthroughs, media lab, and entrepreneurial alumni network.",
    admission_requirements: {
      gpa: "3.9+ / 4.0",
      tests: ["SAT / ACT (Required)", "SAT Math 780+"],
      language: ["TOEFL (100+) / IELTS (7.5+)"],
      documents: ["Secondary School Report", "2 Teacher Recommendations", "Essays / Portfolio", "Financial Aid Form"]
    }
  },
  {
    id: "stanford",
    name: "Stanford University",
    country: "United States",
    state_province: "California",
    city: "Stanford",
    web_pages: ["https://www.stanford.edu"],
    domains: ["stanford.edu"],
    world_rank: 2,
    country_rank: 2,
    type: "Private",
    est_year: 1885,
    acceptance_rate: "3.68%",
    avg_tuition_usd: "$62,484 / yr",
    top_majors: ["Computer Science", "Symbolic Systems", "Human Biology", "Economics", "Electrical Engineering"],
    flag: "🇺🇸",
    description: "Heart of Silicon Valley. Produced founders of Google, Yahoo, HP, LinkedIn, and Netflix.",
    admission_requirements: {
      gpa: "3.95+ / 4.0",
      tests: ["SAT / ACT"],
      language: ["TOEFL / IELTS"],
      documents: ["Common Application", "Stanford Questions & Short Essays", "Counselor Letter", "Transcripts"]
    }
  },
  {
    id: "harvard",
    name: "Harvard University",
    country: "United States",
    state_province: "Massachusetts",
    city: "Cambridge",
    web_pages: ["https://www.harvard.edu"],
    domains: ["harvard.edu"],
    world_rank: 4,
    country_rank: 3,
    type: "Private",
    est_year: 1636,
    acceptance_rate: "3.4%",
    avg_tuition_usd: "$59,076 / yr",
    top_majors: ["Economics", "Government & Political Science", "Computer Science", "Applied Mathematics", "History"],
    flag: "🇺🇸",
    description: "Oldest institution of higher learning in the US, with world's largest academic endowment and influential law, business, and medical schools.",
    admission_requirements: {
      gpa: "4.0 / 4.0",
      tests: ["SAT / ACT"],
      language: ["TOEFL / IELTS"],
      documents: ["Common App / Coalition App", "Harvard Supplemental Essays", "Midyear School Report"]
    }
  },
  {
    id: "berkeley",
    name: "University of California, Berkeley (UC Berkeley)",
    country: "United States",
    state_province: "California",
    city: "Berkeley",
    web_pages: ["https://www.berkeley.edu"],
    domains: ["berkeley.edu"],
    world_rank: 10,
    country_rank: 4,
    type: "Public",
    est_year: 1868,
    acceptance_rate: "11.4%",
    avg_tuition_usd: "$44,467 / yr",
    top_majors: ["EECS (Electrical Engineering & Computer Science)", "Data Science", "Economics", "Cellular Biology", "Business (Haas)"],
    flag: "🇺🇸",
    description: "World's top-ranked public university, pioneer of Unix, open-source tech, nuclear discoveries, and free speech movement.",
    admission_requirements: {
      gpa: "3.85+",
      tests: ["Test Free (UC System)"],
      language: ["TOEFL 80+ / IELTS 6.5+"],
      documents: ["UC Application", "Personal Insight Questions (PIQs)", "High School Transcripts"]
    }
  },

  // UNITED KINGDOM
  {
    id: "oxford",
    name: "University of Oxford",
    country: "United Kingdom",
    state_province: "Oxfordshire",
    city: "Oxford",
    web_pages: ["https://www.ox.ac.uk"],
    domains: ["ox.ac.uk"],
    world_rank: 3,
    country_rank: 1,
    type: "Public",
    est_year: 1096,
    acceptance_rate: "13.5%",
    avg_tuition_usd: "$38,000 / yr",
    top_majors: ["Philosophy, Politics and Economics (PPE)", "Computer Science", "Medicine", "Law (Jurisprudence)", "Mathematics"],
    flag: "🇬🇧",
    description: "The oldest university in the English-speaking world, featuring tutorial teaching system, 39 autonomous colleges, and Rhodes scholarship.",
    admission_requirements: {
      gpa: "A*A*A in A-Levels / 39+ IB",
      tests: ["MAT / PAT / TSA / LNAT"],
      language: ["IELTS 7.5+"],
      documents: ["UCAS Application", "Personal Statement", "Academic Written Work", "Interview"]
    }
  },
  {
    id: "cambridge",
    name: "University of Cambridge",
    country: "United Kingdom",
    state_province: "Cambridgeshire",
    city: "Cambridge",
    web_pages: ["https://www.cam.ac.uk"],
    domains: ["cam.ac.uk"],
    world_rank: 5,
    country_rank: 2,
    type: "Public",
    est_year: 1209,
    acceptance_rate: "15.7%",
    avg_tuition_usd: "$40,000 / yr",
    top_majors: ["Natural Sciences", "Engineering", "Computer Science", "Mathematics (Tripos)", "Medicine"],
    flag: "🇬🇧",
    description: "Famous for Isaac Newton, Alan Turing, Stephen Hawking, discovery of DNA structure, and Silicon Fen technology hub.",
    admission_requirements: {
      gpa: "A*A*A / IB 40-42",
      tests: ["TMUA / ESAT / STEP Math"],
      language: ["IELTS 7.5+"],
      documents: ["UCAS Application", "My Cambridge Application", "Reference Letter", "College Interview"]
    }
  },
  {
    id: "imperial",
    name: "Imperial College London",
    country: "United Kingdom",
    state_province: "London",
    city: "London",
    web_pages: ["https://www.imperial.ac.uk"],
    domains: ["imperial.ac.uk"],
    world_rank: 6,
    country_rank: 3,
    type: "Public",
    est_year: 1907,
    acceptance_rate: "14.3%",
    avg_tuition_usd: "$42,000 / yr",
    top_majors: ["Computing & AI", "Aeronautical Engineering", "Biomedical Science", "Physics", "Imperial College Business School"],
    flag: "🇬🇧",
    description: "Exclusively focused on Science, Engineering, Medicine, and Business, situated in South Kensington, London.",
    admission_requirements: {
      gpa: "A*A*A / IB 39-41",
      tests: ["STAT / MAT"],
      language: ["IELTS 7.0+"],
      documents: ["UCAS Statement", "Transcripts", "Teacher Reference"]
    }
  },

  // CANADA
  {
    id: "utoronto",
    name: "University of Toronto",
    country: "Canada",
    state_province: "Ontario",
    city: "Toronto",
    web_pages: ["https://www.utoronto.ca"],
    domains: ["utoronto.ca"],
    world_rank: 21,
    country_rank: 1,
    type: "Public",
    est_year: 1827,
    acceptance_rate: "43%",
    avg_tuition_usd: "$38,000 / yr",
    top_majors: ["Computer Science (AI Institute)", "Rotman Commerce", "Biomedical Engineering", "Psychology", "Life Sciences"],
    flag: "🇨🇦",
    description: "Canada's premier research powerhouse, birthplace of deep learning (Geoffrey Hinton), insulin, and electron microscope.",
    admission_requirements: {
      gpa: "88%+ / 3.7+",
      tests: ["Optional (SAT not required)"],
      language: ["IELTS 6.5+ / TOEFL 100+"],
      documents: ["High School Transcripts", "Supplemental Application (CS/Rotman)", "Video Interview"]
    }
  },
  {
    id: "ubc",
    name: "University of British Columbia (UBC)",
    country: "Canada",
    state_province: "British Columbia",
    city: "Vancouver",
    web_pages: ["https://www.ubc.ca"],
    domains: ["ubc.ca"],
    world_rank: 34,
    country_rank: 2,
    type: "Public",
    est_year: 1908,
    acceptance_rate: "52%",
    avg_tuition_usd: "$32,000 / yr",
    top_majors: ["Sauder School of Business", "Computer Science", "Forestry & Environmental Studies", "Global Public Health"],
    flag: "🇨🇦",
    description: "Stunning Pacific Ocean campus with global research reputation in sustainability, quantum computing, and forestry.",
    admission_requirements: {
      gpa: "85%+",
      tests: ["N/A"],
      language: ["IELTS 6.5+"],
      documents: ["UBC Personal Profile", "Transcripts", "Extracurricular Essay"]
    }
  },

  // AUSTRALIA
  {
    id: "unimelb",
    name: "The University of Melbourne",
    country: "Australia",
    state_province: "Victoria",
    city: "Melbourne",
    web_pages: ["https://www.unimelb.edu.au"],
    domains: ["unimelb.edu.au"],
    world_rank: 13,
    country_rank: 1,
    type: "Public",
    est_year: 1853,
    acceptance_rate: "70%",
    avg_tuition_usd: "$29,000 / yr",
    top_majors: ["Medicine & Dentistry", "Law", "Computer Science", "Melbourne Business School", "Architecture"],
    flag: "🇦🇺",
    description: "Australia's top-ranked university using the 'Melbourne Model' generalist degree format.",
    admission_requirements: {
      gpa: "85% / ATAR 90+",
      tests: ["GAMSAT for Medicine"],
      language: ["IELTS 6.5+"],
      documents: ["Secondary Marksheet", "Passport copy", "SOP for visa"]
    }
  },

  // GERMANY
  {
    id: "tum",
    name: "Technical University of Munich (TUM)",
    country: "Germany",
    state_province: "Bavaria",
    city: "Munich",
    web_pages: ["https://www.tum.de"],
    domains: ["tum.de"],
    world_rank: 28,
    country_rank: 1,
    type: "Public",
    est_year: 1868,
    acceptance_rate: "8%",
    avg_tuition_usd: "$3,000 / yr",
    top_majors: ["Informatics (CS)", "Robotics & AI", "Automotive Engineering", "Management & Tech", "Biotech"],
    flag: "🇩🇪",
    description: "Germany's leading technical university with close partnerships with BMW, Siemens, and SAP.",
    admission_requirements: {
      gpa: "1.5 or better on German scale",
      tests: ["Aptitude Assessment Test"],
      language: ["German C1 or English C1 depending on course"],
      documents: ["Uni-Assist VPD", "Transcripts", "Motivation Letter"]
    }
  },

  // SINGAPORE
  {
    id: "nus",
    name: "National University of Singapore (NUS)",
    country: "Singapore",
    city: "Singapore",
    web_pages: ["https://nus.edu.sg"],
    domains: ["nus.edu.sg"],
    world_rank: 8,
    country_rank: 1,
    type: "Public",
    est_year: 1905,
    acceptance_rate: "5%",
    avg_tuition_usd: "$22,000 / yr",
    top_majors: ["Computer Science & Cybersecurity", "Civil Engineering", "NUS Business School", "Data Analytics"],
    flag: "🇸🇬",
    description: "Asia's #1 university, renown for enterprise incubators (NUS Overseas Colleges), AI research, and smart city innovations.",
    admission_requirements: {
      gpa: "90%+ / IB 38+",
      tests: ["SAT / ACT (International applicants)"],
      language: ["IELTS 6.5+ / TOEFL 92+"],
      documents: ["High School Transcripts", "National Exam Results", "Co-Curricular Portfolio"]
    }
  },

  // JAPAN
  {
    id: "utokyo",
    name: "The University of Tokyo (Todai)",
    country: "Japan",
    state_province: "Tokyo",
    city: "Tokyo",
    web_pages: ["https://www.u-tokyo.ac.jp"],
    domains: ["u-tokyo.ac.jp"],
    world_rank: 28,
    country_rank: 1,
    type: "Public",
    est_year: 1877,
    acceptance_rate: "10%",
    avg_tuition_usd: "$4,200 / yr",
    top_majors: ["PEAK (Programs in English at Komaba)", "Robotics", "Physics", "Law", "Medicine"],
    flag: "🇯🇵",
    description: "Japan's most prestigious university, produced 16 Prime Ministers and 18 Nobel Laureates.",
    admission_requirements: {
      gpa: "3.8+",
      tests: ["Todai Entrance Exam or PEAK Selection"],
      language: ["Japanese JLPT N1 or English C1"],
      documents: ["Transcripts", "Essays", "Letters of Recommendation"]
    }
  }
];
