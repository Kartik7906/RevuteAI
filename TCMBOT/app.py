import os
import random
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("Groq_API")
HF_TOKEN = os.getenv("HF_TOKEN")
os.environ['HF_TOKEN'] = HF_TOKEN if HF_TOKEN else ""

# Behavior distribution configuration for telecalling
behavior_distribution = {
    "Polite Customer": 5,
    "Rude Customer": 5
    # Add new behaviors here with their call counts
    # "New Behavior": 3
}

def initialize_llm(api_key, retries=3):
    """Initialize Groq LLM with fallback to OpenAI."""
    for attempt in range(retries):
        try:
            return ChatGroq(groq_api_key=api_key, model="llama-3.3-70b-versatile")
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed to initialize Groq after {retries} attempts. Error: {str(e)}")
                openai_key = input("Enter OpenAI API key for fallback: ")
                if openai_key:
                    try:
                        return ChatOpenAI(api_key=openai_key)
                    except Exception as openai_error:
                        print(f"Failed to initialize OpenAI fallback. Error: {str(openai_error)}")
                        return None
    return None

# Initialize the LLM
llm = initialize_llm(GROQ_API_KEY)
if llm is None:
    raise Exception("Failed to initialize any language model")

# Load prompts, behaviors, and customers from CSV
prompts_file = "prompts.csv"
behavior_file = "Behavior.csv"
customer_file = "customer.csv"

df_prompts = pd.read_csv(prompts_file)
df_behaviors = pd.read_csv(behavior_file)

# Load customer data if file exists
try:
    df_customers = pd.read_csv(customer_file)
    print(f"Loaded {len(df_customers)} customer profiles from {customer_file}")
except Exception as e:
    print(f"Warning: Could not load customer file: {e}")
    df_customers = pd.DataFrame(columns=['Title', 'CustomerType'])

def validate_behavior_distribution():
    """Validate that behavior distribution matches available behaviors and total scenarios."""
    total_calls = sum(behavior_distribution.values())
    available_behaviors = set(df_behaviors['Type'].tolist())
    configured_behaviors = set(behavior_distribution.keys())

    if total_calls != len(df_prompts):
        print(f"Warning: Total calls ({total_calls}) doesn't match number of scenarios ({len(df_prompts)})")

    if not configured_behaviors.issubset(available_behaviors):
        invalid_behaviors = configured_behaviors - available_behaviors
        print(f"Warning: Invalid behaviors configured: {invalid_behaviors}")
        return False
    return True

def get_behavior_by_call_number(call_number):
    """Get behavior based on distribution configuration."""
    current_count = 0
    for behavior_type, count in behavior_distribution.items():
        if call_number < (current_count + count):
            behavior_row = df_behaviors[df_behaviors['Type'] == behavior_type]
            if not behavior_row.empty:
                return {
                    'type': behavior_type,
                    'behavior': behavior_row.iloc[0]['Behavior']
                }
        current_count += count
    return None

def get_random_scenario(used_scenarios=None):
    """Get a random scenario title from the prompts CSV, excluding used ones."""
    if used_scenarios is None:
        used_scenarios = []

    all_scenarios = df_prompts['Title'].tolist()
    available_scenarios = [s for s in all_scenarios if s not in used_scenarios]

    if not available_scenarios:
        return None
    return random.choice(available_scenarios)

def get_prompt_by_scenario(scenario_input: str):
    """Retrieve prompt details based on the provided scenario."""
    try:
        if not scenario_input:
            scenario_input = get_random_scenario()

        result = df_prompts[df_prompts['Title'].str.contains(scenario_input, case=False, na=False)]
        if not result.empty:
            row = result.iloc[0]
            return {
                'Title': row['Title'],
                'Scenario': row['Scenario'],
                'Example Conversation': row['Example Conversation'],
                'Keywords': row['Keywords']
            }
    except Exception as e:
        print(f"Error getting prompt: {str(e)}")
    return None

# Validate behavior distribution on startup
if not validate_behavior_distribution():
    raise Exception("Invalid behavior distribution configuration")

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, you can use "*" to allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class StartCallRequest(BaseModel):
    scenario: str = ""
    usedScenarios: list[str] = []

class SendMessageRequest(BaseModel):
    message: str
    context: str
    chatHistory: str
    behavior: str = ""

# New model for banking customer service
class StartCustomerCallRequest(BaseModel):
    customerTitle: str
    completedScenarios: list[str] = []

#################################
# Original Telecalling Endpoints
#################################

@app.get("/api/get_total_scenarios")
def get_total_scenarios():
    """Return total number of available scenarios and behavior distribution."""
    try:
        total = len(df_prompts)
        return {
            "total": total,
            "behaviorDistribution": behavior_distribution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/start_call")
def start_call(request_data: StartCallRequest):
    # Handle both old and new API formats
    used_scenarios = request_data.usedScenarios
    scenario_input = request_data.scenario
    
    call_number = len(used_scenarios)

    behavior_data = get_behavior_by_call_number(call_number)
    if behavior_data is None:
        raise HTTPException(status_code=500, detail="Failed to get behavior pattern")

    if not scenario_input:
        scenario_input = get_random_scenario(used_scenarios)
        if scenario_input is None:
            raise HTTPException(status_code=400, detail="No more unused scenarios available")

    prompt_details = get_prompt_by_scenario(scenario_input)
    if prompt_details is None:
        raise HTTPException(status_code=500, detail="Failed to get scenario prompt")

    context = (
        f"Title: {prompt_details['Title']}\n"
        f"Scenario: {prompt_details['Scenario']}\n"
        f"Example Conversation: {prompt_details['Example Conversation']}\n"
        f"Keywords: {prompt_details['Keywords']}"
    ).strip()

    return {
        "context": context,
        "customerGreeting": "Hello",
        "selectedScenario": prompt_details['Title'],
        "behavior": behavior_data['behavior'],
        "behaviorType": behavior_data['type']
    }

#################################
# New Banking Customer Endpoints
#################################

@app.get("/api/get_customers")
def get_customers():
    """Return all available customer types."""
    try:
        if df_customers.empty:
            raise HTTPException(status_code=404, detail="No customer profiles found")
        
        customers = []
        for index, row in df_customers.iterrows():
            # Extract a short description (first sentence or two) for the card display
            full_description = row['CustomerType']
            short_description = full_description.split('.')[0] + '.'

            customers.append({
                "title": row['Title'],
                "shortDescription": short_description,
                "fullDescription": full_description
            })

        return {
            "customers": customers,
            "totalCustomers": len(customers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/start_customer_call")
def start_customer_call(request_data: StartCustomerCallRequest):
    """Start a call with a banking customer."""
    # Get the selected customer title
    customer_title = request_data.customerTitle
    completed_scenarios = request_data.completedScenarios
    
    # Randomly select behavior (polite or rude)
    behavior_type = random.choice(df_behaviors['Type'].tolist())
    behavior_row = df_behaviors[df_behaviors['Type'] == behavior_type]

    if behavior_row.empty:
        raise HTTPException(status_code=500, detail="Failed to get behavior pattern")

    behavior_data = {
        'type': behavior_type,
        'behavior': behavior_row.iloc[0]['Behavior']
    }

    # Get customer details
    customer_row = df_customers[df_customers['Title'] == customer_title]

    if customer_row.empty:
        raise HTTPException(status_code=400, detail="Customer type not found")

    customer_details = {
        'Title': customer_row.iloc[0]['Title'],
        'CustomerType': customer_row.iloc[0]['CustomerType']
    }

    context = (
        f"Title: {customer_details['Title']}\n"
        f"CustomerType: {customer_details['CustomerType']}"
    ).strip()

    # Generate a greeting based on customer type and behavior
    customer_type = customer_details['CustomerType'].lower()
    behavior_type_lower = behavior_data['type'].lower()

    if "polite" in behavior_type_lower:
        if "new account" in customer_type or "first-time" in customer_type:
            greeting = "Hi there, I'm interested in opening an account with your bank. Could you tell me about your options?"
        elif "premium" in customer_type:
            greeting = "Hello, I'm calling about my premium account. I've been a customer for several years now."
        elif "digital banking" in customer_type:
            greeting = "Hi, I'm having trouble with your mobile banking app. Can you help me fix it?"
        elif "credit card applicant" in customer_type:
            greeting = "Hello, I'm looking at your credit card options and had a few questions about the rewards program."
        elif "dissatisfied" in customer_type:
            greeting = "Hi, um, I've been having some issues with my credit card charges. I've called a few times already."
        elif "overdraft" in customer_type:
            greeting = "Hi, I just noticed an overdraft fee on my account. I'm a bit confused about how this happened."
        elif "mortgage" in customer_type:
            greeting = "Hello, I'm interested in learning about your mortgage options. I'm planning to buy my first home."
        else:
            greeting = "Hi there, I was hoping to get some help with my banking needs today."
    else:  # Rude customer
        if "new account" in customer_type or "first-time" in customer_type:
            greeting = "Yeah, I'm looking to open an account. What's the minimum deposit you require?"
        elif "premium" in customer_type:
            greeting = "Look, I'm a premium account holder and I need some answers quickly. I don't have all day."
        elif "digital banking" in customer_type:
            greeting = "Your app keeps crashing whenever I try to make a transfer. This is really frustrating!"
        elif "credit card applicant" in customer_type:
            greeting = "These APR rates on your website - are they the best you can do? I'm seeing better deals elsewhere."
        elif "dissatisfied" in customer_type:
            greeting = "This is the third time I'm calling about these mysterious charges on my card! When will this be fixed?"
        elif "overdraft" in customer_type:
            greeting = "I just got hit with an overdraft fee and I want it removed immediately. This is ridiculous!"
        elif "mortgage" in customer_type:
            greeting = "Your mortgage rates are higher than what I saw advertised. I need to know why there's such a difference."
        else:
            greeting = "Finally! I've been waiting forever to speak with someone. I need help with my account right now."

    return {
        "context": context,
        "customerGreeting": greeting,
        "selectedCustomer": customer_details['Title'],
        "behavior": behavior_data['behavior'],
        "behaviorType": behavior_data['type']
    }

#################################
# Shared Message Handling
#################################

@app.post("/api/send_message")
def send_message(request_data: SendMessageRequest):
    """Handle messages for both telecalling and banking customers."""
    user_message = request_data.message
    context = request_data.context
    chat_history = request_data.chatHistory
    behavior = request_data.behavior

    # Determine if this is a banking customer or telecalling scenario
    is_banking = "CustomerType:" in context
    
    if is_banking:
        system_prompt_template = (
            "You are a real customer in a phone conversation. Keep your responses SHORT and NATURAL like in a real phone call.\n\n"
            "CUSTOMER DETAILS:\n"
            "{context}\n\n"
            "BEHAVIOR PATTERN:\n"
            "{behavior}\n\n"
            "INSTRUCTIONS:\n"
            "1. Keep responses brief and conversational (20-50 words maximum)\n"
            "2. Use natural speech patterns with filler words (um, uh, well, hmm)\n"
            "3. Ask one question at a time, not multiple questions\n"
            "4. Respond directly to what the agent just said\n"
            "5. Don't provide all information at once - reveal details gradually as the conversation progresses\n"
            "6. If the agent resolves your issues completely, naturally end the conversation with a brief thank you and goodbye\n"
            "7. Show natural impatience or satisfaction depending on how well your needs are being met\n\n"
            "CONVERSATION PROGRESSION:\n"
            "- Start with your initial concern\n"
            "- Ask clarifying questions about solutions\n"
            "- Express satisfaction or dissatisfaction with proposed solutions\n"
            "- End the call naturally when your issue is resolved (thank you, goodbye, etc.)\n\n"
            "CONVERSATION HISTORY:\n"
            "{chat_history}\n\n"
            "CURRENT MESSAGE FROM AGENT:\n"
            "{input}\n\n"
            "Respond briefly and naturally as a real customer would on a phone call. If your issue is fully resolved, end the conversation politely."
        ).strip()
    else:
        system_prompt_template = (
            "You are an AI simulating a customer in a telecalling scenario.\n\n"
            "SCENARIO CONTEXT:\n"
            "{context}\n\n"
            "BEHAVIOR PATTERN:\n"
            "{behavior}\n\n"
            "INSTRUCTIONS:\n"
            "1. Follow the scenario context to understand the situation and background\n"
            "2. Adopt the specified behavior pattern in your responses\n"
            "3. Maintain consistency with both the scenario and behavior throughout the conversation\n"
            "4. Keep responses natural and realistic while exhibiting the assigned traits\n"
            "5. Pay attention to the conversation history for context\n\n"
            "CONVERSATION HISTORY:\n"
            "{chat_history}\n\n"
            "CURRENT MESSAGE FROM AGENT:\n"
            "{input}\n\n"
            "Respond as the customer, ensuring your response aligns with both the scenario context and behavior pattern."
        ).strip()

    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt_template)
    ])

    # Compose the conversation chain by combining the prompt template with the LLM
    conversation_chain = chat_prompt | llm

    try:
        response_obj = conversation_chain.invoke({
            "input": user_message,
            "context": context,
            "chat_history": chat_history,
            "behavior": behavior
        })
        response = response_obj.content if hasattr(response_obj, "content") else str(response_obj)
        return {"response": response.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI app with auto-reload enabled.
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)