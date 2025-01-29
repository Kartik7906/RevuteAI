const content = [
    {
      day: 1,
      article:
        "Introduction to BFSI: The Banking, Financial Services, and Insurance (BFSI) sector plays a pivotal role in the economy, encompassing services like retail banking, investment, insurance, and asset management. Understanding its key functions is crucial to navigating financial systems effectively.",
      quiz: [
        {
          question: "What does BFSI stand for?",
          options: [
            "Banking, Finance, Services, and Investment",
            "Banking, Financial Services, and Insurance",
            "Business, Finance, Services, and Insurance",
          ],
          answer: 1,
        },
        {
          question: "Which of the following is not part of BFSI?",
          options: ["Insurance", "Retail Banking", "Manufacturing"],
          answer: 2,
        },
        {
          question: "What is a primary function of the BFSI sector?",
          options: [
            "Providing healthcare services",
            "Facilitating financial transactions",
            "Producing goods",
          ],
          answer: 1,
        },
        {
          question: "Which service is included in BFSI?",
          options: ["Asset Management", "Agricultural Equipment", "Food Delivery"],
          answer: 0,
        },
        {
          question: "Why is BFSI important for the economy?",
          options: [
                "It regulates agricultural production",
                "It supports financial growth and stability",
                "It manages transportation services",
              ],
          answer: 1,
        },
      ],
    },
    {
      day: 2,
      article:
        "Retail Banking: Retail banking involves providing financial services directly to consumers, including savings and checking accounts, personal loans, mortgages, credit cards, and certificates of deposit (CDs). It is the foundation of consumer banking and essential for individual financial management.",
      quiz: [
        {
          question: "What is the primary focus of retail banking?",
          options: [
            "Corporate loans",
            "Individual financial services",
            "Investment banking",
            "Insurance underwriting",
          ],
          answer: 1,
        },
        {
          question: "Which of the following is a common product offered by retail banks?",
          options: [
            "Mergers and acquisitions",
            "Commercial real estate loans",
            "Savings accounts",
            "Private equity funds",
          ],
          answer: 2,
        },
        {
          question: "Retail banks typically serve which of the following clients?",
          options: [
            "Large corporations",
            "Government agencies",
            "Individual consumers",
            "Institutional investors",
          ],
          answer: 2,
        },
        {
          question: "Which service is NOT typically provided by retail banks?",
          options: [
            "Credit cards",
            "Personal loans",
            "Securities trading",
            "Mortgages",
          ],
          answer: 2,
        },
        {
          question: "Why are savings accounts important in retail banking?",
          options: [
            "They provide high returns on investment",
            "They offer liquidity and a safe place to store money",
            "They are used for international transactions",
          ],
          answer: 1,
        },
      ],
    },
    {
      day: 3,
      article:
        "Investment Banking: Investment banking focuses on helping organizations raise capital, providing advisory services for mergers and acquisitions, and offering strategic financial planning. Investment banks play a critical role in facilitating large financial transactions and market-making activities.",
      quiz: [
        {
          question: "What is a primary function of investment banks?",
          options: [
            "Issuing personal loans",
            "Underwriting securities",
            "Managing consumer savings",
            "Providing insurance policies",
          ],
          answer: 1,
        },
        {
          question: "Investment banks assist companies in raising capital through:",
          options: ["Retail banking services", "Securities underwriting", "Insurance underwriting", "Retail loans"],
          answer: 1,
        },
        {
          question: "Which of the following is a service typically offered by investment banks?",
          options: [
            "Personal checking accounts",
            "Mergers and acquisitions advisory",
            "Retail mortgages",
            "Savings accounts",
          ],
          answer: 1,
        },
        {
          question: "Investment banks often engage in which of the following activities?",
          options: ["Providing consumer credit", "Market-making and trading", "Issuing debit cards", "Offering personal insurance"],
          answer: 1,
        },
        {
          question: "Why are investment banks important for the economy?",
          options: [
            "They manage everyday consumer finances",
            "They facilitate large-scale financial transactions and capital formation",
            "They provide retail banking services",
          ],
          answer: 1,
        },
      ],
    },
    {
      day: 4,
      article:
        "Insurance Services: The insurance sector within BFSI offers risk management through various types of insurance products, including life, health, property, and casualty insurance. Insurance companies assess risks and provide financial protection against unforeseen events.",
      quiz: [
        {
          question: "What is the main purpose of insurance services?",
          options: [
            "To invest in the stock market",
            "To manage financial risks",
            "To provide loans",
            "To facilitate currency exchange",
          ],
          answer: 1,
        },
        {
          question: "Which type of insurance covers damage to property?",
          options: ["Life insurance", "Health insurance", "Property insurance", "Liability insurance"],
          answer: 2,
        },
        {
          question: "Health insurance primarily covers:",
          options: ["Vehicle accidents", "Medical expenses", "Home repairs", "Business liabilities"],
          answer: 1,
        },
        {
          question: "Life insurance provides financial protection in the event of:",
          options: ["Property damage", "Medical emergencies", "Death of the insured", "Job loss"],
          answer: 2,
        },
        {
          question: "Casualty insurance typically covers:",
          options: ["Life events", "Personal injuries and liability", "Property theft", "Investment losses"],
          answer: 1,
        },
      ],
    },
    {
      day: 5,
      article:
        "Asset Management: Asset management involves managing investments on behalf of clients, including individuals and institutions. Asset managers create diversified portfolios to achieve clients' financial goals, balancing risk and return through various investment vehicles.",
      quiz: [
        {
          question: "What is the primary role of asset management?",
          options: [
            "Issuing insurance policies",
            "Managing investment portfolios",
            "Providing personal loans",
            "Underwriting securities",
          ],
          answer: 1,
        },
        {
          question: "Asset managers aim to:",
          options: [
            "Minimize client investments",
            "Maximize returns while managing risks",
            "Provide retail banking services",
            "Offer insurance products",
          ],
          answer: 1,
        },
        {
          question: "Which of the following is an example of an investment vehicle used in asset management?",
          options: ["Savings accounts", "Mutual funds", "Personal loans", "Insurance policies"],
          answer: 1,
        },
        {
          question: "Asset management services are typically provided to:",
          options: [
            "Individual consumers only",
            "Large corporations only",
            "Both individuals and institutions",
            "Government agencies only",
          ],
          answer: 2,
        },
        {
          question: "Diversification in asset management helps to:",
          options: [
            "Increase investment risk",
            "Eliminate all risks",
            "Balance risk and return",
            "Focus on a single investment type",
          ],
          answer: 2,
        },
      ],
    },
    {
      day: 6,
      article:
        "Financial Technology (FinTech): FinTech refers to the integration of technology into financial services, enhancing efficiency, accessibility, and user experience. Innovations include digital banking, mobile payments, blockchain, and automated investment platforms, transforming traditional BFSI operations.",
      quiz: [
        {
          question: "What does FinTech stand for?",
          options: ["Financial Technology", "Finance and Technology", "Financial Techniques", "Financing Technology"],
          answer: 0,
        },
        {
          question: "Which of the following is a FinTech innovation?",
          options: ["Traditional savings accounts", "Mobile payment apps", "Physical bank branches", "Paper checks"],
          answer: 1,
        },
        {
          question: "Blockchain technology is primarily associated with:",
          options: ["Insurance underwriting", "Cryptocurrencies", "Retail banking", "Personal loans"],
          answer: 1,
        },
        {
          question: "Automated investment platforms are also known as:",
          options: ["Robo-advisors", "Human advisors", "Bank tellers", "Insurance agents"],
          answer: 0,
        },
        {
          question: "FinTech enhances financial services by:",
          options: [
            "Increasing manual processes",
            "Reducing accessibility",
            "Improving efficiency and user experience",
            "Eliminating online banking",
          ],
          answer: 2,
        },
      ],
    },
    {
      day: 7,
      article:
        "Risk Management in BFSI: Risk management is critical in BFSI to identify, assess, and mitigate financial risks. Effective risk management ensures the stability and sustainability of financial institutions by addressing credit risk, market risk, operational risk, and compliance risk.",
      quiz: [
        {
          question: "What is the primary goal of risk management in BFSI?",
          options: [
            "To maximize profits",
            "To identify and mitigate financial risks",
            "To provide loans",
            "To manage customer accounts",
          ],
          answer: 1,
        },
        {
          question: "Which of the following is a type of financial risk?",
          options: ["Market risk", "Customer service", "Product development", "Marketing risk"],
          answer: 0,
        },
        {
          question: "Credit risk refers to the risk of:",
          options: [
            "Market volatility",
            "Operational failures",
            "Borrowers defaulting on loans",
            "Regulatory changes",
          ],
          answer: 2,
        },
        {
          question: "Operational risk involves:",
          options: [
            "Investment losses",
            "Failures in internal processes",
            "Customer defaults",
            "Market fluctuations",
          ],
          answer: 1,
        },
        {
          question: "Compliance risk is associated with:",
          options: [
            "Adhering to laws and regulations",
            "Credit default",
            "Market unpredictability",
            "Technological failures",
          ],
          answer: 0,
        },
      ],
    },
  ];