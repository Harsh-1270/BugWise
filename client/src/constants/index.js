import {
  benefitIcon1,
  benefitIcon2,
  benefitIcon3,
  benefitIcon4,
  benefitImage2,
  chromecast,
  disc02,
  discord,
  discordBlack,
  facebook,
  figma,
  file02,
  framer,
  homeSmile,
  instagram,
  notification2,
  notification3,
  notification4,
  notion,
  photoshop,
  plusSquare,
  protopie,
  raindrop,
  recording01,
  recording03,
  roadmap1,
  roadmap2,
  roadmap3,
  roadmap4,
  searchMd,
  slack,
  sliders04,
  telegram,
  twitter,
  yourlogo,
} from "../assets";

export const navigation = [
  {
    id: "0",
    title: "Features",
    url: "#features",
  },
  // {
  //   id: "1",
  //   title: "Pricing",
  //   url: "#pricing",
  // },
  {
    id: "2",
    title: "How to use",
    url: "#how-to-use",
  },
  {
    id: "3",
    title: "Roadmap",
    url: "#roadmap",
  },
  {
    id: "4",
    title: "New account",
    url: "#signup",
    onlyMobile: true,
  },
  {
    id: "5",
    title: "Sign in",
    url: "#login",
    onlyMobile: true,
  },
];

export const heroIcons = [homeSmile, file02, searchMd, plusSquare];

export const notificationImages = [notification4, notification3, notification2];

export const companyLogos = [];

export const brainwaveServices = [
  "AI-Powered Bug Detection",
  "Instant GitHub Code Analysis",
  "Smart Error Highlighting",
  "Bug History & Insights Dashboard",
];

export const brainwaveServicesIcons = [
  recording03,
  recording01,
  disc02,
  chromecast,
  sliders04,
];
export const roadmap = [
  {
    id: "0",
    title: "AI Bug Detection Engine",
    text: "Utilize deep learning models to automatically detect syntax errors, logic flaws, and vulnerabilities from GitHub code repositories.",
    date: "May 2025",
    status: "done",
    imageUrl: roadmap1,
    colorful: true,
  },
  {
    id: "1",
    title: "GitHub Link Integration",
    text: "Allow users to paste GitHub URLs for automated scanning of public repositories — no manual uploads required.",
    date: "May 2025",
    status: "done",
    imageUrl: roadmap2,
  },
  {
    id: "2",
    title: "Bug Visualization Dashboard",
    text: "Provide developers with a clean, interactive dashboard showing categorized bug reports with severity levels and code references.",
    date: "June 2025",
    status: "progress",
    imageUrl: roadmap3,
  },
  {
    id: "3",
    title: "User History & Scan Tracking",
    text: "Enable signed-in users to view past scans, track bug resolution progress, and monitor code health over time.",
    date: "June 2025",
    status: "progress",
    imageUrl: roadmap4,
  },
];

export const collabText =
  "With AI-powered detection  a user-centric dashboard, Bugwise delivers the ultimate solution for developers and teams aiming to build cleaner code and boost productivity.";

export const collabContent = [
  {
    id: "0",
    title: "AI-Powered Bug Detection",
    text: collabText,
  },
  {
    id: "1",
    title: "Interactive Visualization Dashboard",
  },
  {
    id: "2",
    title: "Comprehensive Scan History & Tracking",
  },
];


export const collabApps = [
  {
    id: "0",
    title: "Figma",
    icon: figma,
    width: 26,
    height: 36,
  },
  {
    id: "1",
    title: "Notion",
    icon: notion,
    width: 34,
    height: 36,
  },
  {
    id: "2",
    title: "Discord",
    icon: discord,
    width: 36,
    height: 28,
  },
  {
    id: "3",
    title: "Slack",
    icon: slack,
    width: 34,
    height: 35,
  },
  {
    id: "4",
    title: "Photoshop",
    icon: photoshop,
    width: 34,
    height: 34,
  },
  {
    id: "5",
    title: "Protopie",
    icon: protopie,
    width: 34,
    height: 34,
  },
  {
    id: "6",
    title: "Framer",
    icon: framer,
    width: 26,
    height: 34,
  },
  {
    id: "7",
    title: "Raindrop",
    icon: raindrop,
    width: 38,
    height: 32,
  },
];

export const pricing = [
//   {
//     id: "0",
//     title: "Basic",
//     description: "AI chatbot, personalized recommendations",
//     price: "0",
//     features: [
//       "An AI chatbot that can understand your queries",
//       "Personalized recommendations based on your preferences",
//       "Ability to explore the app and its features without any cost",
//     ],
//   },
//   {
//     id: "1",
//     title: "Premium",
//     description: "Advanced AI chatbot, priority support, analytics dashboard",
//     price: "9.99",
//     features: [
//       "An advanced AI chatbot that can understand complex queries",
//       "An analytics dashboard to track your conversations",
//       "Priority support to solve issues quickly",
//     ],
//   },
//   {
//     id: "2",
//     title: "Enterprise",
//     description: "Custom AI chatbot, advanced analytics, dedicated account",
//     price: null,
//     features: [
//       "An AI chatbot that can understand your queries",
//       "Personalized recommendations based on your preferences",
//       "Ability to explore the app and its features without any cost",
//     ],
//   },
];

export const benefits = [
  {
    id: "0",
    title: "Automated Bug Detection",
    text: "Quickly identifies syntax errors, logic flaws, and vulnerabilities in code, saving developers countless hours.",
    backgroundUrl: "./src/assets/benefits/card-1.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "1",
    title: "Real-time Visual Reports",
    text: "Provides clear, interactive dashboards showing categorized bugs with severity levels and direct code references.",
    backgroundUrl: "./src/assets/benefits/card-2.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "2",
    title: "Seamless GitHub Integration",
    text: "Scan public repositories effortlessly by pasting GitHub URLs, ensuring no manual uploads are necessary.",
    backgroundUrl: "./src/assets/benefits/card-3.svg",
    iconUrl: benefitIcon3,
    imageUrl: benefitImage2,
  },
  {
    id: "3",
    title: "User Activity Tracking",
    text: "Track bug resolution progress over time and monitor code health with detailed user history and scan logs.",
    backgroundUrl: "./src/assets/benefits/card-4.svg",
    iconUrl: benefitIcon4,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "4",
    title: "Secure & Reliable",
    text: "Ensures data integrity and privacy with top-notch security measures tailored for developers’ peace of mind.",
    backgroundUrl: "./src/assets/benefits/card-5.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "5",
    title: "Enhanced Collaboration",
    text: "Facilitates collaboration between teams by providing shared dashboards, bug tracking, and real-time updates.",
    backgroundUrl: "./src/assets/benefits/card-6.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
  },
];


export const socials = [
  {
    id: "0",
    title: "Discord",
    iconUrl: discordBlack,
    url: "#",
  },
  {
    id: "1",
    title: "Twitter",
    iconUrl: twitter,
    url: "#",
  },
  {
    id: "2",
    title: "Instagram",
    iconUrl: instagram,
    url: "#",
  },
  {
    id: "3",
    title: "Telegram",
    iconUrl: telegram,
    url: "#",
  },
  {
    id: "4",
    title: "Facebook",
    iconUrl: facebook,
    url: "#",
  },
];
