// =========================================
// DEMO COMPANIES (20)
// Password for all: <CompanyName>@123 (e.g., Google@123)
// =========================================
[
  { "name": "Google", "email": "google@vriksha.com", "password": "Google@123", "website": "https://google.com" },
  { "name": "Microsoft", "email": "microsoft@vriksha.com", "password": "Microsoft@123", "website": "https://microsoft.com" },
  { "name": "Amazon", "email": "amazon@vriksha.com", "password": "Amazon@123", "website": "https://amazon.com" },
  { "name": "Meta", "email": "meta@vriksha.com", "password": "Meta@123", "website": "https://meta.com" },
  { "name": "Netflix", "email": "netflix@vriksha.com", "password": "Netflix@123", "website": "https://netflix.com" },
  { "name": "Apple", "email": "apple@vriksha.com", "password": "Apple@123", "website": "https://apple.com" },
  { "name": "Tesla", "email": "tesla@vriksha.com", "password": "Tesla@123", "website": "https://tesla.com" },
  { "name": "Stripe", "email": "stripe@vriksha.com", "password": "Stripe@123", "website": "https://stripe.com" },
  { "name": "Uber", "email": "uber@vriksha.com", "password": "Uber@123", "website": "https://uber.com" },
  { "name": "Airbnb", "email": "airbnb@vriksha.com", "password": "Airbnb@123", "website": "https://airbnb.com" },
  { "name": "Adobe", "email": "adobe@vriksha.com", "password": "Adobe@123", "website": "https://adobe.com" },
  { "name": "Atlassian", "email": "atlassian@vriksha.com", "password": "Atlassian@123", "website": "https://atlassian.com" },
  { "name": "Oracle", "email": "oracle@vriksha.com", "password": "Oracle@123", "website": "https://oracle.com" },
  { "name": "IBM", "email": "ibm@vriksha.com", "password": "Ibm@12345", "website": "https://ibm.com" },
  { "name": "Cisco", "email": "cisco@vriksha.com", "password": "Cisco@123", "website": "https://cisco.com" },
  { "name": "Intel", "email": "intel@vriksha.com", "password": "Intel@123", "website": "https://intel.com" },
  { "name": "Salesforce", "email": "salesforce@vriksha.com", "password": "Salesforce@123", "website": "https://salesforce.com" },
  { "name": "Spotify", "email": "spotify@vriksha.com", "password": "Spotify@123", "website": "https://spotify.com" },
  { "name": "Flipkart", "email": "flipkart@vriksha.com", "password": "Flipkart@123", "website": "https://flipkart.com" },
  { "name": "TCS", "email": "tcs@vriksha.com", "password": "Tcs@12345", "website": "https://tcs.com" }
]

// =========================================
// DEMO STUDENTS (20)
// Password for all: Password@123
// =========================================
// Note for Thunder Client:
// 1. POST to /api/student/signup (Only takes name, email, password, branch, cgpa, backlogs)
// 2. POST to /api/student/login (Get JWT token)
// 3. PUT to /api/student/profile with token (Send headline, bio, skills, githubUrl, linkedinUrl, resumeLink, projects)

// If you use `node seedDemoData.js`, it will insert these directly with all profile data at once!

[
  {
    "name": "Aarav Sharma", "email": "aarav.sharma@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 9.1, "backlogs": 0,
    "headline": "Aspiring Full Stack Developer | React & Node.js Enthusiast",
    "bio": "Passionate CS student with a strong foundation in MERN stack development and data structures.",
    "skills": ["JavaScript", "React.js", "Node.js", "MongoDB", "Express", "C++", "Java"],
    "githubUrl": "https://github.com/aaravsharma", "linkedinUrl": "https://linkedin.com/in/aaravsharma", "resumeLink": "https://drive.google.com/file/d/sample-aarav/view",
    "projects": [
      { "title": "Campus Placement Portal", "description": "Developed a comprehensive platform connecting students with recruiters.", "techStack": ["React", "Node.js", "MongoDB"] },
      { "title": "WeatherApp Pro", "description": "Real-time weather application using OpenWeather API with geolocation.", "techStack": ["JavaScript", "HTML", "CSS"] }
    ]
  },
  {
    "name": "Priya Patel", "email": "priya.patel@gmail.com", "password": "Password@123", "branch": "Information Technology", "cgpa": 8.7, "backlogs": 0,
    "headline": "Data Science Enthusiast | Python Developer",
    "bio": "I love working with data and discovering hidden patterns. Exploring machine learning algorithms and building predictive models is my core interest.",
    "skills": ["Python", "Pandas", "Scikit-Learn", "SQL", "Tableau", "Machine Learning"],
    "githubUrl": "https://github.com/priyapatel", "linkedinUrl": "https://linkedin.com/in/priyapatel", "resumeLink": "https://drive.google.com/file/d/sample-priya/view",
    "projects": [
      { "title": "Stock Price Predictor", "description": "Machine learning model to predict stock trends using historical data.", "techStack": ["Python", "Scikit-Learn", "Pandas"] }
    ]
  },
  {
    "name": "Rahul Verma", "email": "rahul.verma@gmail.com", "password": "Password@123", "branch": "Electronics", "cgpa": 8.2, "backlogs": 1,
    "headline": "IoT & Embedded Systems Engineer",
    "bio": "Fascinated by hardware-software integration. Actively working on IoT devices and microcontroller programming.",
    "skills": ["C", "Embedded C", "Arduino", "IoT", "Python", "Raspberry Pi"],
    "githubUrl": "https://github.com/rahulverma", "linkedinUrl": "https://linkedin.com/in/rahulverma", "resumeLink": "https://drive.google.com/file/d/sample-rahul/view",
    "projects": [
      { "title": "Smart Home Automation", "description": "An IoT based home automation system controllable via web dashboard.", "techStack": ["Arduino", "Node.js", "MQTT"] }
    ]
  },
  {
    "name": "Sneha Reddy", "email": "sneha.reddy@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 9.5, "backlogs": 0,
    "headline": "Backend Developer | Go & Microservices",
    "bio": "Deeply interested in distributed systems, backend architectures, and high-performance computing.",
    "skills": ["Golang", "Java", "Docker", "Kubernetes", "PostgreSQL", "Redis"],
    "githubUrl": "https://github.com/snehareddy", "linkedinUrl": "https://linkedin.com/in/snehareddy", "resumeLink": "https://drive.google.com/file/d/sample-sneha/view",
    "projects": [
      { "title": "High-Concurrency Chat App", "description": "A lightweight chat server written in Go capable of handling thousands of concurrent connections.", "techStack": ["Golang", "WebSockets", "Redis"] }
    ]
  },
  {
    "name": "Vikram Singh", "email": "vikram.singh@gmail.com", "password": "Password@123", "branch": "Mechanical", "cgpa": 7.8, "backlogs": 0,
    "headline": "CAD Designer & Robotics Enthusiast",
    "bio": "Passionate about robotics, kinematics, and product design. Looking for opportunities in automation and manufacturing.",
    "skills": ["AutoCAD", "SolidWorks", "MATLAB", "Python", "Robotics"],
    "linkedinUrl": "https://linkedin.com/in/vikramsingh", "resumeLink": "https://drive.google.com/file/d/sample-vikram/view",
    "projects": [
      { "title": "Autonomous Delivery Bot", "description": "Designed the chassis and mechanical arms for a small delivery robot.", "techStack": ["SolidWorks", "MATLAB"] }
    ]
  },
  {
    "name": "Anjali Desai", "email": "anjali.desai@gmail.com", "password": "Password@123", "branch": "Information Technology", "cgpa": 8.5, "backlogs": 0,
    "headline": "UI/UX Designer & Frontend Developer",
    "bio": "Crafting beautiful, accessible, and user-friendly web experiences. I bridge the gap between design and engineering.",
    "skills": ["Figma", "HTML5", "CSS3", "Tailwind", "JavaScript", "Vue.js"],
    "githubUrl": "https://github.com/anjalidesai", "linkedinUrl": "https://linkedin.com/in/anjalidesai", "resumeLink": "https://drive.google.com/file/d/sample-anjali/view",
    "projects": [
      { "title": "E-commerce Redesign", "description": "Completely revamped the UI of an open-source e-commerce platform for better conversion rates.", "techStack": ["Vue.js", "Tailwind", "Figma"] }
    ]
  },
  {
    "name": "Rohan Gupta", "email": "rohan.gupta@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 8.1, "backlogs": 2,
    "headline": "Cybersecurity Analyst & Ethical Hacker",
    "bio": "Exploring the world of InfoSec. Proficient in penetration testing, vulnerability assessment, and network security.",
    "skills": ["Kali Linux", "Wireshark", "Metasploit", "Python", "Bash", "Networking"],
    "githubUrl": "https://github.com/rohangupta", "linkedinUrl": "https://linkedin.com/in/rohangupta", "resumeLink": "https://drive.google.com/file/d/sample-rohan/view",
    "projects": [
      { "title": "Network Traffic Analyzer", "description": "A Python-based tool to monitor and flag suspicious packets in real-time.", "techStack": ["Python", "Scapy"] }
    ]
  },
  {
    "name": "Kavya Iyer", "email": "kavya.iyer@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 9.3, "backlogs": 0,
    "headline": "AI/ML Researcher | Published Author",
    "bio": "Research-focused student working on NLP and large language models. Published a paper on sentiment analysis in regional languages.",
    "skills": ["Python", "PyTorch", "TensorFlow", "NLP", "Transformers"],
    "githubUrl": "https://github.com/kavyaiyer", "linkedinUrl": "https://linkedin.com/in/kavyaiyer", "resumeLink": "https://drive.google.com/file/d/sample-kavya/view",
    "projects": [
      { "title": "Regional Lang Sentiment Analyzer", "description": "Transformer model fine-tuned for sentiment analysis on low-resource Indian languages.", "techStack": ["PyTorch", "HuggingFace"] }
    ]
  },
  {
    "name": "Sameer Khan", "email": "sameer.khan@gmail.com", "password": "Password@123", "branch": "Civil", "cgpa": 7.9, "backlogs": 0,
    "headline": "Civil Engineer | Structural Design",
    "bio": "Dedicated civil engineering student with a knack for modern, sustainable structural designs.",
    "skills": ["AutoCAD", "STAAD Pro", "Project Management"],
    "linkedinUrl": "https://linkedin.com/in/sameerkhan", "resumeLink": "https://drive.google.com/file/d/sample-sameer/view",
    "projects": [
      { "title": "Eco-Friendly Bridge Design", "description": "Proposed a sustainable bridge model using recycled composite materials.", "techStack": ["STAAD Pro"] }
    ]
  },
  {
    "name": "Neha Sharma", "email": "neha.sharma@gmail.com", "password": "Password@123", "branch": "Information Technology", "cgpa": 8.8, "backlogs": 0,
    "headline": "Cloud Computing & DevOps Engineer",
    "bio": "Automating everything. Passionate about CI/CD pipelines, cloud infrastructure, and serverless computing.",
    "skills": ["AWS", "Terraform", "Docker", "Jenkins", "Linux", "Python"],
    "githubUrl": "https://github.com/nehasharma", "linkedinUrl": "https://linkedin.com/in/nehasharma", "resumeLink": "https://drive.google.com/file/d/sample-neha/view",
    "projects": [
      { "title": "Serverless Image Processor", "description": "AWS Lambda based service to automatically compress and thumbnail uploaded images.", "techStack": ["AWS S3", "AWS Lambda", "Node.js"] }
    ]
  },
  { "name": "Amit Patel", "email": "amit.patel@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 8.6, "backlogs": 0, "headline": "Software Engineer", "bio": "Coding is life.", "skills": ["Java", "Spring Boot"], "githubUrl": "https://github.com/amitpatel", "linkedinUrl": "https://linkedin.com/in/amitpatel", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Shruti Desai", "email": "shruti.desai@gmail.com", "password": "Password@123", "branch": "Electronics", "cgpa": 9.0, "backlogs": 0, "headline": "VLSI Enthusiast", "bio": "Chip design and hardware programming.", "skills": ["Verilog", "VHDL"], "githubUrl": "https://github.com/shrutidesai", "linkedinUrl": "https://linkedin.com/in/shrutidesai", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Arjun Reddy", "email": "arjun.reddy@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 7.5, "backlogs": 3, "headline": "Game Developer", "bio": "Building immersive 3D experiences.", "skills": ["Unity", "C#", "Unreal Engine"], "githubUrl": "https://github.com/arjunreddy", "linkedinUrl": "https://linkedin.com/in/arjunreddy", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Kiran Rao", "email": "kiran.rao@gmail.com", "password": "Password@123", "branch": "Information Technology", "cgpa": 8.4, "backlogs": 0, "headline": "Mobile App Developer", "bio": "Flutter and React Native developer.", "skills": ["Flutter", "Dart", "Firebase"], "githubUrl": "https://github.com/kiranrao", "linkedinUrl": "https://linkedin.com/in/kiranrao", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Pooja Singh", "email": "pooja.singh@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 8.9, "backlogs": 0, "headline": "Blockchain Developer", "bio": "Web3 and smart contract enthusiast.", "skills": ["Solidity", "Ethereum", "Web3.js"], "githubUrl": "https://github.com/poojasingh", "linkedinUrl": "https://linkedin.com/in/poojasingh", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Deepak Kumar", "email": "deepak.kumar@gmail.com", "password": "Password@123", "branch": "Mechanical", "cgpa": 7.2, "backlogs": 1, "headline": "Automotive Engineer", "bio": "Passionate about EVs.", "skills": ["MATLAB", "AutoCAD"], "linkedinUrl": "https://linkedin.com/in/deepakkumar", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Swati Verma", "email": "swati.verma@gmail.com", "password": "Password@123", "branch": "Electronics", "cgpa": 8.7, "backlogs": 0, "headline": "Signal Processing", "bio": "Working on DSP algorithms.", "skills": ["DSP", "MATLAB", "C++"], "githubUrl": "https://github.com/swativerma", "linkedinUrl": "https://linkedin.com/in/swativerma", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Nithin Thomas", "email": "nithin.thomas@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 9.6, "backlogs": 0, "headline": "Competitive Programmer", "bio": "ICPC Regionalist.", "skills": ["C++", "Algorithms", "Data Structures"], "githubUrl": "https://github.com/nithinthomas", "linkedinUrl": "https://linkedin.com/in/nithinthomas", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Megha Nair", "email": "megha.nair@gmail.com", "password": "Password@123", "branch": "Information Technology", "cgpa": 8.3, "backlogs": 0, "headline": "QA Automation Engineer", "bio": "Ensuring bug-free software delivery.", "skills": ["Selenium", "Cypress", "Java"], "githubUrl": "https://github.com/meghanair", "linkedinUrl": "https://linkedin.com/in/meghanair", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] },
  { "name": "Varun Joshi", "email": "varun.joshi@gmail.com", "password": "Password@123", "branch": "Computer Science", "cgpa": 8.0, "backlogs": 0, "headline": "Full Stack Engineer", "bio": "Building the web one component at a time.", "skills": ["React", "Node.js"], "githubUrl": "https://github.com/varunjoshi", "linkedinUrl": "https://linkedin.com/in/varunjoshi", "resumeLink": "https://drive.google.com/file/d/sample/view", "projects": [] }
]

