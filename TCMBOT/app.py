import os
import random
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this import
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

# Behavior distribution configuration
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

# Load prompts and behaviors from CSV
prompts_file = "prompts.csv"
behavior_file = "Behavior.csv"
df_prompts = pd.read_csv(prompts_file)
df_behaviors = pd.read_csv(behavior_file)

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

@app.post("/api/send_message")
def send_message(request_data: SendMessageRequest):
    user_message = request_data.message
    context = request_data.context
    chat_history = request_data.chatHistory
    behavior = request_data.behavior

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