// Goes to: client/src/mockData/adminArticles.js
//
// DUMMY DATA ONLY — no database connection here.
// This array's shape is the CONTRACT with two other modules:
//   - Article/Blog Module   (Suhani Mulchandani)
//   - Quiz Module           (Mohammed Nihal Aziz)
//
// Confirm every field name with them before merging so nothing breaks.
// coverImage uses picsum.photos placeholder URLs — swap for real uploaded
// images once the Article module provides them.

let articles = [
  {
    id: "art_001",
    title: "What the Ocean Is Trying to Tell Us About Carbon",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "8 min",
    submittedDate: "2026-08-10",
    status: "pending",
    excerpt: "The sea absorbs a quarter of all human CO2 emissions. What happens when it can no longer keep up?",
    content:
      "The sea absorbs a quarter of all human CO2 emissions. What happens when it can no longer keep up? " +
      "This piece walks through ocean acidification, carbon sinks, and what recent research says about the tipping point.",
    coverImage: "https://picsum.photos/seed/ocean-carbon/900/500",
    quiz: {
      attached: true,
      questionCount: 2,
      questions: [
        { id: "q1", question: "What percentage of human CO2 emissions does the ocean absorb?", options: ["10%", "25%", "50%", "75%"], correctAnswer: "25%" },
        { id: "q2", question: "What is the term for the ocean becoming more acidic due to CO2?", options: ["Eutrophication", "Ocean acidification", "Bleaching", "Salinization"], correctAnswer: "Ocean acidification" },
      ],
    },
    reviewNote: null,
    reviewedBy: null,
    reviewedDate: null,
  },
  {
    id: "art_002",
    title: "The Forgotten History of the Mechanical Computer",
    author: "Thomas Okeke",
    category: "Technology",
    readTime: "7 min",
    submittedDate: "2026-08-09",
    status: "changes_requested",
    excerpt: "Long before silicon, engineers built computing machines out of gears and levers.",
    content:
      "Long before silicon, engineers built computing machines out of gears and levers. From Babbage's " +
      "Difference Engine to early relay computers, this is the story of computing before electronics.",
    coverImage: "https://picsum.photos/seed/mechanical-computer/900/500",
    quiz: {
      attached: true,
      questionCount: 1,
      questions: [
        { id: "q1", question: "Who designed the Difference Engine?", options: ["Alan Turing", "Charles Babbage", "Ada Lovelace", "John von Neumann"], correctAnswer: "Charles Babbage" },
      ],
    },
    reviewNote: "Please expand the section on ENIAC and add at least two credible references.",
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-11",
  },
  {
    id: "art_003",
    title: "Why Bees Navigate Using Polarized Light",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "6 min",
    submittedDate: "2026-08-12",
    status: "pending",
    excerpt: "Bees read the sky like a compass — here's the science behind it.",
    content:
      "Bees read the sky like a compass. Their eyes detect polarized light patterns invisible to us, " +
      "letting them navigate even under partly cloudy skies.",
    coverImage: "https://picsum.photos/seed/bees-light/900/500",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: null,
    reviewedBy: null,
    reviewedDate: null,
  },
  {
    id: "art_004",
    title: "Inside the Rise of Edge Computing",
    author: "Thomas Okeke",
    category: "Technology",
    readTime: "9 min",
    submittedDate: "2026-08-13",
    status: "pending",
    excerpt: "Why more computation is moving away from centralized data centers.",
    content:
      "Why more computation is moving away from centralized data centers, and what that means for " +
      "latency, privacy, and cost at scale.",
    coverImage: "https://picsum.photos/seed/edge-computing/900/500",
    quiz: {
      attached: true,
      questionCount: 3,
      questions: [
        { id: "q1", question: "Edge computing primarily reduces which of the following?", options: ["Storage cost", "Latency", "Code size", "Number of users"], correctAnswer: "Latency" },
        { id: "q2", question: "Edge computing moves processing closer to:", options: ["The cloud", "The data source", "The database", "The CDN"], correctAnswer: "The data source" },
        { id: "q3", question: "Which of these is a common edge computing use case?", options: ["Batch payroll processing", "Autonomous vehicle sensors", "Annual reporting", "Email archiving"], correctAnswer: "Autonomous vehicle sensors" },
      ],
    },
    reviewNote: null,
    reviewedBy: null,
    reviewedDate: null,
  },
  {
    id: "art_005",
    title: "10 Life Hacks Doctors Don't Want You to Know",
    author: "Lena Kaufmann",
    category: "Health",
    readTime: "4 min",
    submittedDate: "2026-08-01",
    status: "changes_requested",
    excerpt: "A listicle of home remedies that need proper sourcing before publishing.",
    content: "A listicle of home remedies that need proper sourcing before publishing.",
    coverImage: "https://picsum.photos/seed/life-hacks/900/500",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: "Please add citations for every medical claim before resubmitting.",
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-02",
  },
  {
    id: "art_006",
    title: "The Physics of a Perfect Free Kick",
    author: "Thomas Okeke",
    category: "Sports",
    readTime: "5 min",
    submittedDate: "2026-08-14",
    status: "pending",
    excerpt: "Magnus effect, spin rate, and the science behind a bending football.",
    content:
      "Magnus effect, spin rate, and the science behind a bending football. We break down the aerodynamics " +
      "that let strikers curl the ball around a defensive wall.",
    coverImage: "https://picsum.photos/seed/free-kick/900/500",
    quiz: {
      attached: true,
      questionCount: 2,
      questions: [
        { id: "q1", question: "What effect causes a football to curve in flight?", options: ["Doppler effect", "Magnus effect", "Coriolis effect", "Venturi effect"], correctAnswer: "Magnus effect" },
        { id: "q2", question: "Spin on the ball primarily affects:", options: ["Its color", "Its trajectory", "Its weight", "Its temperature"], correctAnswer: "Its trajectory" },
      ],
    },
    reviewNote: null,
    reviewedBy: null,
    reviewedDate: null,
  },
  {
    id: "art_007",
    title: "How Coral Reefs Repair Themselves",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "6 min",
    submittedDate: "2026-08-06",
    status: "published",
    excerpt: "Self-healing colonies and the microbes that help corals bounce back.",
    content: "Self-healing colonies and the microbes that help corals bounce back after bleaching events.",
    coverImage: "https://picsum.photos/seed/coral-reef/900/500",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: null,
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-07",
  },
  {
    id: "art_008",
    title: "A Short History of the Semicolon",
    author: "Lena Kaufmann",
    category: "Language",
    readTime: "5 min",
    submittedDate: "2026-08-03",
    status: "published",
    excerpt: "The punctuation mark everyone loves to argue about.",
    content: "The punctuation mark everyone loves to argue about, from its Venetian origins to modern coding style guides.",
    coverImage: "https://picsum.photos/seed/semicolon/900/500",
    quiz: {
      attached: true,
      questionCount: 1,
      questions: [
        { id: "q1", question: "The semicolon was popularized during which period?", options: ["Renaissance", "Middle Ages", "Industrial Revolution", "20th century"], correctAnswer: "Renaissance" },
      ],
    },
    reviewNote: null,
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-04",
  },
  {
    id: "art_009",
    title: "Miracle Detox Tea: Lose 10kg in a Week",
    author: "Lena Kaufmann",
    category: "Health",
    readTime: "3 min",
    submittedDate: "2026-07-20",
    status: "rejected",
    excerpt: "Unverified weight-loss claims with no scientific backing.",
    content: "Unverified weight-loss claims with no scientific backing and sponsored product placement throughout.",
    coverImage: "https://picsum.photos/seed/detox-tea/900/500",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: "Rejected — makes unsubstantiated health claims and reads as an undisclosed advertisement.",
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-07-21",
  },
  {
    id: "art_010",
    title: "5 Stocks Guaranteed to 10x This Year",
    author: "Thomas Okeke",
    category: "Finance",
    readTime: "4 min",
    submittedDate: "2026-07-15",
    status: "rejected",
    excerpt: "Speculative investment advice presented as guaranteed returns.",
    content: "Speculative investment advice presented as guaranteed returns, with no risk disclosure.",
    coverImage: "https://picsum.photos/seed/stocks/900/500",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: "Rejected — presents speculation as guaranteed financial advice, no risk disclaimer.",
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-07-16",
  },
];

export const getRawArticles = () => articles;
export const setRawArticles = (updated) => {
  articles = updated;
};
