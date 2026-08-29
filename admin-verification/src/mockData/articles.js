// mockData/articles.js
//
// DUMMY DATA ONLY — no database connection here.
// This array's shape is the CONTRACT with two other modules:
//   - Article/Blog Module   (Suhani Mulchandani)
//   - Quiz Module           (Mohammed Nihal Aziz)
//
// When their real APIs are ready, only services/adminService.js needs to
// change (swap the in-memory array for fetch calls). Every field name below
// should be confirmed with them so nothing breaks on merge.

let articles = [
  {
    id: "art_001",
    title: "What the Ocean Is Trying to Tell Us About Carbon",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "8 min",
    submittedDate: "2026-08-10",
    status: "pending", // pending | changes_requested | published | rejected
    excerpt:
      "The sea absorbs a quarter of all human CO2 emissions. What happens when it can no longer keep up?",
    content:
      "The sea absorbs a quarter of all human CO2 emissions. What happens when it can no longer keep up? " +
      "This piece walks through ocean acidification, carbon sinks, and what recent research says about the tipping point.",
    coverImage: "ocean-carbon.jpg",
    quiz: {
      attached: true,
      questionCount: 2,
      questions: [
        {
          id: "q1",
          question: "What percentage of human CO2 emissions does the ocean absorb?",
          options: ["10%", "25%", "50%", "75%"],
          correctAnswer: "25%",
        },
        {
          id: "q2",
          question: "What is the term for the ocean becoming more acidic due to CO2?",
          options: ["Eutrophication", "Ocean acidification", "Bleaching", "Salinization"],
          correctAnswer: "Ocean acidification",
        },
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
    excerpt:
      "Long before silicon, engineers built computing machines out of gears and levers.",
    content:
      "Long before silicon, engineers built computing machines out of gears and levers. From Babbage's " +
      "Difference Engine to early relay computers, this is the story of computing before electronics.",
    coverImage: "mechanical-computer.jpg",
    quiz: {
      attached: true,
      questionCount: 1,
      questions: [
        {
          id: "q1",
          question: "Who designed the Difference Engine?",
          options: ["Alan Turing", "Charles Babbage", "Ada Lovelace", "John von Neumann"],
          correctAnswer: "Charles Babbage",
        },
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
    submittedDate: "2026-08-05",
    status: "published",
    excerpt: "Bees read the sky like a compass — here's the science behind it.",
    content:
      "Bees read the sky like a compass. Their eyes detect polarized light patterns invisible to us, " +
      "letting them navigate even under partly cloudy skies.",
    coverImage: "bees-light.jpg",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote: null,
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-06",
  },
  {
    id: "art_004",
    title: "Inside the Rise of Edge Computing",
    author: "Thomas Okeke",
    category: "Technology",
    readTime: "9 min",
    submittedDate: "2026-08-02",
    status: "published",
    excerpt: "Why more computation is moving away from centralized data centers.",
    content:
      "Why more computation is moving away from centralized data centers, and what that means for " +
      "latency, privacy, and cost at scale.",
    coverImage: "edge-computing.jpg",
    quiz: {
      attached: true,
      questionCount: 2,
      questions: [
        {
          id: "q1",
          question: "Edge computing primarily reduces which of the following?",
          options: ["Storage cost", "Latency", "Code size", "Number of users"],
          correctAnswer: "Latency",
        },
        {
          id: "q2",
          question: "Edge computing moves processing closer to:",
          options: ["The cloud", "The data source", "The database", "The CDN"],
          correctAnswer: "The data source",
        },
      ],
    },
    reviewNote: null,
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-08-03",
  },
  {
    id: "art_005",
    title: "10 Life Hacks Doctors Don't Want You to Know",
    author: "Lena Kaufmann",
    category: "Health",
    readTime: "4 min",
    submittedDate: "2026-07-28",
    status: "rejected",
    excerpt: "A listicle of unverified home remedies.",
    content: "A listicle of unverified home remedies with no cited sources.",
    coverImage: "life-hacks.jpg",
    quiz: { attached: false, questionCount: 0, questions: [] },
    reviewNote:
      "The article does not meet our standards because it makes medical claims with no sources or citations.",
    reviewedBy: "Amara Silva",
    reviewedDate: "2026-07-29",
  },
];

// Exported as a function (not a live reference) so consumers always read the
// current in-memory state through adminService, never mutate this file directly.
export const getRawArticles = () => articles;
export const setRawArticles = (updated) => {
  articles = updated;
};
