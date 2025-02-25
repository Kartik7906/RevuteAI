const modulesData = [
  {
    id: 1,
    title: "Soft Skills",
    description: "Essential soft skills for communication and collaboration.",
    moduleContent: "Overview of essential soft skills for success.",
    subItems: [
      {
        name: "Grammar",
        content: "Key grammar rules for clear communication.",
        topics: [
          { name: "Parts of Speech", content: "Overview of parts of speech." },
          { name: "Tenses", content: "Explanation of verb tenses." },
          {
            name: "Sentence Structure & Punctuation",
            content: "Guide to sentence structure and punctuation."
          },
          {
            name: "Professional Vocabulary",
            content: "Tips for building a professional vocabulary."
          }
        ]
      },
      {
        name: "Grammar test",
        content: {
          quiz: [
            {
              type: "qna",
              question: "Explain the use of past tense in a sentence.",
              answer: "Expected key points on past tense usage."
            },
            {
              type: "qna",
              question: "Give an example of a compound sentence.",
              answer: "Expected answer with a compound sentence."
            }
          ]
        }
      },
      {
        name: "Communication",
        content: "Essentials of effective communication.",
        topics: [
          {
            name: "Definition and Scope",
            content: "Definition and scope of communication."
          },
          {
            name: "Reading",
            content: "Importance of reading for comprehension."
          },
          { name: "Writing", content: "Basics of professional writing." },
          { name: "Listening", content: "Strategies for active listening." },
          {
            name: "Speaking",
            content: "Tips for effective speaking in various settings."
          },
          {
            name: "Attire",
            content: "Role of attire in non-verbal communication."
          },
          {
            name: "Persuasion Technique",
            content: "Overview of persuasion techniques."
          },
          {
            name: "Phone Etiquette",
            content: "Guide to professional phone etiquette."
          }
        ]
      },
      {
        name: "Communication test",
        content: {
          quiz: [
            {
              type: "qna",
              question: "What are the key elements of effective communication?",
              answer: "Clear points on communication elements."
            },
            {
              type: "qna",
              question: "How do you introduce yourself professionally?",
              answer: "A proper introduction format."
            }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: "Sales Personal Skills",
    description: "Essential personal skills for sales performance.",
    moduleContent: "Overview of key sales personal skills.",
    subItems: [
      {
        name: "Introduction to Sales",
        content: "Introduction to sales fundamentals.",
        topics: [
          {
            name: "Sales Vs. Marketing",
            content: "Contrast between sales and marketing."
          },
          {
            name: "Role of a Sales-person",
            content: "Role and responsibilities of a sales-person."
          }
        ]
      },
      {
        name: "Introduction to Sales test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Handling Objections",
        content: "Techniques for handling sales objections.",
        topics: [
          {
            name: "Building Rapport and Trust",
            content: "Building rapport and trust with customers."
          },
          {
            name: "Customer Pain Points and Trust Indicators",
            content: "Identifying customer pain points."
          },
          {
            name: "Conflict Resolution",
            content: "Approaches to conflict resolution."
          },
          {
            name: "Case Studies",
            content: "Real-world case studies in sales."
          }
        ]
      },
      {
        name: "Handling Objections test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Negotiation Skills",
        content: "Fundamentals of negotiation skills.",
        topics: [
          {
            name: "Emotional Intelligence",
            content: "Role of emotional intelligence in negotiations."
          },
          {
            name: "Decision Making",
            content: "Strategies for effective decision making."
          },
          {
            name: "Value Creation",
            content: "Methods for creating value in negotiations."
          }
        ]
      },
      {
        name: "Negotiation Skills test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Tools and Framework",
        content: "Overview of sales tools and frameworks.",
        topics: [
          { name: "CRM Tool", content: "Guide to CRM tools." },
          {
            name: "Lead Generation & Prospecting Techniques",
            content: "Techniques for lead generation and prospecting."
          },
          {
            name: "Customer Profiling & Segmentation",
            content: "Overview of customer profiling and segmentation."
          },
          {
            name: "Pipeline Management",
            content: "Essentials of pipeline management."
          },
          { name: "AIDA", content: "Summary of the AIDA model." },
          { name: "SPIN", content: "Introduction to SPIN selling." },
          { name: "BANT", content: "Overview of the BANT framework." }
        ]
      },
      {
        name: "Tools and Framework test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Problem-Solving & Resilience",
        content: "Techniques for problem-solving and resilience.",
        topics: [
          {
            name: "Syllogisms",
            content: "Basics of syllogisms in logical reasoning."
          },
          {
            name: "Statement and Assumptions",
            content: "Differentiating facts from assumptions."
          },
          {
            name: "Statement and Conclusions",
            content: "Strategies for drawing logical conclusions."
          },
          {
            name: "Cause and Effect",
            content: "Understanding cause and effect in sales."
          },
          {
            name: "Case Studies",
            content: "Real-world examples of problem-solving."
          }
        ]
      },
      {
        name: "Problem-Solving & Resilience test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Time Management",
        content: "Practical time management strategies.",
        topics: [
          {
            name: "How to: Set goals & Plan your day",
            content: "Step-by-step guide to effective time management."
          }
        ]
      },
      {
        name: "Time Management test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Advanced Sales Techniques",
        content: "Overview of advanced sales strategies.",
        topics: [
          {
            name: "B2B and B2C Sales",
            content: "Key differences between B2B and B2C sales."
          },
          {
            name: "Post-Sale Relationship",
            content: "Strategies for maintaining post-sale relationships."
          },
          {
            name: "Win-Win Solutions",
            content: "Techniques for achieving win-win sales solutions."
          }
        ]
      },
      {
        name: "Advanced Sales Techniques test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      }
    ]
  },
  {
    id: 3,
    title: "Product Knowledge",
    description: "In-depth knowledge of BFSI products and services.",
    moduleContent: "Overview of BFSI products, services, and regulations.",
    subItems: [
      {
        name: "Foundation to BFSI",
        content: "Introduction to BFSI roles and regulations.",
        topics: [
          { name: "Bank", content: "Overview of banks and their services." },
          {
            name: "Financial Institution",
            content: "Overview of financial institutions."
          },
          { name: "Insurance", content: "Basics of insurance products." },
          {
            name: "Fintech",
            content: "Introduction to fintech and digital transformation."
          },
          {
            name: "Regulatory Bodies of BFSI",
            content: "Role of regulatory bodies in BFSI."
          }
        ]
      },
      {
        name: "Foundation to BFSI test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Key Instruments of BFSI",
        content: "Overview of key instruments and documents in BFSI.",
        topics: [
          { name: "KYC/ e-KYC Form", content: "Importance of KYC forms." },
          {
            name: "Account Opening Form",
            content: "Role of account opening forms."
          },
          {
            name: "Securities and Loan Processing Document",
            content: "Overview of securities and loan documents."
          },
          {
            name: "Key Terminologies",
            content: "Guide to key BFSI terminologies."
          },
          {
            name: "Interest Rates",
            content: "Basics of interest rates in finance."
          }
        ]
      },
      {
        name: "Key Instruments of BFSI test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      },
      {
        name: "Products and Services of BFSI",
        content: "Overview of BFSI products and services.",
        topics: [
          {
            name: "SB, CB Account",
            content: "Differences between SB and CB accounts."
          },
          {
            name: "Credit Card",
            content: "How credit cards work and benefits."
          },
          { name: "Fixed Deposit", content: "Overview of fixed deposits." },
          {
            name: "Recurring Deposit",
            content: "Basics of recurring deposits."
          },
          { name: "Personal Loan", content: "Overview of personal loans." },
          { name: "Home Loan", content: "Key aspects of home loans." },
          { name: "Gold Loan", content: "Introduction to gold loans." },
          { name: "Auto Loan", content: "Essentials of auto loans." },
          {
            name: "Crop/ Agriculture Loan",
            content: "Overview of agriculture loans."
          },
          { name: "Top-up Loan", content: "Guide to top-up loans." }
        ]
      },
      {
        name: "Products and Services of BFSI test",
        content: {
          quiz: [
            { type: "mcq", question: "Sample Q1", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q2", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q3", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q4", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q5", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q6", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q7", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q8", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q9", options: ["Option1","Option2","Option3","Option4"], answer: 0 },
            { type: "mcq", question: "Sample Q10", options: ["Option1","Option2","Option3","Option4"], answer: 0 }
          ]
        }
      }
    ]
  }
];
export default modulesData;
